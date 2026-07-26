import { useState } from 'react';
import { Gauge, Sparkles, Loader2 } from 'lucide-react';
import { Card, Button } from '../components/UI.jsx';
import ResultView from '../components/ResultView.jsx';
import { analyze } from '../services/ai.js';
import { profileText } from '../services/profile.js';
import { langInstr } from '../services/i18n.js';
import { useApp } from '../store/AppContext.jsx';

// IPIP Big Five: 20 عنصراً (4 لكل عامل)، مقياس ليكرت 1..5 — عناصر موجبة الاتجاه
const FACTORS = [
  { k: 'O', ar: 'الانفتاح', en: 'Openness' },
  { k: 'C', ar: 'الضمير الحي', en: 'Conscientiousness' },
  { k: 'E', ar: 'الانبساط', en: 'Extraversion' },
  { k: 'A', ar: 'المقبولية', en: 'Agreeableness' },
  { k: 'N', ar: 'الاتزان', en: 'Stability' },
];
const ITEMS = [
  { f: 'O', ar: 'لديّ خيال واسع', en: 'I have a vivid imagination' },
  { f: 'O', ar: 'أستمتع بالأفكار المجردة', en: 'I enjoy abstract ideas' },
  { f: 'O', ar: 'أحب تجربة أشياء جديدة', en: 'I like trying new things' },
  { f: 'O', ar: 'مهتم بالفنون والجمال', en: 'I am interested in art and beauty' },
  { f: 'C', ar: 'منظّم ودقيق', en: 'I am organized and precise' },
  { f: 'C', ar: 'أنجز المهام في وقتها', en: 'I finish tasks on time' },
  { f: 'C', ar: 'منتبه للتفاصيل', en: 'I pay attention to detail' },
  { f: 'C', ar: 'ملتزم بخططي', en: 'I stick to my plans' },
  { f: 'E', ar: 'أبادر بالحديث مع الغرباء', en: 'I start conversations with strangers' },
  { f: 'E', ar: 'أستمد طاقة من التجمعات', en: 'I gain energy from gatherings' },
  { f: 'E', ar: 'أحب أن أكون مركز الاهتمام', en: 'I like being the center of attention' },
  { f: 'E', ar: 'اجتماعي ونشيط', en: 'I am sociable and energetic' },
  { f: 'A', ar: 'أتعاطف مع مشاعر الآخرين', en: 'I empathize with others’ feelings' },
  { f: 'A', ar: 'أساعد الناس دون مقابل', en: 'I help people without expecting return' },
  { f: 'A', ar: 'أثق بالآخرين', en: 'I trust others' },
  { f: 'A', ar: 'لطيف في التعامل', en: 'I am kind in dealing with people' },
  { f: 'N', ar: 'أبقى هادئاً تحت الضغط', en: 'I stay calm under pressure' },
  { f: 'N', ar: 'نادراً ما أقلق', en: 'I rarely worry' },
  { f: 'N', ar: 'أتعافى سريعاً من الإحباط', en: 'I recover quickly from setbacks' },
  { f: 'N', ar: 'مزاجي مستقر', en: 'My mood is stable' },
];
const SCALE = [
  [1, 'لا أوافق بشدة', 'Strongly disagree'],
  [2, 'لا أوافق', 'Disagree'],
  [3, 'محايد', 'Neutral'],
  [4, 'أوافق', 'Agree'],
  [5, 'أوافق بشدة', 'Strongly agree'],
];

export default function DeepPersonalityTab() {
  const { subject, profile, lang, L } = useApp();
  const [ans, setAns] = useState({});
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');
  const [error, setError] = useState('');
  const done = Object.keys(ans).length === ITEMS.length;

  const run = async () => {
    setLoading(true); setError(''); setResult('');
    try {
      const sum = {}; FACTORS.forEach((f) => (sum[f.k] = 0));
      ITEMS.forEach((it, i) => { sum[it.f] += ans[i] ?? 3; });
      const pct = {}; FACTORS.forEach((f) => (pct[f.k] = Math.round(((sum[f.k] - 4) / 16) * 100)));
      const summary = FACTORS.map((f) => `${L(f.ar, f.en)} (${f.k}) = ${pct[f.k]}%`).join('\n');
      const sys = 'أنت خبير نفسي في نموذج العوامل الخمسة الكبرى (Big Five/IPIP). بناءً على درجات المستخدم اكتب تقريراً مفصّلاً بعناوين "## " ونقاط "- " و**تشديد** يشمل: ملخص الشخصية، شرح كل بُعد من الأبعاد الخمسة، نقاط القوة، مجالات النمو، وتوصيات عملية. أسلوب داعم وغير قطعي.' + langInstr(lang);
      const info = profileText(profile);
      const text = await analyze({
        system: sys,
        content: [{ type: 'text', text: (info ? info + '\n\n' : '') + `درجات العوامل الخمسة:\n${summary}` }],
        maxTokens: 2800,
      });
      const oceanLine = `\n\n[[OCEAN O=${pct.O} C=${pct.C} E=${pct.E} A=${pct.A} N=${pct.N}]]`;
      setResult(text + oceanLine);
    } catch (e) { setError(e.message); } finally { setLoading(false); }
  };

  return (
    <div className="fade-in flex flex-col gap-4">
      <Card>
        <div className="mb-1 flex items-center gap-2 text-brand"><Gauge size={18} /><p className="text-sm font-bold">{L('الشخصية المتعمّقة', 'Deep Personality')}</p></div>
        <p className="text-xs text-slate-500">{L('استبيان IPIP للعوامل الخمسة الكبرى (20 عبارة) — قيّم مدى موافقتك.', 'IPIP Big Five questionnaire (20 statements) — rate your agreement.')}</p>
      </Card>
      {ITEMS.map((it, i) => (
        <Card key={i}>
          <p className="mb-2 text-sm font-bold">{i + 1}. {L(it.ar, it.en)}</p>
          <div className="flex flex-wrap gap-1.5">
            {SCALE.map(([v, a, e]) => (
              <button key={v} onClick={() => setAns((s) => ({ ...s, [i]: v }))} title={L(a, e)}
                className={`flex-1 min-w-[56px] rounded-lg border px-1 py-2 text-[11px] transition ${ans[i] === v ? 'border-brand bg-brand/10 text-brand font-bold' : 'surface text-slate-600 dark:text-slate-300 hover:border-brand/50'}`}>
                {L(a, e)}
              </button>
            ))}
          </div>
        </Card>
      ))}
      <Button onClick={run} disabled={!done || loading}>
        {loading ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
        {loading ? L('جارٍ إعداد التقرير…', 'Preparing report…') : L('احصل على تقريرك المتعمّق', 'Get your deep report')}
      </Button>
      {error && <Card className="text-sm text-red-500">{error}</Card>}
      <ResultView title={`${L('الشخصية المتعمّقة', 'Deep Personality')}${subject ? ' — ' + subject : ''}`} text={result} />
    </div>
  );
}
