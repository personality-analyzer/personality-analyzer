// أشرطة قياس لمؤشرات كل قسم — تُقرأ من صيغة: [[METRICS المزاج=80 | الطاقة=65 | الثقة=72]]
export function parseMetrics(text) {
  const m = (text || '').match(/\[\[?\s*METRICS([^\]]*)\]?\]/i);
  if (!m) return null;
  const pairs = m[1].split('|').map((s) => s.trim()).filter(Boolean);
  const out = [];
  for (const p of pairs) {
    const mm = p.match(/(.+?)\s*=\s*(\d{1,3})/);
    if (mm) out.push({ label: mm[1].trim(), value: Math.max(0, Math.min(100, parseInt(mm[2], 10))) });
  }
  return out.length ? out : null;
}
export function stripMetrics(text) {
  return (text || '').replace(/\[\[?\s*METRICS[^\]]*\]?\]/gi, '').replace(/\n{3,}/g, '\n\n').trim();
}

export default function MetricBars({ data }) {
  if (!data || !data.length) return null;
  return (
    <div className="flex flex-col gap-2.5">
      {data.map((d, i) => (
        <div key={i}>
          <div className="mb-1 flex justify-between text-xs">
            <span className="font-bold">{d.label}</span>
            <span className="text-slate-500">{d.value}%</span>
          </div>
          <div className="h-2 rounded-full bg-slate-500/15">
            <div className="h-2 rounded-full bg-brand transition-all" style={{ width: `${d.value}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}
