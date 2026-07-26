// تصدير تقارير احترافية إلى PDF (طباعة) أو HTML — يتبع اللغة (عربي/إنجليزي)، بلا اعتماديات.
const BASE = `
@import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;900&display=swap');
*{box-sizing:border-box}
body{font-family:'Tajawal',sans-serif;color:#0f172a;line-height:1.95;margin:0;background:#fff}
.wrap{max-width:820px;margin:0 auto;padding:0 26px 40px}
h3{color:#0e7490;font-size:17px;background:#0e74900f;border-inline-start:4px solid #0e7490;border-radius:8px;padding:7px 12px;margin:16px 0 6px}
p{font-size:15.5px;margin:6px 0}
ul{margin:6px 0;padding-inline-start:18px}
li{font-size:15.5px;margin:5px 0}
strong{color:#0b5566}
.bars{margin:6px 0 12px}.bar-row{margin:6px 0}.bar-row .lbl{display:flex;justify-content:space-between;font-size:13px;margin-bottom:3px}.bar-track{height:8px;background:#0e749022;border-radius:6px}.bar-fill{height:8px;background:#0e7490;border-radius:6px}
.foot{margin-top:30px;border-top:1px solid #e2e8f0;padding-top:12px;color:#64748b;font-size:12px;text-align:center}
`;
const FULL = `
.hero{background:linear-gradient(135deg,#0e7490,#0b5566);color:#fff;padding:34px 26px;text-align:center}
.hero h1{font-size:30px;margin:0 0 6px;font-weight:900}
.hero .meta{font-size:13px;opacity:.9;display:flex;gap:18px;justify-content:center;flex-wrap:wrap;margin-top:8px}
.hero img{max-height:200px;border-radius:16px;margin:16px auto 0;display:block;border:3px solid rgba(255,255,255,.3)}
.toc{background:#f4f7f9;border:1px solid #e2e8f0;border-radius:14px;padding:16px 20px;margin:24px 0}
.toc b{color:#0e7490;font-size:14px;display:block;margin-bottom:8px}
.toc ol{margin:0;padding-inline-start:20px}
.toc li{font-size:14px;margin:4px 0;color:#334155}
.section{margin:26px 0;border:1px solid #e2e8f0;border-radius:16px;overflow:hidden;break-inside:avoid}
.section > .head{display:flex;align-items:center;gap:12px;background:#0e74900d;border-bottom:1px solid #e2e8f0;padding:12px 18px}
.section > .head .num{width:30px;height:30px;border-radius:50%;background:#0e7490;color:#fff;font-weight:900;display:flex;align-items:center;justify-content:center;font-size:15px}
.section > .head b{color:#0e7490;font-size:18px}
.section > .body{padding:16px 20px}
@media print{.section{break-inside:avoid}.hero{-webkit-print-color-adjust:exact;print-color-adjust:exact}}
`;

// قواميس الترجمة للتصدير
const OCEAN_LABELS = {
  ar: ['الانفتاح', 'الضمير الحي', 'الانبساط', 'المقبولية', 'الاتزان'],
  en: ['Openness', 'Conscientiousness', 'Extraversion', 'Agreeableness', 'Stability'],
};
const METRIC_EN = {
  'المزاج': 'Mood', 'الطاقة': 'Energy', 'الاسترخاء': 'Relaxation', 'الثقة': 'Confidence', 'التركيز': 'Focus',
  'الحزم': 'Assertiveness', 'الانفتاح': 'Openness', 'الهدوء': 'Calmness', 'العزيمة': 'Determination', 'التعاون': 'Cooperation',
};
const TYPE_EN = {
  'تحليل صورة': 'Image analysis', 'تحليل فيديو': 'Video analysis', 'تحليل صوت': 'Audio analysis',
  'تحليل بث مباشر': 'Live analysis', 'الفراسة العربية': 'Arabic Physiognomy', 'الفراسة الغربية': 'Western Physiognomy',
  'تقرير الشخصية': 'Personality Report', 'البروفايل الشامل': 'Full Profile',
};
const FIELD_EN = { name: 'Name', age: 'Age', gender: 'Gender', height: 'Height', weight: 'Weight', health: 'Health', notes: 'Notes' };

function tType(type, lang) {
  if (lang !== 'en' || !type) return type;
  const [base, ...rest] = String(type).split(' — ');
  const en = TYPE_EN[base.trim()] || base;
  return rest.length ? en + ' — ' + rest.join(' — ') : en;
}
function tMetric(label, lang) {
  return lang === 'en' ? (METRIC_EN[label] || label) : label;
}

function radarSVG(vals, lang) {
  const labs = OCEAN_LABELS[lang === 'en' ? 'en' : 'ar'];
  const cx = 150, cy = 150, R = 100;
  const pt = (i, r) => { const a = -Math.PI / 2 + (i * 2 * Math.PI) / 5; return [cx + r * Math.cos(a), cy + r * Math.sin(a)]; };
  const ring = (rg) => labs.map((_, i) => pt(i, (rg / 100) * R).join(',')).join(' ');
  const rings = [25, 50, 75, 100].map(rg => `<polygon points="${ring(rg)}" fill="none" stroke="#94a3b8" stroke-opacity="0.35" stroke-width="1"/>`).join('');
  const axes = labs.map((_, i) => { const [x, y] = pt(i, R); return `<line x1="${cx}" y1="${cy}" x2="${x}" y2="${y}" stroke="#94a3b8" stroke-opacity="0.35" stroke-width="1"/>`; }).join('');
  const poly = vals.map((v, i) => pt(i, (v / 100) * R).join(',')).join(' ');
  const dots = vals.map((v, i) => { const [x, y] = pt(i, (v / 100) * R); return `<circle cx="${x}" cy="${y}" r="3.5" fill="#0e7490"/>`; }).join('');
  const texts = labs.map((l, i) => { const [x, y] = pt(i, R + 22); const anc = Math.abs(x - cx) < 10 ? 'middle' : (x > cx ? 'start' : 'end'); return `<text x="${x}" y="${y}" text-anchor="${anc}" font-size="12" font-weight="700" fill="#0e7490">${l}<tspan x="${x}" dy="14" font-size="11" fill="#64748b">${vals[i]}%</tspan></text>`; }).join('');
  const cap = lang === 'en' ? 'OCEAN traits chart' : 'مخطط سمات OCEAN';
  return `<div style="text-align:center;margin:8px 0 16px"><div style="font-size:13px;font-weight:700;color:#0e7490;margin-bottom:4px">${cap}</div><svg viewBox="0 0 300 260" width="330" style="max-width:100%">${rings}${axes}<polygon points="${poly}" fill="#0e7490" fill-opacity="0.25" stroke="#0e7490" stroke-width="2"/>${dots}${texts}</svg></div>`;
}
function barsHTML(text, lang) {
  let html = '';
  const oc = (text || '').match(/OCEAN[^\]]*O\s*=\s*(\d+)[^\d]+C\s*=\s*(\d+)[^\d]+E\s*=\s*(\d+)[^\d]+A\s*=\s*(\d+)[^\d]+N\s*=\s*(\d+)/i);
  if (oc) html += radarSVG(oc.slice(1, 6).map(n => parseInt(n, 10)), lang);
  const mt = (text || '').match(/\[\[?\s*METRICS([^\]]*)\]?\]/i);
  if (mt) {
    const rows = [];
    mt[1].split('|').forEach((p) => { const m = p.match(/(.+?)\s*=\s*(\d{1,3})/); if (m) rows.push([tMetric(m[1].trim(), lang), m[2]]); });
    if (rows.length) html += '<div class="bars">' + rows.map(([l, v]) => `<div class="bar-row"><div class="lbl"><b>${l}</b><span>${v}%</span></div><div class="bar-track"><div class="bar-fill" style="width:${v}%"></div></div></div>`).join('') + '</div>';
  }
  return html;
}
function inline(t) { return t.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>'); }
// يحذف علامات OCEAN و METRICS الخام قبل العرض
function stripMarkers(t) {
  return (t || '').replace(/\[\[?\s*OCEAN[^\]]*\]?\]/gi, '').replace(/\[\[?\s*METRICS[^\]]*\]?\]/gi, '');
}
function md2html(text) {
  return stripMarkers(text).split('\n').map((l) => {
    const t = l.trim();
    if (!t) return '';
    if (/^#{1,3}\s/.test(t)) return `<h3>${t.replace(/^#{1,3}\s/, '')}</h3>`;
    if (/^[-*•]\s/.test(t)) return `<li>${inline(t.replace(/^[-*•]\s/, ''))}</li>`;
    return `<p>${inline(t)}</p>`;
  }).join('\n').replace(/(<li>[\s\S]*?<\/li>\n?)+/g, (m) => `<ul>${m}</ul>`);
}
function shell(title, css, inner, lang) {
  const dir = lang === 'en' ? 'ltr' : 'rtl';
  const foot = lang === 'en' ? 'Smart Personality Analyzer' : 'المحلّل الذكي للشخصية';
  const dt = new Date().toLocaleString(lang === 'en' ? 'en-US' : 'ar');
  return `<!doctype html><html lang="${lang === 'en' ? 'en' : 'ar'}" dir="${dir}"><head><meta charset="utf-8"><title>${title}</title><style>${BASE}${css}</style></head><body>${inner}<div class="wrap"><div class="foot">${foot} — ${dt}</div></div></body></html>`;
}
function output(html, mode, filename) {
  if (mode === 'html') {
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `${filename}.html`; a.style.display = 'none';
    document.body.appendChild(a); a.click();
    setTimeout(() => { document.body.removeChild(a); URL.revokeObjectURL(url); }, 1500);
    return;
  }
  const iframe = document.createElement('iframe');
  iframe.setAttribute('aria-hidden', 'true');
  iframe.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0;';
  document.body.appendChild(iframe);
  const cleanup = () => setTimeout(() => { try { document.body.removeChild(iframe); } catch {} }, 1500);
  iframe.onload = () => { try { iframe.contentWindow.focus(); iframe.contentWindow.print(); } catch {} cleanup(); };
  const doc = iframe.contentWindow.document;
  doc.open(); doc.write(html); doc.close();
  setTimeout(() => { try { iframe.contentWindow.focus(); iframe.contentWindow.print(); } catch {} }, 600);
}

// تقرير قسم واحد
export function exportReport(title, text, mode = 'pdf', lang = 'ar') {
  const dt = new Date().toLocaleDateString(lang === 'en' ? 'en-US' : 'ar');
  const inner = `<div class="hero" style="padding:26px"><h1 style="font-size:24px">${title}</h1><div class="meta">${dt}</div></div><div class="wrap">${barsHTML(text, lang)}${md2html(text)}</div>`;
  output(shell(title, FULL, inner, lang), mode, title);
}

// التقرير الشامل
export function exportFullReport({ subject, sections, imageDataUrl, profile, lang = 'ar' }, mode = 'pdf') {
  const en = lang === 'en';
  const named = subject && subject !== 'عام' && subject !== 'General';
  const name = named ? subject : (en ? 'Full Report' : 'تقرير شامل');
  const dt = new Date().toLocaleDateString(en ? 'en-US' : 'ar');
  const T = {
    title: en ? 'Full Report' : 'التقرير الشامل',
    notset: en ? 'Not set' : 'غير محدّد',
    sections: en ? 'sections' : 'أقسام',
    toc: en ? 'Report contents' : 'محتويات التقرير',
    pinfo: en ? 'Personal Info' : 'المعلومات الشخصية',
  };
  const hero = `<div class="hero">
    <h1>${T.title}${named ? ' — ' + subject : ''}</h1>
    <div class="meta"><span>${named ? subject : T.notset}</span><span>${dt}</span><span>${sections.length} ${T.sections}</span></div>
    ${imageDataUrl ? `<img src="${imageDataUrl}" alt="">` : ''}
  </div>`;
  const LAB = en ? FIELD_EN : { name: 'الاسم', age: 'العمر', gender: 'الجنس', height: 'الطول', weight: 'الوزن', health: 'الحالة الصحية', notes: 'ملاحظات' };
  const unit = { height: en ? ' cm' : ' سم', weight: en ? ' kg' : ' كجم', age: en ? ' yr' : ' سنة' };
  const prows = profile ? Object.keys(LAB).filter(k => String(profile[k] || '').trim()).map(k => { let v = String(profile[k]).trim(); if (unit[k]) v += unit[k]; return [LAB[k], v]; }) : [];
  const profileHTML = prows.length ? `<div class="toc"><b>${T.pinfo}</b><div style="display:flex;flex-wrap:wrap;gap:10px 24px">${prows.map(([k, v]) => `<div style="font-size:14px"><span style="color:#64748b">${k}: </span><b>${v}</b></div>`).join('')}</div></div>` : '';
  const toc = `<div class="toc"><b>${T.toc}</b><ol>${sections.map((s) => `<li>${tType(s.type, lang)}</li>`).join('')}</ol></div>`;
  const body = sections.map((s, i) =>
    `<div class="section"><div class="head"><span class="num">${i + 1}</span><b>${tType(s.type, lang)}</b></div><div class="body">${barsHTML(s.full, lang)}${md2html(s.full)}</div></div>`
  ).join('\n');
  output(shell(name, FULL, hero + `<div class="wrap">${profileHTML}${toc}${body}</div>`, lang), mode, name);
}
