import { Card, Empty } from '../components/UI.jsx';
import { Radar, ChevronLeft } from 'lucide-react';
import { useApp } from '../store/AppContext.jsx';
import ResultView from '../components/ResultView.jsx';
import { useMemo, useState } from 'react';
import { analyze } from '../services/ai.js';
import { exportFullReport } from '../services/exportReport.js';
import { Printer } from 'lucide-react';

export default function CompareTab() {
  const { records, subject, sharedImage, L } = useApp();
  const [report, setReport] = useState('');
  const [loading, setLoading] = useState(false);

  const relevant = useMemo(
    () => records.filter((r) => r.full && (!subject || r.subject === subject || r.subject === 'عام')),
    [records, subject]
  );

  const build = async () => {
    setLoading(true); setReport('');
    try {
      const merged = relevant.slice(0, 6).map((r) => `### ${r.type}\n${r.full}`).join('\n\n');
      const text = await analyze({
        system: 'أنت خبير يدمج عدة تحليلات لنفس الشخص في بروفايل شامل متكامل بالعربية. وحّد المتشابه، وأبرز التناغم والتناقض بين النتائج. نسّق بعناوين "## " ونقاط "- " و**تشديد**.',
        content: [{ type: 'text', text: 'ادمج التحليلات التالية في تقرير موحّد:\n\n' + merged }],
        maxTokens: 1800,
      });
      setReport(text);
    } catch (e) { setReport(L('تعذّر الدمج: ','Merge failed: ') + e.message); } finally { setLoading(false); }
  };

  return (
    <div className="fade-in flex flex-col gap-4">
      <Card>
        <div className="mb-2 flex items-center gap-2 text-brand"><Radar size={18} /><p className="text-sm font-bold">{L('لوحة المقارنة الموحّدة','Unified Comparison')}</p></div>
        {relevant.length === 0 ? (
          <Empty icon={Radar} title={L('لا توجد تحليلات محفوظة','No saved analyses')} hint={L('احفظ نتائج من التحليل/الفراسة/الشخصية لتظهر هنا.','Run analyses (Analysis/Physiognomy/Personality) to see them here.')} />
        ) : (
          <>
            <p className="mb-3 text-xs text-slate-500">
              {relevant.length} تحليلاً محفوظاً {subject ? `للشخص «${subject}»` : ''}. ادمجها في بروفايل شامل واحد.
            </p>
            <div className="mb-3 flex flex-col gap-1.5">
              {relevant.slice(0, 6).map((r) => (
                <div key={r.id} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                  <ChevronLeft size={14} className="text-brand" /> {r.type}
                </div>
              ))}
            </div>
            <div className="flex flex-wrap gap-2">
              <button onClick={build} disabled={loading}
                className="rounded-lg bg-brand px-4 py-2.5 text-sm font-bold text-white transition hover:opacity-90 disabled:opacity-50">
                {loading ? L('جارٍ الدمج…','Merging…') : L('أنشئ البروفايل الشامل','Build full profile')}
              </button>
              <button onClick={() => exportFullReport({ subject, sections: relevant.slice(0,8).map(r=>({type:r.type,full:r.full})), imageDataUrl: sharedImage?.dataUrl }, 'pdf')}
                className="flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-bold surface hover:bg-black/5 dark:hover:bg-white/5">
                <Printer size={16} /> {L('تصدير التقرير الشامل (PDF)','Export full report (PDF)')}
              </button>
            </div>
          </>
        )}
      </Card>
      <ResultView title={`${L('البروفايل الشامل','Full Profile')}${subject ? ' — ' + subject : ''}`} text={report} />
    </div>
  );
}
