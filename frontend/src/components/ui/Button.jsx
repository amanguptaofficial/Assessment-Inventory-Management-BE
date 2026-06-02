const BASE =
  "inline-flex items-center justify-center gap-1 rounded-lg font-semibold transition " +
  "disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600/30";

const VARIANTS = {
  primary: "bg-blue-600 text-white hover:bg-blue-700",
  ghost: "border border-slate-200 text-slate-800 hover:bg-slate-100",
  danger: "border border-red-200 bg-red-50 text-red-600 hover:bg-red-100",
};

const SIZES = {
  md: "px-4 py-2 text-sm",
  sm: "px-3 py-1.5 text-[13px]",
};

export default function Button({
  variant = "primary",
  size = "md",
  className = "",
  type = "button",
  ...props
}) {
  return (
    <button
      type={type}
      className={`${BASE} ${SIZES[size]} ${VARIANTS[variant]} ${className}`}
      {...props}
    />
  );
}
