export const DICT = {
  ar: {
    'app.title': 'المحلّل الذكي للشخصية', 'app.subtitle': 'تحليل الشخصية والانفعالات',
    'group.home': 'الرئيسية', 'group.analyze': 'التحليل', 'group.search': 'البحث', 'group.other': 'أخرى',
    'nav.home': 'الرئيسية', 'nav.profile': 'معلومات شخصية', 'nav.analyze': 'التحليل', 'nav.firasa': 'الفراسة',
    'nav.personality': 'الشخصية', 'nav.career': 'المسار المهني', 'nav.deep': 'الشخصية المتعمّقة', 'nav.compare': 'المقارنة', 'nav.report': 'التقرير الشامل',
    'nav.research': 'البحث العلمي', 'nav.archive': 'الأرشيف', 'nav.chat': 'المساعد', 'nav.history': 'السجل', 'nav.settings': 'الإعدادات',
    'top.name': 'اسم الشخص (اختياري)', 'top.dark': 'داكن', 'top.light': 'فاتح',
    'home.welcome': 'مرحباً بك في المحلّل الذكي 👋', 'home.sub': 'حلّل الصور والفيديو والصوت، واكتشف الشخصية والفراسة، وصدّر تقارير احترافية.',
    'home.start': 'ابدأ تحليلاً جديداً', 'home.total': 'إجمالي التحليلات', 'home.people': 'عدد الأشخاص', 'home.last': 'آخر نشاط',
    'home.quick': 'وصول سريع', 'home.recent': 'آخر التحليلات', 'home.viewHistory': 'عرض السجل ←', 'home.dist': 'توزيع التحليلات حسب النوع',
    'home.viewLog': 'عرض السجل', 'home.compare': 'المقارنة', 'home.startAnalysis': 'ابدأ تحليلاً',
    'common.pdf': 'PDF', 'common.html': 'HTML', 'common.autoSaved': 'حُفظ تلقائياً', 'common.analyze': 'حلّل هذا القسم',
    'common.analyzing': 'جارٍ التحليل…', 'common.result': 'نتيجة التحليل', 'common.metrics': 'المؤشرات',
    'mode.image': 'صورة', 'mode.video': 'فيديو', 'mode.audio': 'صوت', 'mode.live': 'بث مباشر',
    'chat.title': 'مساعد التحليل', 'chat.placeholder': 'اكتب سؤالك…', 'chat.empty': 'اسألني عن نتائج تحليلك', 'chat.typing': 'يكتب…',
    'settings.title': 'الإعدادات',
  },
  en: {
    'app.title': 'Smart Personality Analyzer', 'app.subtitle': 'Personality & emotion analysis',
    'group.home': 'Home', 'group.analyze': 'Analysis', 'group.search': 'Search', 'group.other': 'Other',
    'nav.home': 'Home', 'nav.profile': 'Personal Info', 'nav.analyze': 'Analyze', 'nav.firasa': 'Physiognomy',
    'nav.personality': 'Personality', 'nav.career': 'Career Path', 'nav.deep': 'Deep Personality', 'nav.compare': 'Compare', 'nav.report': 'Full Report',
    'nav.research': 'Research', 'nav.archive': 'Archive', 'nav.chat': 'Assistant', 'nav.history': 'History', 'nav.settings': 'Settings',
    'top.name': 'Person name (optional)', 'top.dark': 'Dark', 'top.light': 'Light',
    'home.welcome': 'Welcome to the Smart Analyzer 👋', 'home.sub': 'Analyze images, video and audio, explore personality and physiognomy, and export professional reports.',
    'home.start': 'Start a new analysis', 'home.total': 'Total analyses', 'home.people': 'People', 'home.last': 'Last activity',
    'home.quick': 'Quick access', 'home.recent': 'Recent analyses', 'home.viewHistory': 'View history →', 'home.dist': 'Analyses by type',
    'home.viewLog': 'View history', 'home.compare': 'Compare', 'home.startAnalysis': 'Start analysis',
    'common.pdf': 'PDF', 'common.html': 'HTML', 'common.autoSaved': 'Auto-saved', 'common.analyze': 'Analyze this section',
    'common.analyzing': 'Analyzing…', 'common.result': 'Analysis result', 'common.metrics': 'Metrics',
    'mode.image': 'Image', 'mode.video': 'Video', 'mode.audio': 'Audio', 'mode.live': 'Live',
    'chat.title': 'Analysis assistant', 'chat.placeholder': 'Type your question…', 'chat.empty': 'Ask me about your analysis results', 'chat.typing': 'Typing…',
    'settings.title': 'Settings',
  },
};

export function makeT(lang) {
  const d = DICT[lang] || DICT.ar;
  return (key) => d[key] ?? DICT.ar[key] ?? key;
}
export const langInstr = (lang) => (lang === 'en' ? ' Respond entirely in English.' : ' أجب بالكامل بالعربية.');

// ترجمة أسماء أنواع التحاليل المعروضة (تحافظ على لاحقة الاسم بعد —)
const TYPE_EN = {
  'تحليل صورة': 'Image analysis', 'تحليل فيديو': 'Video analysis',
  'تحليل صوت': 'Audio analysis', 'تحليل بث مباشر': 'Live analysis',
  'الفراسة العربية': 'Arabic Physiognomy', 'الفراسة الغربية': 'Western Physiognomy',
  'تقرير الشخصية': 'Personality Report', 'البروفايل الشامل': 'Full Profile',
  'المسار المهني': 'Career Path', 'الشخصية المتعمّقة': 'Deep Personality',
  'تحليل': 'Analysis', 'عام': 'General',
};
export function typeLabel(type, lang) {
  if (lang !== 'en' || !type) return type;
  const [base, ...rest] = String(type).split(' — ');
  const en = TYPE_EN[base.trim()] || base;
  return rest.length ? en + ' — ' + rest.join(' — ') : en;
}
