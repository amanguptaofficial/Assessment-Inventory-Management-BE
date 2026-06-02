import { useCallback, useState } from "react";
import { Plus, Trash2, Eye } from "lucide-react";
import { customersApi } from "../api/resources";
import { extractErrorMessage } from "../api/client";
import useFetch from "../hooks/useFetch";
import { useToast } from "../context/ToastContext";
import { Loading, ErrorState, EmptyState } from "../components/StateViews";
import Modal from "../components/Modal";
import ConfirmDialog from "../components/ConfirmDialog";
import Field from "../components/Field";
import Button from "../components/ui/Button";
import { cardClass, inputClass, thClass, tdClass } from "../components/ui/styles";

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
  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const openCreate = () => {
    setForm(EMPTY);
    setFormErrors({});
    setModalOpen(true);
  };

  const openDetail = async (id) => {
    setDetail(null);
    setDetailLoading(true);
    try {
      const data = await customersApi.get(id);
      setDetail(data);
    } catch (err) {
      notify.error(extractErrorMessage(err));
    } finally {
      setDetailLoading(false);
    }
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
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Customers</h1>
        <Button onClick={openCreate} className="max-sm:w-full">
          <Plus className="size-4" /> Add Customer
        </Button>
      </div>

      {loading ? (
        <Loading label="Loading customers…" />
      ) : error ? (
        <ErrorState message={error} onRetry={refetch} />
      ) : customers.length === 0 ? (
        <EmptyState message="No customers yet. Add one to start creating orders." />
      ) : (
        <div className={`${cardClass} overflow-x-auto`}>
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr>
                <th className={thClass}>Full Name</th>
                <th className={thClass}>Email</th>
                <th className={thClass}>Phone</th>
                <th className={`${thClass} text-right`}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50">
                  <td className={tdClass}>{c.full_name}</td>
                  <td className={tdClass}>{c.email}</td>
                  <td className={tdClass}>{c.phone}</td>
                  <td className={`${tdClass} whitespace-nowrap text-right`}>
                    <div className="inline-flex gap-2">
                      <Button variant="ghost" size="sm" onClick={() => openDetail(c.id)}>
                        <Eye className="size-3.5" /> View
                      </Button>
                      <Button variant="danger" size="sm" onClick={() => setToDelete(c)}>
                        <Trash2 className="size-3.5" /> Delete
                      </Button>
                    </div>
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
            <input className={inputClass} name="full_name" value={form.full_name} onChange={onChange} placeholder="Jane Doe" />
          </Field>
          <Field label="Email" error={formErrors.email} hint="Must be unique">
            <input className={inputClass} name="email" type="email" value={form.email} onChange={onChange} placeholder="jane@example.com" />
          </Field>
          <Field label="Phone" error={formErrors.phone}>
            <input className={inputClass} name="phone" value={form.phone} onChange={onChange} placeholder="+1-555-0100" />
          </Field>
          <div className="mt-5 flex justify-end gap-2.5">
            <Button variant="ghost" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Saving…" : "Create"}
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        title="Customer Details"
        open={detailLoading || Boolean(detail)}
        onClose={() => setDetail(null)}
      >
        {detailLoading ? (
          <Loading label="Loading customer…" />
        ) : (
          detail && (
            <dl className="grid grid-cols-[110px_1fr] gap-y-3 text-sm">
              <dt className="font-semibold text-slate-500">ID</dt>
              <dd>#{detail.id}</dd>
              <dt className="font-semibold text-slate-500">Full Name</dt>
              <dd>{detail.full_name}</dd>
              <dt className="font-semibold text-slate-500">Email</dt>
              <dd>{detail.email}</dd>
              <dt className="font-semibold text-slate-500">Phone</dt>
              <dd>{detail.phone}</dd>
              <dt className="font-semibold text-slate-500">Created</dt>
              <dd>{new Date(detail.created_at).toLocaleString()}</dd>
            </dl>
          )
        )}
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
