import { useQuery } from "@tanstack/react-query";
import { ordenesApi, productosApi, clientesApi } from "../../lib/api.js";
import { STALE } from "../../lib/queryClient.js";
import { formatCLP, ESTADO_OT_LABELS } from "../../lib/utils.js";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function ReportesPage() {
  const { data: ordenes = [] } = useQuery({ queryKey: ["ordenes"], queryFn: () => ordenesApi.listar().then(r => r.data), staleTime: STALE.ordenes });
  const { data: productos = [] } = useQuery({ queryKey: ["productos"], queryFn: () => productosApi.listar().then(r => r.data), staleTime: STALE.productos });
  const { data: clientes = [] } = useQuery({ queryKey: ["clientes"], queryFn: () => clientesApi.listar().then(r => r.data), staleTime: STALE.clientes });

  const entregadas = ordenes.filter(o => o.estado === "entregado");
  const totalIngresos = entregadas.reduce((s, o) => s + Number(o.total_final), 0);
  const ticketPromedio = entregadas.length > 0 ? totalIngresos / entregadas.length : 0;

  const porEstado = ["recibido", "diagnostico", "en_reparacion", "espera_repuesto", "listo", "entregado"].map(e => ({
    estado: ESTADO_OT_LABELS[e],
    cantidad: ordenes.filter(o => o.estado === e).length,
  }));

  const topProductos = [...productos].sort((a, b) => b.precio_venta - a.precio_venta).slice(0, 5);
  const COLORS = ["#1660e9", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

  return (
    <div>
      <h1 className="text-xl font-semibold text-surface-900 mb-6">Reportes</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total ingresos", value: formatCLP(totalIngresos) },
          { label: "Ticket promedio", value: formatCLP(ticketPromedio) },
          { label: "Total clientes", value: clientes.length },
          { label: "Total productos", value: productos.length },
        ].map(k => (
          <div key={k.label} className="card p-4">
            <p className="text-xs text-surface-400 mb-1">{k.label}</p>
            <p className="text-xl font-semibold text-surface-900">{k.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="card p-5">
          <h2 className="text-sm font-semibold mb-4">OT por estado</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={porEstado} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f3f7" />
              <XAxis dataKey="estado" tick={{ fontSize: 10, fill: "#6b7591" }} />
              <YAxis tick={{ fontSize: 11, fill: "#6b7591" }} allowDecimals={false} />
              <Tooltip contentStyle={{ borderRadius: 12, fontSize: 12, border: "1px solid #e4e8f0" }} />
              <Bar dataKey="cantidad" fill="#1660e9" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card p-5">
          <h2 className="text-sm font-semibold mb-4">Top productos por precio</h2>
          <div className="space-y-3">
            {topProductos.length === 0 ? (
              <p className="text-sm text-surface-400 text-center py-4">Sin datos</p>
            ) : topProductos.map((p, i) => (
              <div key={p.id} className="flex items-center gap-3">
                <span className="text-xs font-mono text-surface-400 w-4">{i + 1}</span>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-surface-700 truncate">{p.nombre}</span>
                    <span className="text-xs text-surface-500 ml-2">{formatCLP(p.precio_venta)}</span>
                  </div>
                  <div className="h-1.5 bg-surface-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all" style={{
                      width: `${(p.precio_venta / topProductos[0]?.precio_venta) * 100}%`,
                      background: COLORS[i]
                    }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
