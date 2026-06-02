/** Small presentational helpers for loading / empty / error states. */

export function Loading({ label = "Loading…" }) {
  return (
    <div className="state-view">
      <div className="spinner" />
      <span>{label}</span>
    </div>
  );
}

export function EmptyState({ message }) {
  return <div className="state-view muted">{message}</div>;
}

export function ErrorState({ message, onRetry }) {
  return (
    <div className="state-view error">
      <span>{message}</span>
      {onRetry && (
        <button className="btn btn-ghost" onClick={onRetry}>
          Retry
        </button>
      )}
    </div>
  );
}
