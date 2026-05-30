import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { ordenesApi, productosApi, citasApi, clientesApi } from "../../lib/api.js";
import { STALE } from "../../lib/queryClient.js";
import { useAuthStore } from "../../stores/auth.js";
import { formatCLP, ESTADO_OT_LABELS, ESTADO_OT_COLORS, cn } from "../../lib/utils.js";
import { ClipboardList, Package, Users, AlertTriangle, CalendarDays, ChevronRight } from "lucide-react";

export default function DashboardPage() {
  const usuario = useAuthStore((s) => s.usuario);
  const { data: ordenes = [] } = useQuery({ queryKey: ["ordenes"], queryFn: () => ordenesApi.listar().then(r => r.data), staleTime: STALE.ordenes });
  const { data: productos = [] } = useQuery({ queryKey: ["productos"], queryFn: () => productosApi.listar().then(r => r.data), staleTime: STALE.productos });
  const { data: clientes = [] } = useQuery({ queryKey: ["clientes"], queryFn: () => clientesApi.listar().then(r => r.data), staleTime: STALE.clientes });
  const { data: bajoStock = [] } = useQuery({ queryKey: ["bajo-stock"], queryFn: () => productosApi.bajoStock().then(r => r.data), staleTime: STALE.bajoStock });
  const { data: citas = [] } = useQuery({ queryKey: ["citas"], queryFn: () => citasApi.listar().then(r => r.data), staleTime: STALE.citas });

  const ordenesActivas = ordenes.filter(o => o.estado !== "entregado");
  const totalIngresos = ordenes.filter(o => o.estado === "entregado").reduce((s, o) => s + Number(o.total_final), 0);
  const hora = new Date().getHours();
  const saludo = hora < 12 ? "Buenos días" : hora < 19 ? "Buenas tardes" : "Buenas noches";

  const stats = [
    { label: "OT activas", value: ordenesActivas.length, icon: ClipboardList, color: "text-brand-600 bg-brand-50", href: "/dashboard/ordenes" },
    { label: "Clientes", value: clientes.length, icon: Users, color: "text-emerald-600 bg-emerald-50", href: "/dashboard/clientes" },
    { label: "Productos", value: productos.length, icon: Package, color: "text-violet-600 bg-violet-50", href: "/dashboard/inventario" },
    { label: "Bajo stock", value: bajoStock.length, icon: AlertTriangle, color: "text-amber-600 bg-amber-50", href: "/dashboard/inventario" },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-surface-900">{saludo}, {usuario?.nombre?.split(" ")[0]} 👋</h1>
        <p className="text-sm text-surface-500 mt-0.5">Resumen del taller</p>
      </div>

      <div className="card p-5 mb-5 bg-gradient-to-r from-brand-600 to-brand-700 border-0">
        <p className="text-brand-100 text-xs font-medium uppercase tracking-wider mb-1">Ingresos del mes</p>
        <p className="text-white text-3xl font-semibold">{formatCLP(totalIngresos)}</p>
        <p className="text-brand-200 text-xs mt-1">{ordenes.filter(o => o.estado === "entregado").length} OT entregadas</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((s) => (
          <Link key={s.label} to={s.href} className="card p-4 hover:shadow-lg transition-shadow">
            <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center mb-3", s.color)}>
              <s.icon size={18} />
            </div>
            <p className="text-2xl font-semibold text-surface-900">{s.value}</p>
            <p className="text-xs text-surface-500 mt-0.5">{s.label}</p>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="card">
          <div className="flex items-center justify-between p-4 border-b border-surface-100">
            <h2 className="text-sm font-semibold">Órdenes activas</h2>
            <Link to="/dashboard/ordenes" className="text-xs text-brand-600 flex items-center gap-0.5">Ver todas <ChevronRight size={13} /></Link>
          </div>
          <div className="divide-y divide-surface-50">
            {ordenesActivas.slice(0, 5).map(ot => (
              <div key={ot.id} className="flex items-center justify-between px-4 py-3">
                <div>
                  <p className="text-sm font-medium font-mono">{ot.numero_ot}</p>
                  <p className="text-xs text-surface-400">{new Date(ot.fecha_ingreso).toLocaleDateString("es-CL")}</p>
                </div>
                <span className={cn("badge", ESTADO_OT_COLORS[ot.estado])}>{ESTADO_OT_LABELS[ot.estado]}</span>
              </div>
            ))}
            {ordenesActivas.length === 0 && <p className="text-sm text-surface-400 px-4 py-6 text-center">Sin órdenes activas</p>}
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between p-4 border-b border-surface-100">
            <h2 className="text-sm font-semibold">Próximas citas</h2>
            <Link to="/dashboard/agenda" className="text-xs text-brand-600 flex items-center gap-0.5">Ver agenda <ChevronRight size={13} /></Link>
          </div>
          <div className="divide-y divide-surface-50">
            {citas.slice(0, 5).map(c => (
              <div key={c.id} className="flex items-center gap-3 px-4 py-3">
                <div className="w-9 h-9 rounded-xl bg-brand-50 flex items-center justify-center flex-shrink-0">
                  <CalendarDays size={15} className="text-brand-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{c.descripcion || "Sin descripción"}</p>
                  <p className="text-xs text-surface-400">{new Date(c.fecha_hora).toLocaleDateString("es-CL", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}</p>
                </div>
              </div>
            ))}
            {citas.length === 0 && <p className="text-sm text-surface-400 px-4 py-6 text-center">Sin citas próximas</p>}
          </div>
        </div>

        {bajoStock.length > 0 && (
          <div className="card lg:col-span-2">
            <div className="flex items-center gap-2 p-4 border-b border-surface-100">
              <AlertTriangle size={15} className="text-amber-500" />
              <h2 className="text-sm font-semibold">Productos con bajo stock</h2>
            </div>
            <div className="divide-y divide-surface-50">
              {bajoStock.map(p => (
                <div key={p.id} className="flex items-center justify-between px-4 py-3">
                  <div>
                    <p className="text-sm font-medium">{p.nombre}</p>
                    <p className="text-xs text-surface-400">SKU: {p.sku || "—"}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-amber-600">{p.stock_actual} ud.</p>
                    <p className="text-xs text-surface-400">Mín: {p.stock_minimo}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
