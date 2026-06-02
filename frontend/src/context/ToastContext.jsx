import { createContext, useCallback, useContext, useMemo, useState } from "react";

const ToastContext = createContext(null);

let idCounter = 0;

/**
 * Lightweight global toast system. Provides `notify.success(msg)` /
 * `notify.error(msg)` to any component, satisfying the "clear error and
 * success messages" requirement without an extra dependency.
 */
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const remove = useCallback((id) => {
    setToasts((current) => current.filter((t) => t.id !== id));
  }, []);

  const push = useCallback(
    (type, message) => {
      const id = ++idCounter;
      setToasts((current) => [...current, { id, type, message }]);
      setTimeout(() => remove(id), 4000);
    },
    [remove]
  );

  const notify = useMemo(
    () => ({
      success: (msg) => push("success", msg),
      error: (msg) => push("error", msg),
    }),
    [push]
  );

  return (
    <ToastContext.Provider value={notify}>
      {children}
      <div className="toast-container">
        {toasts.map((t) => (
          <div key={t.id} className={`toast toast-${t.type}`} onClick={() => remove(t.id)}>
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within a ToastProvider");
  return ctx;
}
