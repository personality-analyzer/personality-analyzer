import { Brain, Sun, Moon, User, Languages } from 'lucide-react';
import { useApp } from '../store/AppContext.jsx';

export default function Topbar() {
  const { theme, setTheme, lang, setLang, subject, setSubject, t } = useApp();
  return (
    <header className="surface flex flex-wrap items-center justify-between gap-3 border-b px-5 py-3">
      <div className="flex items-center gap-2.5">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand/15"><Brain size={20} className="text-brand" /></div>
        <div>
          <p className="text-[15px] font-bold leading-tight">{t('app.title')}</p>
          <p className="text-xs text-slate-500">{t('app.subtitle')}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 surface">
          <User size={14} className="text-slate-400" />
          <input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder={t('top.name')} className="w-32 bg-transparent text-xs outline-none" />
        </div>
        <button onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')}
          className="surface flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs hover:bg-black/5 dark:hover:bg-white/5" aria-label="language">
          <Languages size={15} /> {lang === 'ar' ? 'EN' : 'ع'}
        </button>
        <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
          className="surface flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs hover:bg-black/5 dark:hover:bg-white/5" aria-label="theme">
          {theme === 'light' ? <Moon size={15} /> : <Sun size={15} />}
          {theme === 'light' ? t('top.dark') : t('top.light')}
        </button>
      </div>
    </header>
  );
}
