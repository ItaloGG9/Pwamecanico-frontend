import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { cotizacionesApi } from "../../lib/api.js";
import { STALE } from "../../lib/queryClient.js";
import { formatCLP, formatFecha, cn } from "../../lib/utils.js";
import { FileText, CheckCircle, XCircle } from "lucide-react";
import toast from "react-hot-toast";

const COLORES = {
  borrador: "bg-surface-100 text-surface-600",
  enviada: "bg-blue-50 text-blue-700",
  aprobada: "bg-green-50 text-green-700",
  rechazada: "bg-red-50 text-red-600",
};

export default function CotizacionesPage() {
  const qc = useQueryClient();

  const { data: cotizaciones = [], isLoading } = useQuery({
    queryKey: ["cotizaciones"],
    queryFn: () => cotizacionesApi.listar().then(r => r.data),
    staleTime: STALE.cotizaciones,
  });

  const aprobar = useMutation({
    mutationFn: (id) => cotizacionesApi.aprobar(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["cotizaciones"] });
      qc.invalidateQueries({ queryKey: ["ordenes"] });
      toast.success("Cotización aprobada y convertida a OT");
    },
    onError: () => toast.error("Error al aprobar"),
  });

  const cambiarEstado = useMutation({
    mutationFn: ({ id, estado }) => cotizacionesApi.cambiarEstado(id, estado),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["cotizaciones"] }); toast.success("Estado actualizado"); },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-surface-900">Cotizaciones</h1>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-surface-100">
              <th className="text-left px-4 py-3 text-xs font-medium text-surface-500">N°</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-surface-500">Fecha</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-surface-500">Estado</th>
              <th className="text-right px-4 py-3 text-xs font-medium text-surface-500">Total</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-50">
            {isLoading ? (
              <tr><td colSpan={5} className="text-center py-8 text-sm text-surface-400">Cargando...</td></tr>
            ) : cotizaciones.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-12">
                  <FileText size={32} className="text-surface-200 mx-auto mb-2" />
                  <p className="text-sm text-surface-400">Sin cotizaciones</p>
                </td>
              </tr>
            ) : cotizaciones.map(c => (
              <tr key={c.id} className="hover:bg-surface-50 transition-colors">
                <td className="px-4 py-3 font-mono text-sm font-medium">{c.numero}</td>
                <td className="px-4 py-3 text-sm text-surface-500">{formatFecha(c.created_at)}</td>
                <td className="px-4 py-3"><span className={cn("badge", COLORES[c.estado])}>{c.estado}</span></td>
                <td className="px-4 py-3 text-right text-sm font-semibold">{formatCLP(c.total_final)}</td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    {c.estado === "enviada" && (
                      <>
                        <button onClick={() => aprobar.mutate(c.id)} className="text-green-600 hover:text-green-700" title="Aprobar"><CheckCircle size={16} /></button>
                        <button onClick={() => cambiarEstado.mutate({ id: c.id, estado: "rechazada" })} className="text-red-500 hover:text-red-600" title="Rechazar"><XCircle size={16} /></button>
                      </>
                    )}
                    {c.estado === "borrador" && (
                      <button onClick={() => cambiarEstado.mutate({ id: c.id, estado: "enviada" })} className="text-xs text-brand-600 hover:text-brand-700 font-medium">Enviar</button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
