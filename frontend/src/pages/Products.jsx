import { useCallback, useState } from "react";
import { productsApi } from "../api/resources";
import { extractErrorMessage } from "../api/client";
import useFetch from "../hooks/useFetch";
import { useToast } from "../context/ToastContext";
import { Loading, ErrorState, EmptyState } from "../components/StateViews";
import Modal from "../components/Modal";
import ConfirmDialog from "../components/ConfirmDialog";
import Field from "../components/Field";

const EMPTY = { name: "", sku: "", price: "", quantity_in_stock: "" };

function validate(form) {
  const errors = {};
  if (!form.name.trim()) errors.name = "Name is required";
  if (!form.sku.trim()) errors.sku = "SKU is required";
  if (form.price === "" || Number(form.price) < 0) errors.price = "Price must be 0 or more";
  if (form.quantity_in_stock === "" || Number(form.quantity_in_stock) < 0)
    errors.quantity_in_stock = "Quantity must be 0 or more";
  return errors;
}

export default function Products() {
  const fetcher = useCallback(() => productsApi.list(), []);
  const { data: products, loading, error, refetch } = useFetch(fetcher);
  const notify = useToast();

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null); // product being edited or null
  const [form, setForm] = useState(EMPTY);
  const [formErrors, setFormErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [toDelete, setToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY);
    setFormErrors({});
    setModalOpen(true);
  };

  const openEdit = (product) => {
    setEditing(product);
    setForm({
      name: product.name,
      sku: product.sku,
      price: product.price,
      quantity_in_stock: product.quantity_in_stock,
    });
    setFormErrors({});
    setModalOpen(true);
  };

  const onChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    const errors = validate(form);
    setFormErrors(errors);
    if (Object.keys(errors).length) return;

    const payload = {
      name: form.name.trim(),
      sku: form.sku.trim(),
      price: Number(form.price),
      quantity_in_stock: Number(form.quantity_in_stock),
    };

    setSaving(true);
    try {
      if (editing) {
        await productsApi.update(editing.id, payload);
        notify.success("Product updated");
      } else {
        await productsApi.create(payload);
        notify.success("Product created");
      }
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
      await productsApi.remove(toDelete.id);
      notify.success("Product deleted");
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
        <h1>Products</h1>
        <button className="btn btn-primary" onClick={openCreate}>
          + Add Product
        </button>
      </div>

      {loading ? (
        <Loading label="Loading products…" />
      ) : error ? (
        <ErrorState message={error} onRetry={refetch} />
      ) : products.length === 0 ? (
        <EmptyState message="No products yet. Add your first product to get started." />
      ) : (
        <div className="card">
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>SKU</th>
                <th className="num">Price</th>
                <th className="num">In Stock</th>
                <th className="actions-col">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id}>
                  <td>{p.name}</td>
                  <td><code>{p.sku}</code></td>
                  <td className="num">${Number(p.price).toFixed(2)}</td>
                  <td className="num">
                    <span className={`badge ${p.quantity_in_stock <= 10 ? "badge-warn" : "badge-ok"}`}>
                      {p.quantity_in_stock}
                    </span>
                  </td>
                  <td className="actions-col">
                    <button className="btn btn-ghost btn-sm" onClick={() => openEdit(p)}>
                      Edit
                    </button>
                    <button className="btn btn-danger btn-sm" onClick={() => setToDelete(p)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        title={editing ? "Edit Product" : "Add Product"}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
      >
        <form onSubmit={onSubmit} noValidate>
          <Field label="Product Name" error={formErrors.name}>
            <input name="name" value={form.name} onChange={onChange} placeholder="Wireless Mouse" />
          </Field>
          <Field label="SKU / Code" error={formErrors.sku} hint="Must be unique">
            <input name="sku" value={form.sku} onChange={onChange} placeholder="WM-001" />
          </Field>
          <div className="form-row">
            <Field label="Price" error={formErrors.price}>
              <input
                name="price"
                type="number"
                step="0.01"
                min="0"
                value={form.price}
                onChange={onChange}
                placeholder="19.99"
              />
            </Field>
            <Field label="Quantity in Stock" error={formErrors.quantity_in_stock}>
              <input
                name="quantity_in_stock"
                type="number"
                min="0"
                value={form.quantity_in_stock}
                onChange={onChange}
                placeholder="100"
              />
            </Field>
          </div>
          <div className="form-actions">
            <button type="button" className="btn btn-ghost" onClick={() => setModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? "Saving…" : editing ? "Update" : "Create"}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={Boolean(toDelete)}
        title="Delete product?"
        message={toDelete ? `"${toDelete.name}" (${toDelete.sku}) will be permanently removed.` : ""}
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(null)}
        busy={deleting}
      />
    </section>
  );
}
