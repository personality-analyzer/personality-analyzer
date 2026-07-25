import { useState } from 'react';
import { Search, Loader2, ExternalLink, Archive } from 'lucide-react';
import { Card, Button, Empty } from '../components/UI.jsx';

const TYPES = [
  { id: '', label: 'الكل' },
  { id: 'image', label: 'صور' },
  { id: 'texts', label: 'كتب/نصوص' },
  { id: 'movies', label: 'فيديو' },
  { id: 'audio', label: 'صوت' },
];

// بحث مجاني في أرشيف الإنترنت archive.org (بلا مفتاح)
export default function ArchiveTab() {
  const [q, setQ] = useState('');
  const [type, setType] = useState('');
  const [items, setItems] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const search = async () => {
    if (!q.trim()) return;
    setLoading(true); setError(''); setItems(null);
    try {
      let query = q;
      if (type) query += ` AND mediatype:${type}`;
      const url = `https://archive.org/advancedsearch.php?q=${encodeURIComponent(query)}&fl[]=identifier&fl[]=title&fl[]=creator&fl[]=year&fl[]=mediatype&rows=18&output=json`;
      const res = await fetch(url);
      const data = await res.json();
      setItems((data.response?.docs || []));
    } catch (e) { setError('تعذّر البحث: ' + e.message); } finally { setLoading(false); }
  };

  return (
    <div className="fade-in flex flex-col gap-4">
      <Card>
        <div className="mb-2 flex items-center gap-2 text-brand"><Archive size={18} /><p className="text-sm font-bold">أرشيف الإنترنت</p></div>
        <p className="mb-3 text-xs text-slate-500">ابحث في ملايين العناصر المجانية على archive.org (صور، كتب، فيديو، صوت).</p>
        <div className="mb-2 flex gap-2">
          <input value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && search()}
            placeholder="كلمة البحث…" className="flex-1 rounded-lg border px-3 py-2 text-sm surface outline-none focus:border-brand" />
          <Button onClick={search} disabled={loading} className="shrink-0">
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />} بحث
          </Button>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {TYPES.map((t) => (
            <button key={t.id} onClick={() => setType(t.id)}
              className={`rounded-full px-3 py-1 text-xs transition ${type === t.id ? 'bg-brand/15 font-bold text-brand' : 'surface border text-slate-500'}`}>{t.label}</button>
          ))}
        </div>
      </Card>

      <Card>
        <p className="mb-2 text-xs font-bold text-slate-500">ابحث أيضاً في أشهر المواقع العالمية:</p>
        <div className="flex flex-wrap gap-2">
          {[
            ['YouTube', `https://www.youtube.com/results?search_query=${encodeURIComponent(q)}`],
            ['Vimeo', `https://vimeo.com/search?q=${encodeURIComponent(q)}`],
            ['SoundCloud', `https://soundcloud.com/search?q=${encodeURIComponent(q)}`],
            ['Google', `https://www.google.com/search?q=${encodeURIComponent(q)}`],
            ['Wikimedia', `https://commons.wikimedia.org/w/index.php?search=${encodeURIComponent(q)}`],
          ].map(([name, url]) => (
            <a key={name} href={q ? url : '#'} target="_blank" rel="noreferrer"
              className={`rounded-full border px-3 py-1.5 text-xs transition ${q ? 'surface text-brand hover:bg-brand/10' : 'surface text-slate-400 pointer-events-none'}`}>
              {name}
            </a>
          ))}
        </div>
      </Card>

      {error && <Card className="text-sm text-red-500">{error}</Card>}
      {items && items.length === 0 && <Card><Empty icon={Search} title="لا نتائج" hint="جرّب كلمات أخرى." /></Card>}
      {items && items.length > 0 && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {items.map((it) => (
            <a key={it.identifier} href={`https://archive.org/details/${it.identifier}`} target="_blank" rel="noreferrer"
              className="surface flex gap-3 rounded-xl border p-3 transition hover:border-brand">
              {it.mediatype === 'image' && (
                <img src={`https://archive.org/services/img/${it.identifier}`} alt="" className="h-16 w-16 shrink-0 rounded-lg object-cover" loading="lazy" />
              )}
              <div className="min-w-0">
                <p className="line-clamp-2 text-sm font-bold leading-6">{it.title || it.identifier}</p>
                <p className="truncate text-xs text-slate-500">{Array.isArray(it.creator) ? it.creator[0] : it.creator || ''}{it.year ? ` · ${it.year}` : ''}</p>
                <span className="mt-1 inline-flex items-center gap-1 text-xs text-brand"><ExternalLink size={11} /> فتح</span>
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
