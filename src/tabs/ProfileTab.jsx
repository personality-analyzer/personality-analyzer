import { ClipboardList, Check, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Card } from '../components/UI.jsx';
import { useApp } from '../store/AppContext.jsx';

const FIELDS = [
  { k: 'name', label: 'الاسم', en: 'Name', type: 'text', ph: 'اسم صاحب التقييم' },
  { k: 'age', label: 'العمر', en: 'Age', type: 'number', ph: 'بالسنوات' },
  { k: 'gender', label: 'الجنس', en: 'Gender', type: 'select', opts: ['', 'ذكر', 'أنثى'] },
  { k: 'height', label: 'الطول (سم)', en: 'Height (cm)', type: 'number', ph: 'مثال: 175' },
  { k: 'weight', label: 'الوزن (كجم)', en: 'Weight (kg)', type: 'number', ph: 'مثال: 70' },
  { k: 'health', label: 'الحالة الصحية', en: 'Health', type: 'text', ph: 'أمراض مزمنة، حساسية… (اختياري)' },
];

export default function ProfileTab() {
  const { profile, updateProfile, clearProfile, includeProfile, setIncludeProfile, L } = useApp();
  const [saved, setSaved] = useState(false);
  const set = (k, v) => { updateProfile({ [k]: v }); setSaved(true); setTimeout(() => setSaved(false), 1200); };

  return (
    <div className="fade-in flex flex-col gap-4">
      <Card>
        <div className="mb-1 flex items-center gap-2 text-brand"><ClipboardList size={18} /><p className="text-sm font-bold">{L('المعلومات الشخصية','Personal Info')}</p></div>
        <p className="text-xs text-slate-500">{L('تُحفظ تلقائياً وتُربط بكل التحاليل. الاسم يُستخدم كمعرّف للملف الموحّد.','Saved automatically and linked to all analyses. The name identifies the unified profile.')}</p>
      </Card>

      <Card className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {FIELDS.map((f) => (
          <div key={f.k}>
            <label className="mb-1 block text-xs font-bold text-slate-500">{L(f.label, f.en)}</label>
            {f.type === 'select' ? (
              <select value={profile[f.k] || ''} onChange={(e) => set(f.k, e.target.value)}
                className="w-full rounded-lg border px-3 py-2 text-sm surface outline-none focus:border-brand">
                {f.opts.map((o) => <option key={o} value={o}>{o || 'غير محدّد'}</option>)}
              </select>
            ) : (
              <input type={f.type} value={profile[f.k] || ''} onChange={(e) => set(f.k, e.target.value)} placeholder={f.ph}
                className="w-full rounded-lg border px-3 py-2 text-sm surface outline-none focus:border-brand" />
            )}
          </div>
        ))}
        <div className="sm:col-span-2">
          <label className="mb-1 block text-xs font-bold text-slate-500">{L('ملاحظات إضافية','Additional notes')}</label>
          <textarea value={profile.notes || ''} onChange={(e) => set('notes', e.target.value)} rows={3} placeholder="أي معلومات أخرى مفيدة للتحليل…"
            className="w-full rounded-lg border px-3 py-2 text-sm surface outline-none focus:border-brand" />
        </div>
      </Card>

      <Card className="flex items-center justify-between">
        <div>
          <p className="text-sm font-bold">{L('إظهار المعلومات في التقرير الشامل','Show info in full report')}</p>
          <p className="text-xs text-slate-500">عند تفعيله، تظهر بطاقة المعلومات في أعلى التقرير المُصدَّر.</p>
        </div>
        <button onClick={() => setIncludeProfile(!includeProfile)}
          className={`relative h-6 w-11 rounded-full transition ${includeProfile ? 'bg-brand' : 'bg-slate-400/40'}`}>
          <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all ${includeProfile ? 'left-0.5' : 'right-0.5'}`} />
        </button>
      </Card>

      <div className="flex items-center justify-between">
        {saved ? <p className="flex items-center gap-1 text-xs text-green-600"><Check size={13} /> حُفظ تلقائياً</p> : <span />}
        <button onClick={() => { if (confirm(L('مسح كل المعلومات الشخصية؟','Clear all personal info?'))) clearProfile(); }}
          className="flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs text-red-500 surface hover:bg-red-500/10">
          <Trash2 size={14} /> {L('مسح المعلومات','Clear info')}
        </button>
      </div>
    </div>
  );
}
