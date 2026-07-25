import { useState } from 'react';
import { Card, Button } from '../components/UI.jsx';
import { KeyRound, Lock, Unlock, ShieldCheck, Trash2 } from 'lucide-react';
import { hasKey } from '../services/ai.js';
import { encryptKey, unlockKey, hasEncrypted, getSessionKey, forgetKey } from '../services/secureKey.js';

const envKey = !!import.meta.env.VITE_ANTHROPIC_API_KEY;

export default function SettingsTab() {
  const [key, setKey] = useState('');
  const [pass, setPass] = useState('');
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');
  const [, force] = useState(0);
  const refresh = () => force((n) => n + 1);

  const save = async () => {
    setErr(''); setMsg('');
    if (!key.startsWith('sk-ant-')) { setErr('المفتاح يجب أن يبدأ بـ sk-ant-'); return; }
    if (pass.length < 4) { setErr('اختر كلمة مرور 4 أحرف على الأقل.'); return; }
    try { await encryptKey(key.trim(), pass); setKey(''); setPass(''); setMsg('تم حفظ المفتاح مشفّراً وفتحه لهذه الجلسة.'); refresh(); }
    catch (e) { setErr('تعذّر التشفير: ' + e.message); }
  };
  const unlock = async () => {
    setErr(''); setMsg('');
    try { await unlockKey(pass); setPass(''); setMsg('تم فك القفل لهذه الجلسة.'); refresh(); }
    catch (e) { setErr(e.message); }
  };
  const forget = () => { forgetKey(); setMsg('حُذف المفتاح المشفّر.'); refresh(); };

  const unlocked = !!getSessionKey();
  const encrypted = hasEncrypted();

  return (
    <div className="fade-in flex flex-col gap-4">
      {/* الحالة */}
      <Card>
        <div className="mb-2 flex items-center gap-2 text-brand"><ShieldCheck size={18} /><p className="text-sm font-bold">حالة المفتاح</p></div>
        <p className="text-sm">
          {envKey ? '✅ مفتاح من ملف .env (وضع التطوير).' :
           unlocked ? '🔓 المفتاح مفكوك وجاهز لهذه الجلسة.' :
           encrypted ? '🔒 يوجد مفتاح مشفّر — أدخل كلمة المرور لفكّه.' :
           '⚠️ لا يوجد مفتاح — احفظ مفتاحك أدناه.'}
        </p>
        <p className="mt-1 text-xs text-slate-500">التحليل {hasKey() ? 'جاهز للعمل ✅' : 'يحتاج مفتاحاً ⚠️'}</p>
      </Card>

      {!envKey && (
        <>
          {/* فك القفل إن وُجد مفتاح مشفّر */}
          {encrypted && !unlocked && (
            <Card>
              <div className="mb-2 flex items-center gap-2 text-brand"><Unlock size={17} /><p className="text-sm font-bold">فك القفل</p></div>
              <input type="password" value={pass} onChange={(e) => setPass(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && unlock()}
                placeholder="كلمة المرور" className="mb-3 w-full rounded-lg border px-3 py-2 text-sm surface outline-none focus:border-brand" />
              <Button onClick={unlock} disabled={!pass}><Unlock size={16} /> فك القفل</Button>
            </Card>
          )}

          {/* حفظ مفتاح جديد مشفّر */}
          <Card>
            <div className="mb-2 flex items-center gap-2 text-brand"><Lock size={17} /><p className="text-sm font-bold">حفظ مفتاح مشفّر</p></div>
            <p className="mb-3 text-xs text-slate-500">
              يُخزَّن المفتاح مشفّراً (AES-GCM) بكلمة مرورك، ولا يُحفظ كنص عادي أبداً. يُفكّ في الذاكرة لهذه الجلسة فقط.
            </p>
            <input type="password" value={key} onChange={(e) => setKey(e.target.value)} placeholder="sk-ant-api03-..."
              className="mb-2 w-full rounded-lg border px-3 py-2 text-sm surface outline-none focus:border-brand" />
            <input type="password" value={pass} onChange={(e) => setPass(e.target.value)} placeholder="كلمة مرور للحماية"
              className="mb-3 w-full rounded-lg border px-3 py-2 text-sm surface outline-none focus:border-brand" />
            <div className="flex gap-2">
              <Button onClick={save} disabled={!key || !pass}><Lock size={16} /> حفظ مشفّراً</Button>
              {encrypted && <button onClick={forget} className="flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm text-red-500 surface hover:bg-red-500/10"><Trash2 size={15} /> حذف</button>}
            </div>
          </Card>
        </>
      )}

      {msg && <Card className="text-sm text-green-600">{msg}</Card>}
      {err && <Card className="text-sm text-red-500">{err}</Card>}
    </div>
  );
}
