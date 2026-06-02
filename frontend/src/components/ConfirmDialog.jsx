import Modal from "./Modal";

/** Confirmation dialog for destructive actions (delete). */
export default function ConfirmDialog({ open, title, message, onConfirm, onCancel, busy }) {
  return (
    <Modal title={title || "Are you sure?"} open={open} onClose={onCancel}>
      <p className="confirm-message">{message}</p>
      <div className="form-actions">
        <button className="btn btn-ghost" onClick={onCancel} disabled={busy}>
          Cancel
        </button>
        <button className="btn btn-danger" onClick={onConfirm} disabled={busy}>
          {busy ? "Deleting…" : "Delete"}
        </button>
      </div>
    </Modal>
  );
}
