import { Home, ClipboardList, Camera, Moon, UserCircle, Compass, Gauge, Radar, History, Settings, GraduationCap, Archive, FileStack, MessageCircle } from 'lucide-react';
import { useApp } from '../store/AppContext.jsx';

const groups = [
  { title: 'group.home', items: [{ id: 'home', k: 'nav.home', icon: Home }] },
  { title: 'group.analyze', items: [
    { id: 'profile', k: 'nav.profile', icon: ClipboardList },
    { id: 'analyze', k: 'nav.analyze', icon: Camera },
    { id: 'firasa', k: 'nav.firasa', icon: Moon },
    { id: 'personality', k: 'nav.personality', icon: UserCircle },
    { id: 'career', k: 'nav.career', icon: Compass },
    { id: 'deep', k: 'nav.deep', icon: Gauge },
    { id: 'compare', k: 'nav.compare', icon: Radar },
    { id: 'report', k: 'nav.report', icon: FileStack },
  ]},
  { title: 'group.search', items: [
    { id: 'research', k: 'nav.research', icon: GraduationCap },
    { id: 'archive', k: 'nav.archive', icon: Archive },
  ]},
  { title: 'group.other', items: [
    { id: 'chat', k: 'nav.chat', icon: MessageCircle },
    { id: 'history', k: 'nav.history', icon: History },
  ]},
];

export default function Sidebar() {
  const { tab, setTab, t } = useApp();
  const item = ({ id, k, icon: Icon }) => (
    <button key={id} onClick={() => setTab(id)}
      className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition ${tab === id ? 'bg-brand/15 font-bold text-brand' : 'text-slate-500 hover:bg-black/5 dark:hover:bg-white/5'}`}>
      <Icon size={19} /><span>{t(k)}</span>
    </button>
  );
  return (
    <nav className="surface flex w-44 shrink-0 flex-col gap-1 overflow-y-auto p-2" style={{ borderInlineStart: '1px solid var(--border)' }}>
      {groups.map((g) => (
        <div key={g.title} className="mb-1">
          <p className="px-3 pb-1 pt-2 text-[10px] font-bold uppercase tracking-wide text-slate-400">{t(g.title)}</p>
          {g.items.map(item)}
        </div>
      ))}
      <div className="mt-auto border-t pt-1">{item({ id: 'settings', k: 'nav.settings', icon: Settings })}</div>
    </nav>
  );
}
