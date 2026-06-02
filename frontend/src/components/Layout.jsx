import { NavLink, Outlet } from "react-router-dom";
import { Package } from "lucide-react";

const navItems = [
  { to: "/", label: "Dashboard", end: true },
  { to: "/products", label: "Products" },
  { to: "/customers", label: "Customers" },
  { to: "/orders", label: "Orders" },
];

const linkBase = "whitespace-nowrap rounded-lg px-3.5 py-2 font-medium transition";

export default function Layout() {
  return (
    <div className="flex min-h-full flex-col overflow-x-clip">
      <header className="sticky top-0 z-10 flex flex-wrap items-center justify-between gap-x-6 gap-y-3 border-b border-slate-200 bg-white px-4 py-2.5 shadow-sm md:px-6">
        <div className="flex shrink-0 items-center gap-2 whitespace-nowrap text-lg font-bold">
          <Package className="size-5 text-blue-600" />
          Inventory &amp; Orders
        </div>
        <nav className="flex w-full min-w-0 gap-1.5 overflow-x-auto md:w-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `${linkBase} ${
                  isActive
                    ? "bg-blue-50 text-blue-600"
                    : "text-slate-500 hover:bg-slate-100 hover:text-slate-800"
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </header>
      <main className="mx-auto w-full max-w-5xl px-4 py-7 md:px-7">
        <Outlet />
      </main>
    </div>
  );
}
