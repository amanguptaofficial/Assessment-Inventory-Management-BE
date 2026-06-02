import { useCallback, useMemo, useState } from "react";
import { customersApi, ordersApi, productsApi } from "../api/resources";
import { extractErrorMessage } from "../api/client";
import useFetch from "../hooks/useFetch";
import { useToast } from "../context/ToastContext";
import { Loading, ErrorState, EmptyState } from "../components/StateViews";
import Modal from "../components/Modal";
import ConfirmDialog from "../components/ConfirmDialog";
import Field from "../components/Field";

const money = (v) => `$${Number(v).toFixed(2)}`;

export default function Orders() {
  const fetchOrders = useCallback(() => ordersApi.list(), []);
  const { data: orders, loading, error, refetch } = useFetch(fetchOrders);
  const notify = useToast();

  // Reference data for the create form, loaded lazily when the modal opens.
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);

  const [modalOpen, setModalOpen] = useState(false);
  const [customerId, setCustomerId] = useState("");
  const [lines, setLines] = useState([{ product_id: "", quantity: 1 }]);
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  const [detail, setDetail] = useState(null);
  const [toDelete, setToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const productById = useMemo(
    () => Object.fromEntries(products.map((p) => [String(p.id), p])),
    [products]
  );

  const estimatedTotal = useMemo(
    () =>
      lines.reduce((sum, l) => {
        const p = productById[String(l.product_id)];
        return sum + (p ? Number(p.price) * Number(l.quantity || 0) : 0);
      }, 0),
    [lines, productById]
  );

  const openCreate = async () => {
    setCustomerId("");
    setLines([{ product_id: "", quantity: 1 }]);
    setFormError("");
    setModalOpen(true);
    try {
      const [cs, ps] = await Promise.all([customersApi.list(), productsApi.list()]);
      setCustomers(cs);
      setProducts(ps);
    } catch (err) {
      notify.error(extractErrorMessage(err));
    }
  };

  const updateLine = (i, field, value) =>
    setLines((cur) => cur.map((l, idx) => (idx === i ? { ...l, [field]: value } : l)));
  const addLine = () => setLines((cur) => [...cur, { product_id: "", quantity: 1 }]);
  const removeLine = (i) => setLines((cur) => cur.filter((_, idx) => idx !== i));

  const onSubmit = async (e) => {
    e.preventDefault();
    setFormError("");

    if (!customerId) return setFormError("Please select a customer.");
    const items = lines
      .filter((l) => l.product_id && Number(l.quantity) > 0)
      .map((l) => ({ product_id: Number(l.product_id), quantity: Number(l.quantity) }));
    if (items.length === 0) return setFormError("Add at least one product line.");

    setSaving(true);
    try {
      await ordersApi.create({ customer_id: Number(customerId), items });
      notify.success("Order created");
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
      await ordersApi.remove(toDelete.id);
      notify.success("Order cancelled and stock restored");
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
        <h1>Orders</h1>
        <button className="btn btn-primary" onClick={openCreate}>
          + Create Order
        </button>
      </div>

      {loading ? (
        <Loading label="Loading orders…" />
      ) : error ? (
        <ErrorState message={error} onRetry={refetch} />
      ) : orders.length === 0 ? (
        <EmptyState message="No orders yet. Create your first order." />
      ) : (
        <div className="card">
          <table className="table">
            <thead>
              <tr>
                <th>Order #</th>
                <th>Customer ID</th>
                <th className="num">Items</th>
                <th className="num">Total</th>
                <th>Status</th>
                <th className="actions-col">Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id}>
                  <td>#{o.id}</td>
                  <td>{o.customer_id}</td>
                  <td className="num">{o.items.length}</td>
                  <td className="num">{money(o.total_amount)}</td>
                  <td><span className="badge badge-ok">{o.status}</span></td>
                  <td className="actions-col">
                    <button className="btn btn-ghost btn-sm" onClick={() => setDetail(o)}>
                      View
                    </button>
                    <button className="btn btn-danger btn-sm" onClick={() => setToDelete(o)}>
                      Cancel
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create order modal */}
      <Modal title="Create Order" open={modalOpen} onClose={() => setModalOpen(false)}>
        <form onSubmit={onSubmit} noValidate>
          <Field label="Customer">
            <select value={customerId} onChange={(e) => setCustomerId(e.target.value)}>
              <option value="">Select a customer…</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.full_name} ({c.email})
                </option>
              ))}
            </select>
          </Field>

          <div className="field-label" style={{ marginBottom: 6 }}>Products</div>
          {lines.map((line, i) => {
            const p = productById[String(line.product_id)];
            return (
              <div className="order-line" key={i}>
                <select
                  value={line.product_id}
                  onChange={(e) => updateLine(i, "product_id", e.target.value)}
                >
                  <option value="">Select product…</option>
                  {products.map((prod) => (
                    <option key={prod.id} value={prod.id}>
                      {prod.name} — {money(prod.price)} ({prod.quantity_in_stock} in stock)
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  min="1"
                  max={p ? p.quantity_in_stock : undefined}
                  value={line.quantity}
                  onChange={(e) => updateLine(i, "quantity", e.target.value)}
                  className="qty-input"
                />
                <button
                  type="button"
                  className="icon-btn"
                  onClick={() => removeLine(i)}
                  disabled={lines.length === 1}
                  aria-label="Remove line"
                >
                  &times;
                </button>
              </div>
            );
          })}
          <button type="button" className="btn btn-ghost btn-sm" onClick={addLine}>
            + Add another product
          </button>

          <div className="order-total">
            Estimated total: <strong>{money(estimatedTotal)}</strong>
          </div>

          {formError && <div className="field-error">{formError}</div>}

          <div className="form-actions">
            <button type="button" className="btn btn-ghost" onClick={() => setModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? "Placing…" : "Place Order"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Order detail modal */}
      <Modal title={detail ? `Order #${detail.id}` : ""} open={Boolean(detail)} onClose={() => setDetail(null)}>
        {detail && (
          <div>
            <p className="muted">
              Customer ID: {detail.customer_id} · Status: {detail.status}
            </p>
            <table className="table">
              <thead>
                <tr>
                  <th>Product ID</th>
                  <th className="num">Qty</th>
                  <th className="num">Unit Price</th>
                  <th className="num">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {detail.items.map((it) => (
                  <tr key={it.id}>
                    <td>{it.product_id}</td>
                    <td className="num">{it.quantity}</td>
                    <td className="num">{money(it.unit_price)}</td>
                    <td className="num">{money(it.subtotal)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={3} className="num"><strong>Total</strong></td>
                  <td className="num"><strong>{money(detail.total_amount)}</strong></td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </Modal>

      <ConfirmDialog
        open={Boolean(toDelete)}
        title="Cancel order?"
        message={toDelete ? `Order #${toDelete.id} will be cancelled and its stock returned.` : ""}
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(null)}
        busy={deleting}
      />
    </section>
  );
}
