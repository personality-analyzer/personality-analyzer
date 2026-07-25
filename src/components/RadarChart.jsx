// رادار SVG لسمات OCEAN — بلا اعتماديات خارجية.
const AXES = [
  { key: 'O', label: 'الانفتاح' },
  { key: 'C', label: 'الضمير الحي' },
  { key: 'E', label: 'الانبساط' },
  { key: 'A', label: 'المقبولية' },
  { key: 'N', label: 'الاتزان' },
];

// يستخرج الأرقام من صيغة: [[OCEAN O=82 C=67 E=54 A=75 N=60]]
export function parseOCEAN(text) {
  const m = (text || '').match(/OCEAN[^\]]*O\s*=\s*(\d{1,3})[^\d]+C\s*=\s*(\d{1,3})[^\d]+E\s*=\s*(\d{1,3})[^\d]+A\s*=\s*(\d{1,3})[^\d]+N\s*=\s*(\d{1,3})/i);
  if (!m) return null;
  const v = m.slice(1, 6).map((n) => Math.max(0, Math.min(100, parseInt(n, 10))));
  return { O: v[0], C: v[1], E: v[2], A: v[3], N: v[4] };
}
export function stripOCEAN(text) {
  return (text || '').replace(/\[\[?\s*OCEAN[^\]]*\]?\]/gi, '').replace(/\n{3,}/g, '\n\n').trim();
}

export default function RadarChart({ data }) {
  if (!data) return null;
  const size = 300, cx = size / 2, cy = 150, R = 100;
  const pt = (i, r) => {
    const ang = -Math.PI / 2 + (i * 2 * Math.PI) / 5;
    return [cx + r * Math.cos(ang), cy + r * Math.sin(ang)];
  };
  const rings = [25, 50, 75, 100];
  const values = AXES.map((a) => data[a.key]);
  const poly = values.map((v, i) => pt(i, (v / 100) * R).join(',')).join(' ');

  return (
    <div className="fill-current text-slate-400">
      <svg viewBox={`0 0 ${size} 260`} className="mx-auto w-full max-w-[340px]">
        {rings.map((rg, ri) => (
          <polygon key={ri} points={AXES.map((_, i) => pt(i, (rg / 100) * R).join(',')).join(' ')}
            fill="none" stroke="currentColor" strokeOpacity="0.25" strokeWidth="1" />
        ))}
        {AXES.map((_, i) => {
          const [x, y] = pt(i, R);
          return <line key={i} x1={cx} y1={cy} x2={x} y2={y} stroke="currentColor" strokeOpacity="0.25" strokeWidth="1" />;
        })}
        <polygon points={poly} fill="#0e7490" fillOpacity="0.25" stroke="#0e7490" strokeWidth="2" />
        {values.map((v, i) => { const [x, y] = pt(i, (v / 100) * R); return <circle key={i} cx={x} cy={y} r="3.5" fill="#0e7490" />; })}
        {AXES.map((a, i) => {
          const [x, y] = pt(i, R + 22);
          const anchor = Math.abs(x - cx) < 10 ? 'middle' : x > cx ? 'start' : 'end';
          return (
            <text key={i} x={x} y={y} textAnchor={anchor} dominantBaseline="middle" fontSize="12" fontWeight="700" fill="#0e7490">
              {a.label}
              <tspan x={x} dy="14" fontSize="11" fill="currentColor">{data[a.key]}%</tspan>
            </text>
          );
        })}
      </svg>
    </div>
  );
}
