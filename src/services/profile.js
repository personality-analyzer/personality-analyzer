const LABELS = { name: 'الاسم', age: 'العمر', gender: 'الجنس', height: 'الطول', weight: 'الوزن', health: 'الحالة الصحية', notes: 'ملاحظات' };
export function hasProfile(p) {
  return !!p && Object.keys(LABELS).some((k) => String(p[k] || '').trim());
}
export function profileRows(p) {
  if (!p) return [];
  return Object.keys(LABELS)
    .filter((k) => String(p[k] || '').trim())
    .map((k) => {
      let v = String(p[k]).trim();
      if (k === 'height') v += ' سم'; if (k === 'weight') v += ' كجم'; if (k === 'age') v += ' سنة';
      return [LABELS[k], v];
    });
}
export function profileText(p) {
  const rows = profileRows(p);
  if (!rows.length) return '';
  return 'معلومات صاحب التقييم:\n' + rows.map(([k, v]) => `- ${k}: ${v}`).join('\n') + '\nخذ هذه المعلومات بعين الاعتبار في تحليلك عند الاقتضاء.';
}
