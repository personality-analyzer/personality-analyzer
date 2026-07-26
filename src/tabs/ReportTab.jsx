import { useMemo, useState } from 'react';
import { FileStack, Loader2, Printer, FileText, ScanFace, Calendar, User, Layers, Check } from 'lucide-react';
import { Empty } from '../components/UI.jsx';
import { renderBlocks } from '../components/ResultView.jsx';
import RadarChart, { parseOCEAN, stripOCEAN } from '../components/RadarChart.jsx';
import MetricBars, { parseMetrics, stripMetrics } from '../components/Metrics.jsx';
import SharedImage from '../components/SharedImage.jsx';
import { exportFullReport } from '../services/exportReport.js';
import { runAll, ANALYZERS } from '../services/analyzers.js';
import { useApp } from '../store/AppContext.jsx';
import { profileRows, hasProfile } from '../services/profile.js';
import { ClipboardList } from 'lucide-react';

const WANTED = ['تحليل صورة', 'الفراسة العربية', 'الفراسة الغربية', 'تقرير الشخصية'];

export default function ReportTab() {
  const { records, subject, sharedImage, addRecord, profile, includeProfile, lang, L } = useApp();
  const [loading, setLoading] = useState(false);
  const [prog, setProg] = useState({});

  const sections = useMemo(() => {
    const byType = {};
    records
      .filter((r) => r.full && (!subject || r.subject === subject || r.subject === 'عام'))
      .forEach((r) => { if (!byType[r.type]) byType[r.type] = r; });
    return WANTED.map((t) => byType[t]).filter(Boolean);
  }, [records, subject]);

  const run = async () => {
    if (!sharedImage) return;
    setLoading(true);
    const init = {}; ANALYZERS.forEach((a) => (init[a.key] = 'wait')); setProg(init);
    try {
      await runAll(sharedImage, { addRecord, subject, profile, lang, onProgress: (k, st) => setProg((p) => ({ ...p, [k]: st })) });
    } finally { setLoading(false); }
  };

  const doExport = (mode) =>
    exportFullReport({ subject, sections: sections.map((s) => ({ type: s.type, full: s.full })), imageDataUrl: sharedImage?.dataUrl, profile: includeProfile ? profile : null }, mode);

  const today = new Date().toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="fade-in flex flex-col gap-5">
      {/* رأس التقرير */}
      <div className="overflow-hidden rounded-2xl border" style={{ background: 'linear-gradient(135deg,#0e7490,#0b5566)' }}>
        <div className="flex items-center gap-4 p-5 text-white">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-white/15"><FileStack size={26} /></div>
          <div className="flex-1">
            <p className="text-lg font-black">{L('التقرير الشامل','Full Report')}</p>
            <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-white/85">
              <span className="flex items-center gap-1"><User size={12} /> {subject || L('غير محدّد','Not set')}</span>
              <span className="flex items-center gap-1"><Calendar size={12} /> {today}</span>
              <span className="flex items-center gap-1"><Layers size={12} /> {sections.length} {L('من 4 أقسام','of 4 sections')}</span>
            </div>
          </div>
          {sharedImage && <img src={sharedImage.dataUrl} alt="" className="h-16 w-16 rounded-xl border-2 border-white/30 object-cover" />}
        </div>
      </div>

      {/* لوحة التحكم */}
      <div className="surface rounded-2xl border p-4">
        <SharedImage compact />
        <div className="mt-3 flex flex-wrap gap-2">
          <button onClick={run} disabled={loading || !sharedImage}
            className="flex items-center gap-2 rounded-xl bg-brand px-5 py-2.5 text-sm font-bold text-white transition hover:opacity-90 disabled:opacity-50">
            {loading ? <Loader2 size={16} className="animate-spin" /> : <ScanFace size={16} />}
            {loading ? L('جارٍ الفحص الكامل…','Running full scan…') : L('ابدأ الفحص الكامل','Start full scan')}
          </button>
          <button onClick={() => doExport('pdf')} disabled={!sections.length}
            className="flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-bold surface hover:bg-black/5 disabled:opacity-40 dark:hover:bg-white/5"><Printer size={15} /> PDF</button>
          <button onClick={() => doExport('html')} disabled={!sections.length}
            className="flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-bold surface hover:bg-black/5 disabled:opacity-40 dark:hover:bg-white/5"><FileText size={15} /> HTML</button>
        </div>

        {Object.keys(prog).length > 0 && (
          <div className="mt-3 grid grid-cols-2 gap-2">
            {ANALYZERS.map((a) => (
              <div key={a.key} className="flex items-center gap-2 rounded-lg border p-2 text-xs surface">
                {prog[a.key] === 'done' ? <Check size={13} className="text-green-600" /> :
                 prog[a.key] === 'running' ? <Loader2 size={13} className="animate-spin text-brand" /> :
                 prog[a.key] === 'error' ? <span className="text-red-500">✕</span> :
                 <span className="h-2 w-2 rounded-full bg-slate-300" />}
                {a.type}
              </div>
            ))}
          </div>
        )}
      </div>

      {includeProfile && hasProfile(profile) && (
        <div className="surface rounded-2xl border p-5">
          <div className="mb-3 flex items-center gap-2 text-brand"><ClipboardList size={17} /><p className="text-sm font-bold">{L('المعلومات الشخصية','Personal Info')}</p></div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-2 sm:grid-cols-3">
            {profileRows(profile).map(([k, v]) => (
              <div key={k} className="text-sm"><span className="text-slate-500">{k}: </span><span className="font-bold">{v}</span></div>
            ))}
          </div>
        </div>
      )}

      {/* فهرس الأقسام */}
      {sections.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {sections.map((s, i) => (
            <span key={s.id} className="flex items-center gap-1.5 rounded-full bg-brand/10 px-3 py-1 text-xs font-bold text-brand">
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-brand text-[10px] text-white">{i + 1}</span>
              {s.type}
            </span>
          ))}
        </div>
      )}

      {/* الأقسام */}
      {sections.length === 0 ? (
        <div className="surface rounded-2xl border p-4"><Empty icon={FileStack} title="لا توجد أقسام بعد" hint="ابدأ الفحص الكامل لتوليد كل التحليلات." /></div>
      ) : (
        sections.map((s, i) => (
          <section key={s.id} className="surface overflow-hidden rounded-2xl border">
            <div className="flex items-center gap-3 border-b bg-brand/5 px-5 py-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand text-sm font-black text-white">{i + 1}</span>
              <h2 className="text-[16px] font-black text-brand">{s.type}</h2>
            </div>
            <div className="p-5">
              {parseOCEAN(s.full) && (
                <div className="mb-4 rounded-xl border bg-brand/5 p-3">
                  <p className="mb-1 text-center text-xs font-bold text-brand">{L('مخطط سمات OCEAN','OCEAN traits chart')}</p>
                  <RadarChart data={parseOCEAN(s.full)} />
                </div>
              )}
              {parseMetrics(s.full) && (
                <div className="mb-4 rounded-xl border bg-brand/5 p-4">
                  <p className="mb-3 text-xs font-bold text-brand">{L('المؤشرات','Metrics')}</p>
                  <MetricBars data={parseMetrics(s.full)} />
                </div>
              )}
              {renderBlocks(stripMetrics(stripOCEAN(s.full)))}
            </div>
          </section>
        ))
      )}
    </div>
  );
}
