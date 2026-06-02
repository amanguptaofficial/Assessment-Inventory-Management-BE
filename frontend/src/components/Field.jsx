export default function Field({ label, error, children, hint }) {
  return (
    <label className="mb-3.5 flex flex-col">
      <span className="mb-1.5 text-[13px] font-semibold">{label}</span>
      {children}
      {hint && !error && <span className="mt-1 text-xs text-slate-500">{hint}</span>}
      {error && <span className="mt-1 text-xs text-red-600">{error}</span>}
    </label>
  );
}
