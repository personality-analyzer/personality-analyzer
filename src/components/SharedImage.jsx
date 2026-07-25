import { useState } from 'react';
import { UploadCloud, X, Check, Loader2 } from 'lucide-react';
import { useApp } from '../store/AppContext.jsx';
import { compressImage } from '../services/ai.js';

export default function SharedImage({ compact }) {
  const { sharedImage, setSharedImage } = useApp();
  const [busy, setBusy] = useState(false);
  const onPick = async (e) => {
    const f = e.target.files?.[0]; if (!f) return;
    setBusy(true);
    try {
      const { dataUrl, b64, type } = await compressImage(f);
      setSharedImage({ dataUrl, b64, type, name: f.name });
    } finally { setBusy(false); }
  };
  if (sharedImage) {
    return (
      <div className="surface flex items-center gap-3 rounded-xl border p-3">
        <img src={sharedImage.dataUrl} alt="" className="h-16 w-16 rounded-lg object-cover" />
        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-1 text-xs font-bold text-green-600"><Check size={13} /> صورة موحّدة (مضغوطة)</p>
          <p className="truncate text-xs text-slate-500">{sharedImage.name}</p>
          <p className="text-[11px] text-slate-400">تُستخدم في كل الأقسام</p>
        </div>
        <label className="cursor-pointer rounded-lg border px-2.5 py-1.5 text-xs surface hover:bg-black/5 dark:hover:bg-white/5">
          تغيير<input type="file" accept="image/*" className="hidden" onChange={onPick} />
        </label>
        <button onClick={() => setSharedImage(null)} className="rounded-lg p-1.5 text-red-500 hover:bg-red-500/10" aria-label="حذف"><X size={15} /></button>
      </div>
    );
  }
  return (
    <label className="cursor-pointer">
      <input type="file" accept="image/*" className="hidden" onChange={onPick} />
      <div className={`rounded-xl border-2 border-dashed text-center surface transition hover:border-brand ${compact ? 'p-5' : 'p-8'}`}>
        {busy ? <Loader2 size={compact ? 26 : 34} className="mx-auto animate-spin text-brand" /> : <UploadCloud size={compact ? 26 : 34} className="mx-auto text-slate-400" />}
        <p className="mt-2 text-sm font-bold">{busy ? 'جارٍ الضغط…' : 'اسحب صورة هنا أو اضغط للاختيار'}</p>
        <p className="text-xs text-slate-500">تُضغط تلقائياً وتُطبَّق على كل الأقسام · JPG · PNG</p>
      </div>
    </label>
  );
}
