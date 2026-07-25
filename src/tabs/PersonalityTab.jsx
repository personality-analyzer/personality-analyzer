import { useState } from 'react';
import { Sparkles, Loader2 } from 'lucide-react';
import { Card, Button } from '../components/UI.jsx';
import SharedImage from '../components/SharedImage.jsx';
import ResultView from '../components/ResultView.jsx';
import { analyze } from '../services/ai.js';
import { useApp } from '../store/AppContext.jsx';
import { profileText } from '../services/profile.js';
import { langInstr } from '../services/i18n.js';

const QUESTIONS = [
  { q: 'في المواقف الاجتماعية، أنت غالباً:', a: ['أبادر وأتحدث بحيوية', 'أستمع أكثر مما أتكلّم', 'يعتمد على المكان والأشخاص'] },
  { q: 'عند اتخاذ قرار مهم تعتمد على:', a: ['المنطق والتحليل', 'الحدس والمشاعر', 'مزيج بينهما'] },
  { q: 'أمام التغيير والأفكار الجديدة:', a: ['أحبها وأجرّبها بسرعة', 'أفضّل المألوف والمجرّب', 'أوازن بحذر'] },
  { q: 'تنظيم مهامك اليومية:', a: ['مرتّب ومخطّط', 'مرن وعفوي', 'حسب الظرف'] },
  { q: 'تحت الضغط تميل إلى:', a: ['الهدوء والتركيز', 'القلق ثم التصرّف', 'طلب الدعم من الآخرين'] },
];
const FORMAT = ' نسّق ردّك بعناوين "## " ونقاط "- " و**تشديد**. وسّع التقرير إلى أقسام: ملخص الشخصية، الأبعاد الخمسة بالتفصيل، نقاط القوة، مجالات النمو، والتوصيات.';
const OCEAN = ' في نهاية ردّك أضف سطراً منفصلاً بهذه الصيغة بالضبط بأرقام 0-100: [[OCEAN O=.. C=.. E=.. A=.. N=..]] (O الانفتاح، C الضمير، E الانبساط، A المقبولية، N الاتزان).';

export default function PersonalityTab() {
  const { subject, sharedImage, profile, lang } = useApp();
  const [mode, setMode] = useState('quiz');
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');
  const [error, setError] = useState('');
  const done = Object.keys(answers).length === QUESTIONS.length;

  const runQuiz = async () => {
    setLoading(true); setError(''); setResult('');
    try {
      const summary = QUESTIONS.map((q, i) => `${q.q} => ${q.a[answers[i]]}`).join('\n');
      const text = await analyze({
        system: 'أنت خبير في علم النفس تستخدم نموذج العوامل الخمسة الكبرى (Big Five/OCEAN). حلّل الإجابات وقدّم تقريراً مفصّلاً بأسلوب داعم وغير قطعي.' + FORMAT + OCEAN,
        content: [{ type: 'text', text: (profileText(profile) ? profileText(profile) + '\n\n' : '') + 'إجابات المستخدم:\n' + summary }],
        maxTokens: 2600,
      });
      setResult(text);
    } catch (e) { setError(e.message); } finally { setLoading(false); }
  };

  const runImage = async () => {
    if (!sharedImage) { setError('اختر صورة أولاً'); return; }
    setLoading(true); setError(''); setResult('');
    try {
      const text = await analyze({
        system: 'أنت خبير يستنتج سمات الشخصية المحتملة من الصورة وفق نموذج OCEAN، بشكل استكشافي غير قطعي.' + FORMAT + OCEAN + langInstr(lang),
        content: [
          { type: 'image', source: { type: 'base64', media_type: sharedImage.type, data: sharedImage.b64 } },
          { type: 'text', text: (profileText(profile) ? profileText(profile) + '\n\n' : '') + 'استنتج سمات الشخصية من هذه الصورة تحليلاً مفصّلاً.' },
        ],
        maxTokens: 2600,
      });
      setResult(text);
    } catch (e) { setError(e.message); } finally { setLoading(false); }
  };

  return (
    <div className="fade-in flex flex-col gap-4">
      <div className="inline-flex w-fit gap-1 rounded-xl border p-1 surface">
        {[['quiz', 'استبيان'], ['image', 'من الصورة']].map(([id, lb]) => (
          <button key={id} onClick={() => { setMode(id); setResult(''); }}
            className={`rounded-lg px-4 py-1.5 text-[13px] transition ${mode === id ? 'bg-brand/15 font-bold text-brand' : 'text-slate-500'}`}>{lb}</button>
        ))}
      </div>

      {mode === 'quiz' ? (
        <>
          <Card>
            <p className="mb-1 text-sm font-bold text-brand">استبيان الشخصية</p>
            <p className="text-xs text-slate-500">مبني على نموذج OCEAN العلمي — أجب عن الأسئلة الخمسة.</p>
          </Card>
          {QUESTIONS.map((item, i) => (
            <Card key={i}>
              <p className="mb-3 text-sm font-bold">{i + 1}. {item.q}</p>
              <div className="flex flex-col gap-2">
                {item.a.map((opt, j) => (
                  <button key={j} onClick={() => setAnswers((a) => ({ ...a, [i]: j }))}
                    className={`rounded-lg border px-3 py-2.5 text-right text-sm transition ${answers[i] === j ? 'border-brand bg-brand/10 text-brand' : 'surface text-slate-600 dark:text-slate-300 hover:border-brand/50'}`}>{opt}</button>
                ))}
              </div>
            </Card>
          ))}
          <Button onClick={runQuiz} disabled={!done || loading}>
            {loading ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
            {loading ? 'جارٍ إعداد التقرير…' : 'احصل على تقرير شخصيتك'}
          </Button>
        </>
      ) : (
        <>
          <SharedImage compact />
          <Button onClick={runImage} disabled={loading}>
            {loading ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
            {loading ? 'جارٍ التحليل…' : 'حلّل الشخصية من الصورة'}
          </Button>
        </>
      )}
      {error && <Card className="text-sm text-red-500">{error}</Card>}
      <ResultView title={`تقرير الشخصية${subject ? ' — ' + subject : ''}`} text={result} />
    </div>
  );
}
