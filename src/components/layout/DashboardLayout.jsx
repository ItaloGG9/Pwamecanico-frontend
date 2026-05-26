import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../stores/auth.js";
import { LayoutDashboard, Package, CalendarDays, Users, ClipboardList, FileText, BarChart3, LogOut, Wrench } from "lucide-react";
import { cn } from "../../lib/utils.js";

const nav = [
  { to: "/dashboard", label: "Inicio", icon: LayoutDashboard, end: true },
  { to: "/dashboard/ordenes", label: "Órdenes de trabajo", icon: ClipboardList },
  { to: "/dashboard/agenda", label: "Agenda", icon: CalendarDays },
  { to: "/dashboard/clientes", label: "Clientes", icon: Users },
  { to: "/dashboard/inventario", label: "Inventario", icon: Package },
  { to: "/dashboard/cotizaciones", label: "Cotizaciones", icon: FileText },
  { to: "/dashboard/reportes", label: "Reportes", icon: BarChart3 },
];

export default function DashboardLayout() {
  const navigate = useNavigate();
  const { usuario, logout } = useAuthStore();
  const handleLogout = () => { logout(); navigate("/login"); };

  return (
    <div className="flex min-h-screen">
      <aside className="fixed inset-y-0 left-0 w-60 bg-surface-900 flex flex-col z-40">
        <div className="h-16 flex items-center gap-2.5 px-5 border-b border-white/5 flex-shrink-0">
          <div className="w-7 h-7 rounded-lg bg-brand-600 flex items-center justify-center">
            <Wrench size={14} className="text-white" />
          </div>
          <span className="font-semibold text-white text-sm">PWAmecanico</span>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {nav.map(({ to, label, icon: Icon, end }) => (
            <NavLink key={to} to={to} end={end}
              className={({ isActive }) => cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
                isActive ? "bg-brand-600 text-white" : "text-surface-400 hover:text-white hover:bg-white/5"
              )}>
              <Icon size={16} className="flex-shrink-0" />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="p-3 border-t border-white/5 flex-shrink-0">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-7 h-7 rounded-full bg-brand-600 flex items-center justify-center flex-shrink-0">
              <span className="text-white text-xs font-semibold">{usuario?.nombre?.charAt(0).toUpperCase()}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-white truncate">{usuario?.nombre}</p>
              <p className="text-xs text-surface-500 capitalize">{usuario?.rol}</p>
            </div>
            <button onClick={handleLogout} className="text-surface-500 hover:text-white transition-colors">
              <LogOut size={15} />
            </button>
          </div>
        </div>
      </aside>
      <main className="flex-1 ml-60 min-h-screen">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
