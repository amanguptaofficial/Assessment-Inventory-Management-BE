import { useCallback, useMemo, useState } from "react";
import { Plus, X, Eye, Trash2 } from "lucide-react";
import { customersApi, ordersApi, productsApi } from "../api/resources";
import { extractErrorMessage } from "../api/client";
import useFetch from "../hooks/useFetch";
import { useToast } from "../context/ToastContext";
import { Loading, ErrorState, EmptyState } from "../components/StateViews";
import Modal from "../components/Modal";
import ConfirmDialog from "../components/ConfirmDialog";
import Field from "../components/Field";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";
import { cardClass, inputClass, thClass, tdClass } from "../components/ui/styles";

const money = (v) => `$${Number(v).toFixed(2)}`;

export default function Orders() {
  const fetchOrders = useCallback(() => ordersApi.list(), []);
  const { data: orders, loading, error, refetch } = useFetch(fetchOrders);
  const notify = useToast();

  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);

  const [modalOpen, setModalOpen] = useState(false);
  const [customerId, setCustomerId] = useState("");
  const [lines, setLines] = useState([{ product_id: "", quantity: 1 }]);
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [toDelete, setToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const openDetail = async (id) => {
    setDetail(null);
    setDetailLoading(true);
    try {
      const data = await ordersApi.get(id);
      setDetail(data);
    } catch (err) {
      notify.error(extractErrorMessage(err));
    } finally {
      setDetailLoading(false);
    }
  };

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
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Orders</h1>
        <Button onClick={openCreate} className="max-sm:w-full">
          <Plus className="size-4" /> Create Order
        </Button>
      </div>

      {loading ? (
        <Loading label="Loading orders…" />
      ) : error ? (
        <ErrorState message={error} onRetry={refetch} />
      ) : orders.length === 0 ? (
        <EmptyState message="No orders yet. Create your first order." />
      ) : (
        <div className={`${cardClass} overflow-x-auto`}>
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr>
                <th className={thClass}>Order #</th>
                <th className={thClass}>Customer ID</th>
                <th className={`${thClass} text-right`}>Items</th>
                <th className={`${thClass} text-right`}>Total</th>
                <th className={thClass}>Status</th>
                <th className={`${thClass} text-right`}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id} className="hover:bg-slate-50">
                  <td className={tdClass}>#{o.id}</td>
                  <td className={tdClass}>{o.customer_id}</td>
                  <td className={`${tdClass} text-right`}>{o.items.length}</td>
                  <td className={`${tdClass} text-right`}>{money(o.total_amount)}</td>
                  <td className={tdClass}>
                    <Badge tone="ok">{o.status}</Badge>
                  </td>
                  <td className={`${tdClass} whitespace-nowrap text-right`}>
                    <div className="inline-flex gap-2">
                      <Button variant="ghost" size="sm" onClick={() => openDetail(o.id)}>
                        <Eye className="size-3.5" /> View
                      </Button>
                      <Button variant="danger" size="sm" onClick={() => setToDelete(o)}>
                        <Trash2 className="size-3.5" /> Cancel
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal title="Create Order" open={modalOpen} onClose={() => setModalOpen(false)}>
        <form onSubmit={onSubmit} noValidate>
          <Field label="Customer">
            <select className={inputClass} value={customerId} onChange={(e) => setCustomerId(e.target.value)}>
              <option value="">Select a customer…</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.full_name} ({c.email})
                </option>
              ))}
            </select>
          </Field>

          <div className="mb-1.5 text-[13px] font-semibold">Products</div>
          {lines.map((line, i) => {
            const p = productById[String(line.product_id)];
            return (
              <div className="mb-2 grid grid-cols-[1fr_70px_30px] items-center gap-2 sm:grid-cols-[1fr_90px_34px]" key={i}>
                <select
                  className={inputClass}
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
                  className={`${inputClass} text-right`}
                  type="number"
                  min="1"
                  max={p ? p.quantity_in_stock : undefined}
                  value={line.quantity}
                  onChange={(e) => updateLine(i, "quantity", e.target.value)}
                />
                <button
                  type="button"
                  className="flex items-center justify-center rounded-md p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-30"
                  onClick={() => removeLine(i)}
                  disabled={lines.length === 1}
                  aria-label="Remove line"
                >
                  <X className="size-4" />
                </button>
              </div>
            );
          })}
          <Button variant="ghost" size="sm" onClick={addLine}>
            <Plus className="size-3.5" /> Add another product
          </Button>

          <div className="mt-3.5 border-t border-dashed border-slate-200 pt-3 text-right text-[15px]">
            Estimated total: <strong>{money(estimatedTotal)}</strong>
          </div>

          {formError && <div className="mt-1 text-xs text-red-600">{formError}</div>}

          <div className="mt-5 flex justify-end gap-2.5">
            <Button variant="ghost" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Placing…" : "Place Order"}
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        title={detail ? `Order #${detail.id}` : "Order Details"}
        open={detailLoading || Boolean(detail)}
        onClose={() => setDetail(null)}
      >
        {detailLoading ? (
          <Loading label="Loading order…" />
        ) : (
          detail && (
          <div>
            <p className="mb-3 text-slate-500">
              Customer ID: {detail.customer_id} · Status: {detail.status}
            </p>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr>
                    <th className={thClass}>Product ID</th>
                    <th className={`${thClass} text-right`}>Qty</th>
                    <th className={`${thClass} text-right`}>Unit Price</th>
                    <th className={`${thClass} text-right`}>Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {detail.items.map((it) => (
                    <tr key={it.id}>
                      <td className={tdClass}>{it.product_id}</td>
                      <td className={`${tdClass} text-right`}>{it.quantity}</td>
                      <td className={`${tdClass} text-right`}>{money(it.unit_price)}</td>
                      <td className={`${tdClass} text-right`}>{money(it.subtotal)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td className="px-3 py-2.5 text-right font-bold" colSpan={3}>
                      Total
                    </td>
                    <td className="px-3 py-2.5 text-right font-bold">{money(detail.total_amount)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
          )
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
