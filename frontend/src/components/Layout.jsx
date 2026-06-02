import { NavLink, Outlet } from "react-router-dom";

const navItems = [
  { to: "/", label: "Dashboard", end: true },
  { to: "/products", label: "Products" },
  { to: "/customers", label: "Customers" },
  { to: "/orders", label: "Orders" },
];

/** App shell: responsive sidebar/topbar navigation + routed content area. */
export default function Layout() {
  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand">📦 Inventory&nbsp;&amp;&nbsp;Orders</div>
        <nav className="nav">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => `nav-link${isActive ? " active" : ""}`}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </header>
      <main className="content">
        <Outlet />
      </main>
    </div>
  );
}
