export function Card({ children, className = '' }) {
  return <div className={`surface rounded-xl border p-4 ${className}`}>{children}</div>;
}
export function Button({ children, onClick, disabled, variant = 'primary', className = '' }) {
  const base = 'flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-bold transition disabled:opacity-50';
  const styles =
    variant === 'primary'
      ? 'bg-brand text-white hover:opacity-90'
      : 'border surface text-slate-600 dark:text-slate-300 hover:bg-black/5 dark:hover:bg-white/5';
  return (
    <button onClick={onClick} disabled={disabled} className={`${base} ${styles} ${className}`}>
      {children}
    </button>
  );
}
export function Empty({ icon: Icon, title, hint }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      {Icon && <Icon size={40} className="mb-3 text-slate-400" />}
      <p className="text-sm font-bold">{title}</p>
      {hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
    </div>
  );
}
