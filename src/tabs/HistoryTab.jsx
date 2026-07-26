import { useState } from 'react';
import { Card, Empty } from '../components/UI.jsx';
import { History, Trash2, CheckSquare, Square, Eraser } from 'lucide-react';
import { useApp } from '../store/AppContext.jsx';
import { typeLabel } from '../services/i18n.js';
import { renderBlocks } from '../components/ResultView.jsx';

export default function HistoryTab() {
  const { records, deleteRecord, deleteRecords, clearRecords, L, lang } = useApp();
  const [sel, setSel] = useState([]);
  const [open, setOpen] = useState(null);

  const toggle = (id) => setSel((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  const allChecked = records.length > 0 && sel.length === records.length;
  const toggleAll = () => setSel(allChecked ? [] : records.map((r) => r.id));
  const delSel = () => { if (sel.length && confirm(L(`مسح ${sel.length} عنصراً؟`,`Delete ${sel.length} item(s)?`))) { deleteRecords(sel); setSel([]); } };
  const delAll = () => { if (confirm(L('مسح كل السجل؟ لا يمكن التراجع.','Delete all history? This cannot be undone.'))) { clearRecords(); setSel([]); } };

  if (records.length === 0)
    return <div className="fade-in"><Card><Empty icon={History} title={L('السجل فارغ','History is empty')} hint={L('ستظهر تحليلاتك المحفوظة هنا.','Your saved analyses will appear here.')} /></Card></div>;

  return (
    <div className="fade-in flex flex-col gap-3">
      <div className="surface flex flex-wrap items-center justify-between gap-2 rounded-xl border p-3">
        <button onClick={toggleAll} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
          {allChecked ? <CheckSquare size={17} className="text-brand" /> : <Square size={17} />} {L('تحديد الكل','Select all')}
          {sel.length > 0 && <span className="text-xs text-slate-400">({sel.length})</span>}
        </button>
        <div className="flex gap-2">
          <button onClick={delSel} disabled={!sel.length}
            className="flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs text-red-500 surface hover:bg-red-500/10 disabled:opacity-40">
            <Trash2 size={14} /> {L('مسح المحدد','Delete selected')}
          </button>
          <button onClick={delAll}
            className="flex items-center gap-1.5 rounded-lg border border-red-400/40 bg-red-500/10 px-3 py-1.5 text-xs font-bold text-red-600 hover:bg-red-500/20">
            <Eraser size={14} /> {L('مسح الكل','Delete all')}
          </button>
        </div>
      </div>

      {records.map((r) => (
        <div key={r.id} className="surface rounded-xl border p-3">
          <div className="flex items-start gap-3">
            <button onClick={() => toggle(r.id)} className="mt-0.5 shrink-0" aria-label="تحديد">
              {sel.includes(r.id) ? <CheckSquare size={18} className="text-brand" /> : <Square size={18} className="text-slate-400" />}
            </button>
            <div className="min-w-0 flex-1 cursor-pointer" onClick={() => setOpen(open === r.id ? null : r.id)}>
              <p className="text-sm font-bold text-brand">{typeLabel(r.type, lang)}</p>
              <p className="text-xs text-slate-500">{new Date(r.date).toLocaleString('ar')} · {r.subject}</p>
              {open !== r.id && <p className="mt-1 line-clamp-2 text-sm text-slate-600 dark:text-slate-300">{r.summary}</p>}
            </div>
            <button onClick={() => deleteRecord(r.id)} className="shrink-0 rounded-lg p-2 text-red-500 hover:bg-red-500/10" aria-label="حذف"><Trash2 size={15} /></button>
          </div>
          {open === r.id && r.full && <div className="mt-3 border-t pt-3">{renderBlocks(r.full)}</div>}
        </div>
      ))}
    </div>
  );
}
