import { useState } from 'react';
import { Card, Button } from '../components/UI.jsx';
import { KeyRound, Lock, Unlock, ShieldCheck, Trash2 } from 'lucide-react';
import { hasKey } from '../services/ai.js';
import { encryptKey, unlockKey, hasEncrypted, getSessionKey, forgetKey } from '../services/secureKey.js';
import { useApp } from '../store/AppContext.jsx';

const envKey = !!import.meta.env.VITE_ANTHROPIC_API_KEY;

export default function SettingsTab() {
  const { L } = useApp();
  const [key, setKey] = useState('');
  const [pass, setPass] = useState('');
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');
  const [, force] = useState(0);
  const refresh = () => force((n) => n + 1);

  const save = async () => {
    setErr(''); setMsg('');
    if (!key.startsWith('sk-ant-')) { setErr(L('المفتاح يجب أن يبدأ بـ sk-ant-','Key must start with sk-ant-')); return; }
    if (pass.length < 4) { setErr(L('اختر كلمة مرور 4 أحرف على الأقل.','Choose a password of at least 4 characters.')); return; }
    try { await encryptKey(key.trim(), pass); setKey(''); setPass(''); setMsg(L('تم حفظ المفتاح مشفّراً وفتحه لهذه الجلسة.','Key saved encrypted and unlocked for this session.')); refresh(); }
    catch (e) { setErr(L('تعذّر التشفير: ','Encryption failed: ') + e.message); }
  };
  const unlock = async () => {
    setErr(''); setMsg('');
    try { await unlockKey(pass); setPass(''); setMsg(L('تم فك القفل لهذه الجلسة.','Unlocked for this session.')); refresh(); }
    catch (e) { setErr(e.message); }
  };
  const forget = () => { forgetKey(); setMsg(L('حُذف المفتاح المشفّر.','Encrypted key deleted.')); refresh(); };

  const unlocked = !!getSessionKey();
  const encrypted = hasEncrypted();

  return (
    <div className="fade-in flex flex-col gap-4">
      {/* الحالة */}
      <Card>
        <div className="mb-2 flex items-center gap-2 text-brand"><ShieldCheck size={18} /><p className="text-sm font-bold">{L('حالة المفتاح','Key status')}</p></div>
        <p className="text-sm">
          {envKey ? L('✅ مفتاح من ملف .env (وضع التطوير).','✅ Key from .env (dev mode).') :
           unlocked ? L('🔓 المفتاح مفكوك وجاهز لهذه الجلسة.','🔓 Key unlocked and ready for this session.') :
           encrypted ? L('🔒 يوجد مفتاح مشفّر — أدخل كلمة المرور لفكّه.','🔒 An encrypted key exists — enter the password to unlock it.') :
           L('⚠️ لا يوجد مفتاح — احفظ مفتاحك أدناه.','⚠️ No key — save your key below.')}
        </p>
        <p className="mt-1 text-xs text-slate-500">{L('التحليل','Analysis')} {hasKey() ? L('جاهز للعمل ✅','ready ✅') : L('يحتاج مفتاحاً ⚠️','needs a key ⚠️')}</p>
      </Card>

      {!envKey && (
        <>
          {/* فك القفل إن وُجد مفتاح مشفّر */}
          {encrypted && !unlocked && (
            <Card>
              <div className="mb-2 flex items-center gap-2 text-brand"><Unlock size={17} /><p className="text-sm font-bold">{L('فك القفل','Unlock')}</p></div>
              <input type="password" value={pass} onChange={(e) => setPass(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && unlock()}
                placeholder={L('كلمة المرور','Password')} className="mb-3 w-full rounded-lg border px-3 py-2 text-sm surface outline-none focus:border-brand" />
              <Button onClick={unlock} disabled={!pass}><Unlock size={16} /> {L('فك القفل','Unlock')}</Button>
            </Card>
          )}

          {/* حفظ مفتاح جديد مشفّر */}
          <Card>
            <div className="mb-2 flex items-center gap-2 text-brand"><Lock size={17} /><p className="text-sm font-bold">{L('حفظ مفتاح مشفّر','Save encrypted key')}</p></div>
            <p className="mb-3 text-xs text-slate-500">
              {L('يُخزَّن المفتاح مشفّراً (AES-GCM) بكلمة مرورك، ولا يُحفظ كنص عادي أبداً. يُفكّ في الذاكرة لهذه الجلسة فقط.','The key is stored encrypted (AES-GCM) with your password, never in plain text. Unlocked in memory for this session only.')}
            </p>
            <input type="password" value={key} onChange={(e) => setKey(e.target.value)} placeholder="sk-ant-api03-..."
              className="mb-2 w-full rounded-lg border px-3 py-2 text-sm surface outline-none focus:border-brand" />
            <input type="password" value={pass} onChange={(e) => setPass(e.target.value)} placeholder={L('كلمة مرور للحماية','Protection password')}
              className="mb-3 w-full rounded-lg border px-3 py-2 text-sm surface outline-none focus:border-brand" />
            <div className="flex gap-2">
              <Button onClick={save} disabled={!key || !pass}><Lock size={16} /> {L('حفظ مشفّراً','Save encrypted')}</Button>
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
