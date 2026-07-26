import { useEffect, useRef } from 'react';
import { Printer, FileText, Check } from 'lucide-react';
import { exportReport } from '../services/exportReport.js';
import { useApp } from '../store/AppContext.jsx';
import RadarChart, { parseOCEAN, stripOCEAN } from './RadarChart.jsx';
import MetricBars, { parseMetrics, stripMetrics } from './Metrics.jsx';

function inline(text) {
  return text.split(/(\*\*[^*]+\*\*)/g).map((p, i) =>
    p.startsWith('**') && p.endsWith('**')
      ? <strong key={i} className="font-bold text-brand">{p.slice(2, -2)}</strong>
      : <span key={i}>{p}</span>
  );
}

export function renderBlocks(md, small = false) {
  const hSize = small ? 'text-[11px]' : 'text-[18px]';
  const bSize = small ? 'text-[10px] leading-5' : 'text-[16px] leading-8';
  const lines = (md || '').split('\n');
  const out = []; let list = [];
  const flush = (key) => {
    if (list.length) {
      out.push(
        <ul key={'ul' + key} className="my-1.5 flex flex-col gap-1 pr-2">
          {list.map((li, i) => (
            <li key={i} className={`flex gap-2 ${bSize}`}>
              <span className={`${small ? 'mt-1.5 h-1 w-1' : 'mt-2 h-1.5 w-1.5'} shrink-0 rounded-full bg-brand`} />
              <span>{inline(li)}</span>
            </li>
          ))}
        </ul>
      );
      list = [];
    }
  };
  lines.forEach((raw, idx) => {
    const line = raw.trim();
    if (!line) { flush(idx); return; }
    if (/^#{1,3}\s/.test(line)) {
      flush(idx);
      out.push(
        <h3 key={idx} className={`${small ? 'mt-2 mb-1 px-2 py-1' : 'mt-5 mb-3 px-3 py-2'} flex items-center gap-2 rounded-lg border-r-4 border-brand bg-brand/10 ${hSize} font-bold text-brand`}>
          {line.replace(/^#{1,3}\s/, '')}
        </h3>
      );
    } else if (/^[-*•]\s/.test(line)) {
      list.push(line.replace(/^[-*•]\s/, ''));
    } else if (/^\d+[.)]\s/.test(line)) {
      flush(idx);
      out.push(
        <p key={idx} className={`my-1 flex gap-2 ${bSize}`}>
          <span className="font-bold text-brand">{line.match(/^\d+/)[0]}.</span>
          <span>{inline(line.replace(/^\d+[.)]\s/, ''))}</span>
        </p>
      );
    } else {
      flush(idx);
      out.push(<p key={idx} className={`my-1 ${bSize}`}>{inline(line)}</p>);
    }
  });
  flush('end');
  return out;
}

const DISC_RE = /(تحذير|تنبيه|إخلاء|مسؤولية|للاستكشاف|علم زائف|pseudoscience|ليست? أداة تشخيص)/;
function splitDisclaimer(text) {
  const lines = (text || '').split('\n');
  let idx = -1;
  for (let i = lines.length - 1; i >= 0; i--) {
    if (/^#{1,3}\s/.test(lines[i].trim()) && DISC_RE.test(lines[i])) { idx = i; break; }
  }
  if (idx === -1) return [text, ''];
  return [lines.slice(0, idx).join('\n'), lines.slice(idx).join('\n')];
}

export default function ResultView({ title = 'نتيجة التحليل', text, meta }) {
  const { addRecord, lang } = useApp();
  const savedRef = useRef('');

  // حفظ تلقائي في السجل عند ظهور نتيجة جديدة (يصل للمساعد وكل الأقسام)
  useEffect(() => {
    if (text && text !== savedRef.current) {
      savedRef.current = text;
      addRecord({ type: title, summary: text.slice(0, 140), full: text });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text]);

  if (!text) return null;
  const ocean = parseOCEAN(text);
  const metrics = parseMetrics(text);
  const clean = stripMetrics(stripOCEAN(text));
  const [main, disc] = splitDisclaimer(clean);

  return (
    <div className="surface rounded-xl border p-5 fade-in">
      <div className="mb-3 flex items-center justify-between gap-2 border-b pb-3">
        <div className="flex items-center gap-2">
          <span className="h-5 w-1.5 rounded bg-brand" />
          <h2 className="text-[17px] font-bold text-brand">{title}</h2>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="flex items-center gap-1 text-[11px] text-green-600"><Check size={12} /> حُفظ تلقائياً</span>
          <button onClick={() => exportReport(title, text, 'pdf', lang)} className="flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs surface hover:bg-black/5 dark:hover:bg-white/5" title="طباعة / PDF"><Printer size={14} /> PDF</button>
          <button onClick={() => exportReport(title, text, 'html', lang)} className="flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs surface hover:bg-black/5 dark:hover:bg-white/5" title="حفظ HTML"><FileText size={14} /> HTML</button>
        </div>
      </div>
      {meta && <p className="mb-2 text-xs text-slate-500">{meta}</p>}
      {ocean && (
        <div className="mb-4 rounded-xl border bg-brand/5 p-3">
          <p className="mb-1 text-center text-xs font-bold text-brand">مخطط سمات OCEAN</p>
          <RadarChart data={ocean} />
        </div>
      )}
      {metrics && (
        <div className="mb-4 rounded-xl border bg-brand/5 p-4">
          <p className="mb-3 text-xs font-bold text-brand">المؤشرات</p>
          <MetricBars data={metrics} />
        </div>
      )}
      <div>{renderBlocks(main)}</div>
      {disc && (
        <div className="mt-4 rounded-lg border border-amber-300/40 bg-amber-50/60 p-3 opacity-80 dark:bg-amber-500/5">
          {renderBlocks(disc, true)}
        </div>
      )}
    </div>
  );
}
