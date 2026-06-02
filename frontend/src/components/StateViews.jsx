import Button from "./ui/Button";

const wrap = "flex flex-col items-center gap-3 p-10 text-center";

export function Loading({ label = "Loading…" }) {
  return (
    <div className={`${wrap} text-slate-500`}>
      <div className="h-7 w-7 animate-spin rounded-full border-[3px] border-slate-200 border-t-blue-600" />
      <span>{label}</span>
    </div>
  );
}

export function EmptyState({ message }) {
  return <div className={`${wrap} text-slate-500`}>{message}</div>;
}

export function ErrorState({ message, onRetry }) {
  return (
    <div className={`${wrap} text-red-600`}>
      <span>{message}</span>
      {onRetry && (
        <Button variant="ghost" onClick={onRetry}>
          Retry
        </Button>
      )}
    </div>
  );
}
