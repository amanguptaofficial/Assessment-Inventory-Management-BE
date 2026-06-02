import { Trash2 } from "lucide-react";
import Modal from "./Modal";
import Button from "./ui/Button";

export default function ConfirmDialog({ open, title, message, onConfirm, onCancel, busy }) {
  return (
    <Modal title={title || "Are you sure?"} open={open} onClose={onCancel}>
      <p className="text-slate-500">{message}</p>
      <div className="mt-5 flex justify-end gap-2.5">
        <Button variant="ghost" onClick={onCancel} disabled={busy}>
          Cancel
        </Button>
        <Button variant="danger" onClick={onConfirm} disabled={busy}>
          <Trash2 className="size-4" /> {busy ? "Deleting…" : "Delete"}
        </Button>
      </div>
    </Modal>
  );
}
