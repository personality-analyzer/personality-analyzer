import { useMemo } from 'react';
import { Camera, Moon, UserCircle, FileStack, GraduationCap, Archive, Clock, Layers, Users, Sparkles, BarChart3 } from 'lucide-react';
import { useApp } from '../store/AppContext.jsx';
import { typeLabel } from '../services/i18n.js';

const QUICK = [
  { id: 'analyze', k: 'nav.analyze', icon: Camera },
  { id: 'firasa', k: 'nav.firasa', icon: Moon },
  { id: 'personality', k: 'nav.personality', icon: UserCircle },
  { id: 'report', k: 'nav.report', icon: FileStack },
  { id: 'research', k: 'nav.research', icon: GraduationCap },
  { id: 'archive', k: 'nav.archive', icon: Archive },
];

function Stat({ icon: Icon, value, label, onClick, hint }) {
  return (
    <button onClick={onClick} type="button"
      className="surface group flex items-center gap-3 rounded-xl border p-4 text-start transition hover:border-brand hover:bg-brand/5">
      <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-brand/10"><Icon size={20} className="text-brand" /></div>
      <div className="min-w-0">
        <p className="text-xl font-black">{value}</p>
        <p className="text-xs text-slate-500">{label}</p>
        <p className="mt-0.5 text-[10px] text-brand opacity-0 transition group-hover:opacity-100">{hint}</p>
      </div>
    </button>
  );
}

export default function HomeTab() {
  const { records, setTab, t, lang } = useApp();
  const people = new Set(records.map((r) => r.subject)).size;
  const last = records[0];
  const dist = useMemo(() => {
    const m = {};
    records.forEach((r) => { m[r.type] = (m[r.type] || 0) + 1; });
    return Object.entries(m).sort((a, b) => b[1] - a[1]);
  }, [records]);
  const maxCount = dist.length ? dist[0][1] : 0;

  return (
    <div className="fade-in flex flex-col gap-5">
      <div className="overflow-hidden rounded-2xl border" style={{ background: 'linear-gradient(135deg,#0e7490,#0b5566)' }}>
        <div className="p-6 text-white">
          <p className="text-lg font-black">{t('home.welcome')}</p>
          <p className="mt-1 text-sm text-white/85">{t('home.sub')}</p>
          <button onClick={() => setTab('analyze')} className="mt-4 flex items-center gap-2 rounded-xl bg-white/15 px-4 py-2 text-sm font-bold backdrop-blur hover:bg-white/25">
            <Sparkles size={16} /> {t('home.start')}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Stat icon={Layers} value={records.length} label={t('home.total')} hint={t('home.viewLog')} onClick={() => setTab('history')} />
        <Stat icon={Users} value={people || 0} label={t('home.people')} hint={t('home.compare')} onClick={() => setTab('compare')} />
        <Stat icon={Clock} value={last ? new Date(last.date).toLocaleDateString() : '—'} label={t('home.last')} hint={last ? t('home.viewLog') : t('home.startAnalysis')} onClick={() => setTab(last ? 'history' : 'analyze')} />
      </div>

      <div>
        <p className="mb-2 text-sm font-bold text-slate-500">{t('home.quick')}</p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {QUICK.map(({ id, k, icon: Icon }) => (
            <button key={id} onClick={() => setTab(id)}
              className="surface flex flex-col items-center gap-2 rounded-xl border p-4 transition hover:border-brand hover:bg-brand/5">
              <Icon size={22} className="text-brand" />
              <span className="text-sm font-bold">{t(k)}</span>
            </button>
          ))}
        </div>
      </div>

      {dist.length > 0 && (
        <div className="surface rounded-2xl border p-5">
          <div className="mb-3 flex items-center gap-2 text-brand"><BarChart3 size={17} /><p className="text-sm font-bold">{t('home.dist')}</p></div>
          <div className="flex flex-col gap-2.5">
            {dist.map(([type, count]) => (
              <div key={type}>
                <div className="mb-1 flex justify-between text-xs"><span className="font-bold">{typeLabel(type, lang)}</span><span className="text-slate-500">{count}</span></div>
                <div className="h-2.5 rounded-full bg-slate-500/15"><div className="h-2.5 rounded-full bg-brand" style={{ width: `${Math.round((count / maxCount) * 100)}%` }} /></div>
              </div>
            ))}
          </div>
        </div>
      )}

      {records.length > 0 && (
        <div>
          <div className="mb-2 flex items-center justify-between">
            <p className="text-sm font-bold text-slate-500">{t('home.recent')}</p>
            <button onClick={() => setTab('history')} className="text-xs text-brand hover:underline">{t('home.viewHistory')}</button>
          </div>
          <div className="flex flex-col gap-2">
            {records.slice(0, 5).map((r) => (
              <div key={r.id} className="surface flex items-center justify-between rounded-xl border p-3">
                <div className="min-w-0">
                  <p className="text-sm font-bold text-brand">{typeLabel(r.type, lang)}</p>
                  <p className="truncate text-xs text-slate-500">{new Date(r.date).toLocaleString()} · {r.subject}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
