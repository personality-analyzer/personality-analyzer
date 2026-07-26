import { useState } from 'react';
import { Moon, Microscope, Sparkles, Loader2 } from 'lucide-react';
import { Card, Button } from '../components/UI.jsx';
import SharedImage from '../components/SharedImage.jsx';
import ResultView from '../components/ResultView.jsx';
import { analyze } from '../services/ai.js';
import { useApp } from '../store/AppContext.jsx';
import { profileText } from '../services/profile.js';
import { langInstr } from '../services/i18n.js';

const SCHOOLS = [
  { id: 'arabic', label: 'الفراسة العربية', en: 'Arabic Physiognomy', icon: Moon,
    sys: 'أنت عالم في الفراسة العربية التراثية (ابن القيم، الرازي). اقرأ الملامح وقدّم قراءة ثقافية تراثية مفصّلة بالعربية.' },
  { id: 'western', label: 'الفراسة الغربية', en: 'Western Physiognomy', icon: Microscope,
    sys: 'أنت خبير في الفراسة الغربية ومدارسها (لافاتر، إيكمان FACS، نافارو للغة الجسد، شيلدون). قدّم قراءة تحليلية مفصّلة بالعربية مع ذكر المدرسة لكل ملاحظة.' },
];
const DEPTH = ' وسّع القراءة إلى أقسام: الجبهة والعينان، الأنف والفم، شكل الوجه، الانطباع العام، والسمات المستنتجة. اكتب نقاطاً تفصيلية.';
const METRICS = ' في نهاية ردّك أضف سطراً: [[METRICS الحزم=.. | الانفتاح=.. | الهدوء=.. | العزيمة=.. | التعاون=..]] بأرقام 0-100 كتقدير استكشافي.';
const DISCLAIM = ' مهم: اذكر في النهاية بوضوح أن الفراسة تُصنَّف علمياً كعِلم زائف وأن القراءة للاستكشاف والترفيه فقط. نسّق بعناوين "## " ونقاط "- " و**تشديد**.';

export default function FirasaTab() {
  const { subject, sharedImage, profile, lang, L } = useApp();
  const [school, setSchool] = useState('arabic');
  const [inputMode, setInputMode] = useState('image');
  const [desc, setDesc] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');
  const [error, setError] = useState('');
  const cur = SCHOOLS.find((s) => s.id === school);

  const run = async () => {
    setLoading(true); setError(''); setResult('');
    try {
      let content;
      if (inputMode === 'image') {
        if (!sharedImage) { setError(L('اختر صورة أولاً','Choose an image first')); setLoading(false); return; }
        content = [
          { type: 'image', source: { type: 'base64', media_type: sharedImage.type, data: sharedImage.b64 } },
          { type: 'text', text: (profileText(profile) ? profileText(profile) + '\n\n' : '') + 'اقرأ فراسة ملامح هذا الوجه قراءة مفصّلة.' },
        ];
      } else {
        if (!desc.trim()) { setError(L('اكتب وصفاً أولاً','Write a description first')); setLoading(false); return; }
        content = [{ type: 'text', text: (profileText(profile) ? profileText(profile) + '\n\n' : '') + 'اقرأ الفراسة من هذا الوصف:\n' + desc }];
      }
      const text = await analyze({ system: cur.sys + DEPTH + METRICS + DISCLAIM + langInstr(lang), content, maxTokens: 2400 });
      setResult(text);
    } catch (e) { setError(e.message); } finally { setLoading(false); }
  };

  return (
    <div className="fade-in flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-2">
        {SCHOOLS.map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => { setSchool(id); setResult(''); }}
            className={`flex items-center justify-center gap-2 rounded-xl border p-3 text-sm transition ${school === id ? 'border-brand bg-brand/10 font-bold text-brand' : 'surface text-slate-500'}`}>
            <Icon size={18} /> {L(label, SCHOOLS.find(x=>x.label===label)?.en || label)}
          </button>
        ))}
      </div>
      <div className="inline-flex w-fit gap-1 rounded-xl border p-1 surface">
        {[['image', L('من صورة','From image')], ['desc', L('من وصف','From description')]].map(([id, lb]) => (
          <button key={id} onClick={() => setInputMode(id)}
            className={`rounded-lg px-4 py-1.5 text-[13px] transition ${inputMode === id ? 'bg-brand/15 font-bold text-brand' : 'text-slate-500'}`}>{lb}</button>
        ))}
      </div>

      {inputMode === 'image' ? <SharedImage compact /> : (
        <textarea value={desc} onChange={(e) => setDesc(e.target.value)} rows={5} placeholder={L('صف الملامح: شكل الوجه، العينان، الجبهة، الفم…','Describe the features: face shape, eyes, forehead, mouth…')}
          className="w-full rounded-xl border p-3 text-sm surface outline-none focus:border-brand" />
      )}

      <div className="rounded-lg border border-amber-300/40 bg-amber-50 p-3 text-xs text-amber-700 dark:bg-amber-500/10 dark:text-amber-400">
        {L('تنبيه: الفراسة تُصنَّف علمياً كعِلم زائف؛ القراءة للاستكشاف والترفيه فقط.','Note: physiognomy is scientifically classified as pseudoscience; this reading is for exploration and entertainment only.')}
      </div>
      <Button onClick={run} disabled={loading}>
        {loading ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
        {loading ? L('جارٍ القراءة…','Reading…') : L('اقرأ الفراسة','Read physiognomy')}
      </Button>
      {error && <Card className="text-sm text-red-500">{error}</Card>}
      <ResultView title={`${L(cur.label, cur.en)}${subject ? ' — ' + subject : ''}`} text={result} />
    </div>
  );
}
