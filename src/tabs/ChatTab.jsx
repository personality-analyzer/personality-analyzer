import { useMemo, useRef, useState, useEffect } from 'react';
import { Send, Loader2, Bot, User, Sparkles } from 'lucide-react';
import { chatCompletion } from '../services/ai.js';
import { useApp } from '../store/AppContext.jsx';
import { profileText } from '../services/profile.js';
import { langInstr } from '../services/i18n.js';

const SUGGEST = ['اشرح لي نتيجة آخر تحليل', 'ما أبرز نقاط القوة؟', 'كيف أطوّر مجالات الضعف؟', 'لخّص شخصيتي في ٣ نقاط'];

export default function ChatTab() {
  const { records, subject, profile, lang, t } = useApp();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const endRef = useRef(null);

  // ربط المساعد بأحدث نتيجة من كل قسم تحليل (كل الأقسام)
  const context = useMemo(() => {
    const latest = {};
    records
      .filter((r) => r.full && (!subject || r.subject === subject || r.subject === 'عام'))
      .forEach((r) => { if (!latest[r.type]) latest[r.type] = r; });
    const list = Object.values(latest);
    if (!list.length) return '';
    return list.map((r) => `### ${r.type}\n${r.full}`).join('\n\n');
  }, [records, subject]);
  const sectionCount = useMemo(() => new Set(records.filter((r)=>r.full).map((r)=>r.type)).size, [records]);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, loading]);

  const send = async (text) => {
    const q = (text ?? input).trim();
    if (!q || loading) return;
    setInput(''); setError('');
    const next = [...messages, { role: 'user', content: q }];
    setMessages(next); setLoading(true);
    try {
      const info = profileText(profile);
      const system =
        'أنت مساعد ودود يشرح نتائج التحليل الشخصي بالعربية بوضوح وإيجاز، بأسلوب داعم وغير قطعي. ' +
        (info ? info + '\n\n' : '') + langInstr(lang) +
        (context ? 'استند إلى نتائج التحليل التالية للمستخدم عند الإجابة:\n\n' + context : 'لا توجد تحاليل محفوظة بعد؛ اطلب من المستخدم إجراء تحليل أولاً إذا لزم.');
      const reply = await chatCompletion({ system, messages: next.map((m) => ({ role: m.role, content: m.content })) });
      setMessages((m) => [...m, { role: 'assistant', content: reply }]);
    } catch (e) { setError(e.message); } finally { setLoading(false); }
  };

  return (
    <div className="fade-in flex h-[calc(100vh-160px)] flex-col">
      <div className="mb-3 flex items-center gap-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand/15"><Bot size={19} className="text-brand" /></div>
        <div>
          <p className="text-sm font-bold">مساعد التحليل</p>
          <p className="text-xs text-slate-500">{context ? `مرتبط بـ ${sectionCount} من أقسام التحليل` : 'لا توجد تحاليل محفوظة بعد'}</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto rounded-xl border p-4 surface">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center gap-3 py-10 text-center">
            <Sparkles size={30} className="text-brand" />
            <p className="text-sm text-slate-500">اسألني عن نتائج تحليلك</p>
            <div className="flex flex-wrap justify-center gap-2">
              {SUGGEST.map((s) => (
                <button key={s} onClick={() => send(s)} className="rounded-full border px-3 py-1.5 text-xs text-brand surface hover:bg-brand/10">{s}</button>
              ))}
            </div>
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`mb-3 flex gap-2 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${m.role === 'user' ? 'bg-slate-500/15' : 'bg-brand/15'}`}>
              {m.role === 'user' ? <User size={15} /> : <Bot size={15} className="text-brand" />}
            </div>
            <div className={`max-w-[80%] whitespace-pre-wrap rounded-2xl px-3.5 py-2.5 text-sm leading-7 ${m.role === 'user' ? 'bg-brand text-white' : 'surface border'}`}>
              {m.content}
            </div>
          </div>
        ))}
        {loading && <div className="flex items-center gap-2 text-sm text-slate-500"><Loader2 size={15} className="animate-spin" /> يكتب…</div>}
        {error && <p className="text-sm text-red-500">{error}</p>}
        <div ref={endRef} />
      </div>

      <div className="mt-3 flex gap-2">
        <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && send()}
          placeholder="اكتب سؤالك…" className="flex-1 rounded-xl border px-4 py-2.5 text-sm surface outline-none focus:border-brand" />
        <button onClick={() => send()} disabled={loading || !input.trim()}
          className="flex items-center gap-2 rounded-xl bg-brand px-4 text-sm font-bold text-white transition hover:opacity-90 disabled:opacity-50">
          <Send size={16} />
        </button>
      </div>
    </div>
  );
}
