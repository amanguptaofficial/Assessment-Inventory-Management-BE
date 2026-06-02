import { useCallback } from "react";
import { Package, Users, Receipt, TriangleAlert } from "lucide-react";
import { dashboardApi } from "../api/resources";
import useFetch from "../hooks/useFetch";
import { Loading, ErrorState, EmptyState } from "../components/StateViews";
import Badge from "../components/ui/Badge";
import { cardClass, thClass, tdClass } from "../components/ui/styles";

const cards = [
  { key: "total_products", label: "Total Products", icon: Package, tone: "text-blue-600 bg-blue-50" },
  { key: "total_customers", label: "Total Customers", icon: Users, tone: "text-violet-600 bg-violet-50" },
  { key: "total_orders", label: "Total Orders", icon: Receipt, tone: "text-emerald-600 bg-emerald-50" },
  { key: "low_stock_count", label: "Low Stock Items", icon: TriangleAlert, tone: "text-amber-600 bg-amber-100" },
];

export default function Dashboard() {
  const fetcher = useCallback(() => dashboardApi.summary(), []);
  const { data, loading, error, refetch } = useFetch(fetcher);

  if (loading) return <Loading label="Loading dashboard…" />;
  if (error) return <ErrorState message={error} onRetry={refetch} />;

  return (
    <section>
      <div className="mb-5">
        <h1 className="text-2xl font-bold">Dashboard</h1>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => {
          const warn = c.key === "low_stock_count" && data[c.key] > 0;
          const Icon = c.icon;
          return (
            <div
              key={c.key}
              className={`flex items-center gap-3.5 rounded-xl border p-[18px] shadow-sm ${
                warn ? "border-amber-200 bg-amber-50" : "border-slate-200 bg-white"
              }`}
            >
              <span className={`flex size-11 shrink-0 items-center justify-center rounded-lg ${c.tone}`}>
                <Icon className="size-5" />
              </span>
              <div>
                <div className="text-[26px] font-bold leading-tight">{data[c.key]}</div>
                <div className="text-[13px] text-slate-500">{c.label}</div>
              </div>
            </div>
          );
        })}
      </div>

      <div className={`${cardClass} p-5`}>
        <h2 className="mb-3 text-[17px] font-semibold">Low Stock Products</h2>
        {data.low_stock_products.length === 0 ? (
          <EmptyState message="All products are well stocked." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr>
                  <th className={thClass}>Name</th>
                  <th className={thClass}>SKU</th>
                  <th className={`${thClass} text-right`}>Price</th>
                  <th className={`${thClass} text-right`}>In Stock</th>
                </tr>
              </thead>
              <tbody>
                {data.low_stock_products.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50">
                    <td className={tdClass}>{p.name}</td>
                    <td className={tdClass}>
                      <code className="rounded bg-slate-100 px-1.5 py-0.5 text-[13px]">{p.sku}</code>
                    </td>
                    <td className={`${tdClass} text-right`}>${Number(p.price).toFixed(2)}</td>
                    <td className={`${tdClass} text-right`}>
                      <Badge tone="warn">{p.quantity_in_stock}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}
