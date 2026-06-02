import { useCallback, useState } from "react";
import { customersApi } from "../api/resources";
import { extractErrorMessage } from "../api/client";
import useFetch from "../hooks/useFetch";
import { useToast } from "../context/ToastContext";
import { Loading, ErrorState, EmptyState } from "../components/StateViews";
import Modal from "../components/Modal";
import ConfirmDialog from "../components/ConfirmDialog";
import Field from "../components/Field";

const EMPTY = { full_name: "", email: "", phone: "" };

function validate(form) {
  const errors = {};
  if (!form.full_name.trim()) errors.full_name = "Full name is required";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errors.email = "Enter a valid email";
  if (form.phone.trim().length < 3) errors.phone = "Phone number is required";
  return errors;
}

export default function Customers() {
  const fetcher = useCallback(() => customersApi.list(), []);
  const { data: customers, loading, error, refetch } = useFetch(fetcher);
  const notify = useToast();

  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [formErrors, setFormErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [toDelete, setToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const openCreate = () => {
    setForm(EMPTY);
    setFormErrors({});
    setModalOpen(true);
  };

  const onChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    const errors = validate(form);
    setFormErrors(errors);
    if (Object.keys(errors).length) return;

    setSaving(true);
    try {
      await customersApi.create({
        full_name: form.full_name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
      });
      notify.success("Customer created");
      setModalOpen(false);
      refetch();
    } catch (err) {
      notify.error(extractErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    setDeleting(true);
    try {
      await customersApi.remove(toDelete.id);
      notify.success("Customer deleted");
      setToDelete(null);
      refetch();
    } catch (err) {
      notify.error(extractErrorMessage(err));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <section>
      <div className="page-header">
        <h1>Customers</h1>
        <button className="btn btn-primary" onClick={openCreate}>
          + Add Customer
        </button>
      </div>

      {loading ? (
        <Loading label="Loading customers…" />
      ) : error ? (
        <ErrorState message={error} onRetry={refetch} />
      ) : customers.length === 0 ? (
        <EmptyState message="No customers yet. Add one to start creating orders." />
      ) : (
        <div className="card">
          <table className="table">
            <thead>
              <tr>
                <th>Full Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th className="actions-col">Actions</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((c) => (
                <tr key={c.id}>
                  <td>{c.full_name}</td>
                  <td>{c.email}</td>
                  <td>{c.phone}</td>
                  <td className="actions-col">
                    <button className="btn btn-danger btn-sm" onClick={() => setToDelete(c)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal title="Add Customer" open={modalOpen} onClose={() => setModalOpen(false)}>
        <form onSubmit={onSubmit} noValidate>
          <Field label="Full Name" error={formErrors.full_name}>
            <input name="full_name" value={form.full_name} onChange={onChange} placeholder="Jane Doe" />
          </Field>
          <Field label="Email" error={formErrors.email} hint="Must be unique">
            <input name="email" type="email" value={form.email} onChange={onChange} placeholder="jane@example.com" />
          </Field>
          <Field label="Phone" error={formErrors.phone}>
            <input name="phone" value={form.phone} onChange={onChange} placeholder="+1-555-0100" />
          </Field>
          <div className="form-actions">
            <button type="button" className="btn btn-ghost" onClick={() => setModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? "Saving…" : "Create"}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={Boolean(toDelete)}
        title="Delete customer?"
        message={toDelete ? `"${toDelete.full_name}" will be permanently removed.` : ""}
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(null)}
        busy={deleting}
      />
    </section>
  );
}
