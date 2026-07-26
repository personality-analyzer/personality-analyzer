import { useState } from 'react';
import { openExternal } from '../services/openLink.js';
import { Search, Loader2, ExternalLink, GraduationCap } from 'lucide-react';
import { Card, Button, Empty } from '../components/UI.jsx';
import { useApp } from '../store/AppContext.jsx';

// بحث علمي مجاني عبر OpenAlex (250M+ ورقة، بلا مفتاح، بكل اللغات)
export default function ResearchTab() {
  const { L } = useApp();
  const [q, setQ] = useState('');
  const [items, setItems] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const search = async () => {
    if (!q.trim()) return;
    setLoading(true); setError(''); setItems(null);
    try {
      const url = `https://api.openalex.org/works?search=${encodeURIComponent(q)}&per-page=15&mailto=app@example.com`;
      const res = await fetch(url);
      const data = await res.json();
      setItems(
        (data.results || []).map((w) => ({
          id: w.id,
          title: w.display_name || 'بدون عنوان',
          year: w.publication_year,
          authors: (w.authorships || []).slice(0, 4).map((a) => a.author?.display_name).filter(Boolean).join('، '),
          venue: w.primary_location?.source?.display_name || '',
          cites: w.cited_by_count || 0,
          oa: w.open_access?.oa_url,
          doi: w.doi,
          lang: w.language,
        }))
      );
    } catch (e) { setError(L('تعذّر البحث: ','Search failed: ') + e.message); } finally { setLoading(false); }
  };

  return (
    <div className="fade-in flex flex-col gap-4">
      <Card>
        <div className="mb-2 flex items-center gap-2 text-brand"><GraduationCap size={18} /><p className="text-sm font-bold">{L('البحث العلمي','Research')}</p></div>
        <p className="mb-3 text-xs text-slate-500">{L('ابحث في أكثر من 250 مليون ورقة علمية بكل اللغات — مجاناً عبر OpenAlex.','Search 250M+ scholarly papers in all languages — free via OpenAlex.')}</p>
        <div className="flex gap-2">
          <input value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && search()}
            placeholder={L('اكتب موضوع البحث… (عربي أو إنجليزي)','Enter a topic… (Arabic or English)')} className="flex-1 rounded-lg border px-3 py-2 text-sm surface outline-none focus:border-brand" />
          <Button onClick={search} disabled={loading} className="shrink-0">
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />} {L('بحث','Search')}
          </Button>
        </div>
      </Card>

      {error && <Card className="text-sm text-red-500">{error}</Card>}
      {items && items.length === 0 && <Card><Empty icon={Search} title={L('لا نتائج','No results')} hint={L('جرّب كلمات أخرى.','Try different keywords.')} /></Card>}
      {items && items.map((it) => (
        <Card key={it.id} className="flex flex-col gap-1">
          <p className="text-sm font-bold leading-6">{it.title}</p>
          <p className="text-xs text-slate-500">{it.authors}{it.year ? ` · ${it.year}` : ''}{it.venue ? ` · ${it.venue}` : ''}</p>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs">
            <span className="rounded-full bg-brand/10 px-2 py-0.5 text-brand">{L('استشهادات','Citations')}: {it.cites}</span>
            {it.lang && <span className="rounded-full bg-slate-500/10 px-2 py-0.5 text-slate-500">{it.lang}</span>}
            {it.oa && <a href={it.oa} target="_blank" rel="noreferrer" onClick={(e) => { e.preventDefault(); openExternal(e.currentTarget.href); }} className="flex items-center gap-1 text-brand hover:underline"><ExternalLink size={12} /> نص كامل مجاني</a>}
            {it.doi && <a href={it.doi} target="_blank" rel="noreferrer" onClick={(e) => { e.preventDefault(); openExternal(e.currentTarget.href); }} className="flex items-center gap-1 text-slate-500 hover:underline"><ExternalLink size={12} /> DOI</a>}
          </div>
        </Card>
      ))}
    </div>
  );
}
