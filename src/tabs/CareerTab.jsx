import { useState } from 'react';
import { openExternal } from '../services/openLink.js';
import { Compass, Sparkles, Loader2, ExternalLink } from 'lucide-react';
import { Card, Button } from '../components/UI.jsx';
import ResultView from '../components/ResultView.jsx';
import { analyze } from '../services/ai.js';
import { profileText } from '../services/profile.js';
import { langInstr } from '../services/i18n.js';
import { useApp } from '../store/AppContext.jsx';

// نموذج هولاند RIASEC: 18 عنصراً، 3 لكل بُعد
const DIMS = [
  { k: 'R', ar: 'واقعي', en: 'Realistic' },
  { k: 'I', ar: 'بحثي', en: 'Investigative' },
  { k: 'A', ar: 'فني', en: 'Artistic' },
  { k: 'S', ar: 'اجتماعي', en: 'Social' },
  { k: 'E', ar: 'ريادي', en: 'Enterprising' },
  { k: 'C', ar: 'تنظيمي', en: 'Conventional' },
];
const ITEMS = [
  { d: 'R', ar: 'إصلاح الأجهزة والآلات', en: 'Repairing devices and machines' },
  { d: 'R', ar: 'العمل بالأدوات اليدوية', en: 'Working with hand tools' },
  { d: 'R', ar: 'الأنشطة الخارجية والرياضة البدنية', en: 'Outdoor activities and physical sport' },
  { d: 'I', ar: 'حل المسائل العلمية والرياضية', en: 'Solving scientific and math problems' },
  { d: 'I', ar: 'إجراء التجارب والبحث', en: 'Running experiments and research' },
  { d: 'I', ar: 'تحليل البيانات والمعلومات', en: 'Analyzing data and information' },
  { d: 'A', ar: 'الرسم أو التصميم', en: 'Drawing or design' },
  { d: 'A', ar: 'الكتابة الإبداعية أو الموسيقى', en: 'Creative writing or music' },
  { d: 'A', ar: 'ابتكار أفكار جديدة', en: 'Inventing new ideas' },
  { d: 'S', ar: 'مساعدة الآخرين وتعليمهم', en: 'Helping and teaching others' },
  { d: 'S', ar: 'العمل ضمن فريق', en: 'Working within a team' },
  { d: 'S', ar: 'الاستماع لمشكلات الناس', en: 'Listening to people’s problems' },
  { d: 'E', ar: 'إقناع الآخرين والقيادة', en: 'Persuading others and leading' },
  { d: 'E', ar: 'بدء مشروع أو البيع', en: 'Starting a venture or selling' },
  { d: 'E', ar: 'تنظيم الفعاليات', en: 'Organizing events' },
  { d: 'C', ar: 'ترتيب البيانات والملفات', en: 'Organizing data and files' },
  { d: 'C', ar: 'العمل بأرقام ودقة', en: 'Working with numbers and precision' },
  { d: 'C', ar: 'اتباع إجراءات منظمة', en: 'Following structured procedures' },
];
const OPTS = [[2, 'يعجبني', 'I like it'], [1, 'محايد', 'Neutral'], [0, 'لا يعجبني', 'Dislike']];

export default function CareerTab() {
  const { subject, profile, lang, L } = useApp();
  const [ans, setAns] = useState({});
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');
  const [topOnet, setTopOnet] = useState([]);
  const [error, setError] = useState('');
  const done = Object.keys(ans).length === ITEMS.length;

  const run = async () => {
    setLoading(true); setError(''); setResult('');
    try {
      const scores = {};
      DIMS.forEach((d) => (scores[d.k] = 0));
      ITEMS.forEach((it, i) => { scores[it.d] += ans[i] ?? 0; });
      const pct = {}; DIMS.forEach((d) => (pct[d.k] = Math.round((scores[d.k] / 6) * 100)));
      const top = [...DIMS].sort((a, b) => pct[b.k] - pct[a.k]).slice(0, 3);
      const code = top.map((d) => d.k).join('');
      setTopOnet(top);
      const summary = DIMS.map((d) => `${L(d.ar, d.en)} (${d.k}) = ${pct[d.k]}%`).join('\n');
      const sys = 'أنت مستشار مهني وأكاديمي خبير في نموذج هولاند (RIASEC). بناءً على نتائج المستخدم، اكتب تقريراً منظّماً بعناوين "## " ونقاط "- " و**تشديد** يشمل: (1) تفسير كود هولاند، (2) أبرز الميول، (3) التخصصات الدراسية المناسبة، (4) المهن والوظائف المقترحة، (5) نصائح لتطوير المسار. كن عملياً ومحدّداً.' + langInstr(lang);
      const info = profileText(profile);
      const text = await analyze({
        system: sys,
        content: [{ type: 'text', text: (info ? info + '\n\n' : '') + `كود هولاند: ${code}\nالنتائج:\n${summary}\nقدّم التوصيات المهنية والدراسية.` }],
        maxTokens: 2600,
      });
      const metricLine = '\n\n[[METRICS ' + DIMS.map((d) => `${L(d.ar, d.en)}=${pct[d.k]}`).join(' | ') + ']]';
      setResult(text + metricLine);
    } catch (e) { setError(e.message); } finally { setLoading(false); }
  };

  return (
    <div className="fade-in flex flex-col gap-4">
      <Card>
        <div className="mb-1 flex items-center gap-2 text-brand"><Compass size={18} /><p className="text-sm font-bold">{L('المسار المهني', 'Career Path')}</p></div>
        <p className="text-xs text-slate-500">{L('مبني على نموذج هولاند RIASEC — قيّم مدى إعجابك بكل نشاط.', 'Based on the Holland RIASEC model — rate how much you like each activity.')}</p>
      </Card>
      {ITEMS.map((it, i) => (
        <Card key={i}>
          <p className="mb-2 text-sm font-bold">{i + 1}. {L(it.ar, it.en)}</p>
          <div className="flex gap-2">
            {OPTS.map(([v, a, e]) => (
              <button key={v} onClick={() => setAns((s) => ({ ...s, [i]: v }))}
                className={`flex-1 rounded-lg border px-2 py-2 text-xs transition ${ans[i] === v ? 'border-brand bg-brand/10 text-brand font-bold' : 'surface text-slate-600 dark:text-slate-300 hover:border-brand/50'}`}>
                {L(a, e)}
              </button>
            ))}
          </div>
        </Card>
      ))}
      <Button onClick={run} disabled={!done || loading}>
        {loading ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
        {loading ? L('جارٍ إعداد التقرير…', 'Preparing report…') : L('احصل على تقرير مسارك المهني', 'Get your career report')}
      </Button>
      {error && <Card className="text-sm text-red-500">{error}</Card>}
      <ResultView title={`${L('المسار المهني', 'Career Path')}${subject ? ' — ' + subject : ''}`} text={result} />
      {result && topOnet.length > 0 && (
        <Card>
          <div className="mb-2 flex items-center gap-2 text-brand"><ExternalLink size={16} /><p className="text-sm font-bold">{L('استكشف مهناً حقيقية على O*NET', 'Explore real occupations on O*NET')}</p></div>
          <p className="mb-3 text-xs text-slate-500">{L('قوائم مهن رسمية من قاعدة O*NET حسب ميولك الأعلى (بالإنجليزية).', 'Official occupation lists from the O*NET database for your top interests (in English).')}</p>
          <div className="flex flex-wrap gap-2">
            {topOnet.map((d) => (
              <a key={d.k} href={`https://www.onetonline.org/explore/interests/${d.en}/`} target="_blank" rel="noreferrer" onClick={(e) => { e.preventDefault(); openExternal(e.currentTarget.href); }}
                className="flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs text-brand surface hover:bg-brand/10">
                <ExternalLink size={12} /> {L(d.ar, d.en)}
              </a>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
