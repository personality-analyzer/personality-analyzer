// طبقة استدعاء Claude الوحيدة — مع تأمين المفتاح، إعادة المحاولة، وضغط الصور.
import { getSessionKey } from './secureKey.js';

const API_URL = 'https://api.anthropic.com/v1/messages';
const DEFAULT_MODEL = 'claude-haiku-4-5-20251001';

function getKey() {
  return (
    import.meta.env.VITE_ANTHROPIC_API_KEY || // وضع التطوير فقط
    getSessionKey() ||                          // مفتاح مشفّر مفكوك للجلسة
    ''
  );
}
export function hasKey() { return !!getKey(); }

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// طلب أساسي مع إعادة المحاولة عند حدود الاستهلاك (429) أو الحمل (529)
async function request(body, { retries = 3 } = {}) {
  const key = getKey();
  if (!key) throw new Error('لا يوجد مفتاح API. أضِفه من الإعدادات أو ملف .env.');
  let attempt = 0;
  while (true) {
    let res;
    try {
      res = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': key,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true',
        },
        body: JSON.stringify(body),
      });
    } catch (e) {
      if (attempt++ < retries) { await sleep(800 * attempt); continue; }
      throw new Error('خطأ في الشبكة — تحقّق من الاتصال.');
    }
    if ((res.status === 429 || res.status === 529 || res.status >= 500) && attempt < retries) {
      const ra = parseFloat(res.headers.get('retry-after')) || 0;
      attempt++;
      await sleep(ra ? ra * 1000 : 1000 * Math.pow(2, attempt)); // تراجع أُسّي
      continue;
    }
    const data = await res.json().catch(() => ({}));
    if (data.error) {
      if (res.status === 429) throw new Error('تم تجاوز حد الاستهلاك مؤقتاً — أعد المحاولة بعد قليل.');
      throw new Error(data.error.message || 'خطأ في الـ API');
    }
    return (data.content || []).map((c) => (c.type === 'text' ? c.text : '')).join('\n').trim();
  }
}

export async function analyze({ system, content, model = DEFAULT_MODEL, maxTokens = 1500 }) {
  const body = { model, max_tokens: maxTokens, messages: [{ role: 'user', content }] };
  if (system) body.system = system;
  return request(body);
}

export async function chatCompletion({ system, messages, model = DEFAULT_MODEL, maxTokens = 1200 }) {
  const body = { model, max_tokens: maxTokens, messages };
  if (system) body.system = system;
  return request(body);
}

export const fileToBase64 = (file) =>
  new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result).split(',')[1]);
    r.onerror = reject;
    r.readAsDataURL(file);
  });

// ضغط الصورة: تصغير لأقصى بُعد + JPEG لتقليل التكلفة وتسريع الإرسال
export function compressImage(file, maxDim = 1280, quality = 0.82) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const im = new Image();
    im.onload = () => {
      let { width, height } = im;
      if (width > maxDim || height > maxDim) {
        const s = maxDim / Math.max(width, height);
        width = Math.round(width * s); height = Math.round(height * s);
      }
      const c = document.createElement('canvas');
      c.width = width; c.height = height;
      c.getContext('2d').drawImage(im, 0, 0, width, height);
      URL.revokeObjectURL(url);
      const dataUrl = c.toDataURL('image/jpeg', quality);
      resolve({ dataUrl, b64: dataUrl.split(',')[1], type: 'image/jpeg' });
    };
    im.onerror = reject;
    im.src = url;
  });
}
