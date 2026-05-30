import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ordenesApi } from "../../lib/api.js";
import { STALE } from "../../lib/queryClient.js";
import { formatCLP, ESTADO_OT_LABELS, ESTADO_OT_COLORS, cn } from "../../lib/utils.js";
import { Search, ClipboardList, ChevronDown } from "lucide-react";
import toast from "react-hot-toast";

const ESTADOS = ["recibido", "diagnostico", "en_reparacion", "espera_repuesto", "listo", "entregado"];

export default function OrdenesPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [filtro, setFiltro] = useState("");
  const [expandedId, setExpandedId] = useState(null);

  const { data: ordenes = [], isLoading } = useQuery({
    queryKey: ["ordenes"],
    queryFn: () => ordenesApi.listar().then(r => r.data),
    staleTime: STALE.ordenes,
  });

  const cambiarEstado = useMutation({
    mutationFn: ({ id, estado }) => ordenesApi.cambiarEstado(id, { estado }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["ordenes"] }); toast.success("Estado actualizado"); },
    onError: () => toast.error("Error al actualizar"),
  });

  const filtered = ordenes.filter(o => {
    const matchSearch = o.numero_ot.toLowerCase().includes(search.toLowerCase());
    const matchFiltro = filtro ? o.estado === filtro : true;
    return matchSearch && matchFiltro;
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-surface-900">Órdenes de trabajo</h1>
      </div>

      <div className="flex gap-3 mb-4 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar por número OT..." className="input pl-9" />
        </div>
        <select value={filtro} onChange={e => setFiltro(e.target.value)} className="input w-auto">
          <option value="">Todos los estados</option>
          {ESTADOS.map(e => <option key={e} value={e}>{ESTADO_OT_LABELS[e]}</option>)}
        </select>
      </div>

      <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
        {ESTADOS.map(e => {
          const count = ordenes.filter(o => o.estado === e).length;
          return (
            <button key={e} onClick={() => setFiltro(filtro === e ? "" : e)}
              className={cn("flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-medium transition-all border",
                filtro === e ? "border-brand-600 bg-brand-600 text-white" : "border-surface-200 bg-white text-surface-600 hover:border-brand-300"
              )}>
              {ESTADO_OT_LABELS[e]} · {count}
            </button>
          );
        })}
      </div>

      <div className="card overflow-hidden">
        {isLoading ? (
          <p className="text-center py-8 text-sm text-surface-400">Cargando...</p>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12">
            <ClipboardList size={32} className="text-surface-200 mx-auto mb-2" />
            <p className="text-sm text-surface-400">Sin órdenes de trabajo</p>
          </div>
        ) : (
          <div className="divide-y divide-surface-50">
            {filtered.map(ot => (
              <div key={ot.id}>
                <div className="flex items-center gap-4 px-4 py-3.5 hover:bg-surface-50 cursor-pointer transition-colors"
                  onClick={() => setExpandedId(expandedId === ot.id ? null : ot.id)}>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold font-mono">{ot.numero_ot}</span>
                      <span className={cn("badge", ESTADO_OT_COLORS[ot.estado])}>{ESTADO_OT_LABELS[ot.estado]}</span>
                    </div>
                    <p className="text-xs text-surface-400 mt-0.5">{new Date(ot.fecha_ingreso).toLocaleDateString("es-CL")}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-semibold">{formatCLP(ot.total_final)}</p>
                    <p className="text-xs text-surface-400">{ot.items?.length || 0} ítems</p>
                  </div>
                  <ChevronDown size={15} className={cn("text-surface-400 transition-transform flex-shrink-0", expandedId === ot.id && "rotate-180")} />
                </div>

                {expandedId === ot.id && (
                  <div className="px-4 pb-4 bg-surface-50 border-t border-surface-100">
                    <div className="grid grid-cols-2 gap-4 pt-3 mb-3">
                      <div>
                        <p className="text-xs text-surface-400 mb-1">Diagnóstico</p>
                        <p className="text-sm text-surface-700">{ot.diagnostico || "—"}</p>
                      </div>
                      <div>
                        <p className="text-xs text-surface-400 mb-1">Trabajo realizado</p>
                        <p className="text-sm text-surface-700">{ot.trabajo_realizado || "—"}</p>
                      </div>
                    </div>
                    {ot.items?.length > 0 && (
                      <div className="bg-white rounded-xl border border-surface-100 overflow-hidden mb-3">
                        <table className="w-full text-xs">
                          <thead><tr className="border-b border-surface-100 bg-surface-50">
                            <th className="text-left px-3 py-2 text-surface-500">Descripción</th>
                            <th className="text-right px-3 py-2 text-surface-500">Cant.</th>
                            <th className="text-right px-3 py-2 text-surface-500">P.Unit.</th>
                            <th className="text-right px-3 py-2 text-surface-500">Subtotal</th>
                          </tr></thead>
                          <tbody className="divide-y divide-surface-50">
                            {ot.items.map(item => (
                              <tr key={item.id}>
                                <td className="px-3 py-2 text-surface-700">{item.descripcion}</td>
                                <td className="px-3 py-2 text-right">{item.cantidad}</td>
                                <td className="px-3 py-2 text-right">{formatCLP(item.precio_unitario)}</td>
                                <td className="px-3 py-2 text-right font-medium">{formatCLP(item.subtotal)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                        <div className="px-3 py-2 border-t border-surface-100 text-right">
                          <p className="text-xs text-surface-500">Neto: {formatCLP(ot.total_neto)} · IVA: {formatCLP(ot.total_iva)}</p>
                          <p className="text-sm font-semibold">Total: {formatCLP(ot.total_final)}</p>
                        </div>
                      </div>
                    )}
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs text-surface-400">Cambiar estado:</span>
                      {ESTADOS.filter(e => e !== ot.estado).map(e => (
                        <button key={e} onClick={() => cambiarEstado.mutate({ id: ot.id, estado: e })}
                          className="text-xs px-2.5 py-1 rounded-lg border border-surface-200 hover:border-brand-400 hover:text-brand-600 transition-colors">
                          {ESTADO_OT_LABELS[e]}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
