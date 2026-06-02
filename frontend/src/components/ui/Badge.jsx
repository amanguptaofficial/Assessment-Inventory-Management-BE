const TONES = {
  ok: "bg-green-50 text-green-600",
  warn: "bg-amber-50 text-amber-600",
  neutral: "bg-slate-100 text-slate-600",
};

export default function Badge({ tone = "neutral", children }) {
  return (
    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${TONES[tone]}`}>
      {children}
    </span>
  );
}
