// تأمين المفتاح: تشفير AES-GCM بكلمة مرور (Web Crypto) — يعمل في المتصفح ونافذة Tauri.
// المفتاح لا يُخزَّن أبداً كنص عادي؛ يُخزَّن مشفّراً ويُفك في الذاكرة للجلسة فقط.
let sessionKey = ''; // المفتاح المفكوك في الذاكرة (يزول عند التحديث)
const STORE = 'encKeyV1';

export const setSessionKey = (k) => { sessionKey = k || ''; };
export const getSessionKey = () => sessionKey;
export const hasEncrypted = () => !!localStorage.getItem(STORE);

const enc = new TextEncoder();
const dec = new TextDecoder();
const b64 = (buf) => btoa(String.fromCharCode(...new Uint8Array(buf)));
const unb64 = (s) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0));

async function deriveKey(pass, salt) {
  const base = await crypto.subtle.importKey('raw', enc.encode(pass), 'PBKDF2', false, ['deriveKey']);
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt, iterations: 150000, hash: 'SHA-256' },
    base, { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']
  );
}

export async function encryptKey(apiKey, pass) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveKey(pass, salt);
  const ct = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, enc.encode(apiKey));
  localStorage.setItem(STORE, JSON.stringify({ salt: b64(salt), iv: b64(iv), ct: b64(ct) }));
  sessionKey = apiKey;
}

export async function unlockKey(pass) {
  const raw = localStorage.getItem(STORE);
  if (!raw) throw new Error('لا يوجد مفتاح مشفّر محفوظ.');
  const { salt, iv, ct } = JSON.parse(raw);
  const key = await deriveKey(pass, unb64(salt));
  try {
    const pt = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: unb64(iv) }, key, unb64(ct));
    sessionKey = dec.decode(pt);
    return sessionKey;
  } catch { throw new Error('كلمة المرور غير صحيحة.'); }
}

export function forgetKey() { sessionKey = ''; localStorage.removeItem(STORE); }
