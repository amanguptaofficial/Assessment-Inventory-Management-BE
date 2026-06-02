import { useCallback } from "react";
import { dashboardApi } from "../api/resources";
import useFetch from "../hooks/useFetch";
import { Loading, ErrorState, EmptyState } from "../components/StateViews";

const cards = [
  { key: "total_products", label: "Total Products", icon: "📦" },
  { key: "total_customers", label: "Total Customers", icon: "👥" },
  { key: "total_orders", label: "Total Orders", icon: "🧾" },
  { key: "low_stock_count", label: "Low Stock Items", icon: "⚠️" },
];

export default function Dashboard() {
  const fetcher = useCallback(() => dashboardApi.summary(), []);
  const { data, loading, error, refetch } = useFetch(fetcher);

  if (loading) return <Loading label="Loading dashboard…" />;
  if (error) return <ErrorState message={error} onRetry={refetch} />;

  return (
    <section>
      <div className="page-header">
        <h1>Dashboard</h1>
      </div>

      <div className="stat-grid">
        {cards.map((c) => (
          <div key={c.key} className={`stat-card${c.key === "low_stock_count" && data[c.key] > 0 ? " warn" : ""}`}>
            <span className="stat-icon">{c.icon}</span>
            <div>
              <div className="stat-value">{data[c.key]}</div>
              <div className="stat-label">{c.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="card">
        <h2>Low Stock Products</h2>
        {data.low_stock_products.length === 0 ? (
          <EmptyState message="All products are well stocked. 🎉" />
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>SKU</th>
                <th className="num">Price</th>
                <th className="num">In Stock</th>
              </tr>
            </thead>
            <tbody>
              {data.low_stock_products.map((p) => (
                <tr key={p.id}>
                  <td>{p.name}</td>
                  <td><code>{p.sku}</code></td>
                  <td className="num">${Number(p.price).toFixed(2)}</td>
                  <td className="num">
                    <span className="badge badge-warn">{p.quantity_in_stock}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
}
