import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { citasApi, clientesApi } from "../../lib/api.js";
import { STALE } from "../../lib/queryClient.js";
import { cn } from "../../lib/utils.js";
import { CalendarDays, Plus, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

export default function AgendaPage() {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const empty = { cliente_id: "", fecha_hora: "", duracion_min: 60, descripcion: "" };
  const [form, setForm] = useState(empty);

  const { data: citas = [], isLoading } = useQuery({
    queryKey: ["citas"],
    queryFn: () => citasApi.listar().then(r => r.data),
    staleTime: STALE.citas,
  });

  const { data: clientes = [] } = useQuery({
    queryKey: ["clientes"],
    queryFn: () => clientesApi.listar().then(r => r.data),
    staleTime: STALE.clientes,
  });

  const crear = useMutation({
    mutationFn: (data) => citasApi.crear(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["citas"] }); toast.success("Cita creada"); setShowForm(false); setForm(empty); },
    onError: () => toast.error("Error al crear cita"),
  });

  const cancelar = useMutation({
    mutationFn: (id) => citasApi.cancelar(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["citas"] }); toast.success("Cita cancelada"); },
  });

  const hoy = new Date().toISOString().split("T")[0];
  const citasHoy = citas.filter(c => c.fecha_hora?.startsWith(hoy));
  const proximas = citas.filter(c => c.fecha_hora > hoy + "T23:59");

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-surface-900">Agenda</h1>
        <button onClick={() => setShowForm(true)} className="btn-primary flex items-center gap-2">
          <Plus size={15} /> Nueva cita
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="card">
          <div className="p-4 border-b border-surface-100">
            <h2 className="text-sm font-semibold">Citas de hoy</h2>
          </div>
          <div className="divide-y divide-surface-50">
            {isLoading ? <p className="text-sm text-surface-400 p-4">Cargando...</p> :
              citasHoy.length === 0 ? <p className="text-sm text-surface-400 p-6 text-center">Sin citas para hoy</p> :
              citasHoy.map(c => (
                <div key={c.id} className="flex items-center gap-3 px-4 py-3">
                  <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center flex-shrink-0">
                    <CalendarDays size={16} className="text-brand-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{c.descripcion || "Sin descripción"}</p>
                    <p className="text-xs text-surface-400 mt-0.5">
                      {new Date(c.fecha_hora).toLocaleTimeString("es-CL", { hour: "2-digit", minute: "2-digit" })} · {c.duracion_min} min
                    </p>
                  </div>
                  <span className={cn("badge", c.estado === "confirmada" ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-700")}>
                    {c.estado}
                  </span>
                </div>
              ))}
          </div>
        </div>

        <div className="card">
          <div className="p-4 border-b border-surface-100">
            <h2 className="text-sm font-semibold">Próximas citas</h2>
          </div>
          <div className="divide-y divide-surface-50">
            {proximas.length === 0 ? <p className="text-sm text-surface-400 p-6 text-center">Sin próximas citas</p> :
              proximas.slice(0, 8).map(c => (
                <div key={c.id} className="flex items-center gap-3 px-4 py-3">
                  <div className="text-center w-10 flex-shrink-0">
                    <p className="text-xs font-bold text-brand-600">{new Date(c.fecha_hora).toLocaleDateString("es-CL", { day: "2-digit" })}</p>
                    <p className="text-xs text-surface-400">{new Date(c.fecha_hora).toLocaleDateString("es-CL", { month: "short" })}</p>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{c.descripcion || "Sin descripción"}</p>
                    <p className="text-xs text-surface-400">{new Date(c.fecha_hora).toLocaleTimeString("es-CL", { hour: "2-digit", minute: "2-digit" })}</p>
                  </div>
                  <button onClick={() => cancelar.mutate(c.id)} className="text-xs text-red-500 hover:text-red-600">Cancelar</button>
                </div>
              ))}
          </div>
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-float w-full max-w-md">
            <div className="p-5 border-b border-surface-100">
              <h3 className="text-base font-semibold">Nueva cita</h3>
            </div>
            <form onSubmit={e => { e.preventDefault(); crear.mutate(form); }} className="p-5 space-y-3">
              <div>
                <label className="label">Cliente *</label>
                <select required value={form.cliente_id} onChange={e => setForm({ ...form, cliente_id: e.target.value })} className="input">
                  <option value="">Seleccionar cliente...</option>
                  {clientes.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                </select>
              </div>
              <div><label className="label">Fecha y hora *</label><input type="datetime-local" required value={form.fecha_hora} onChange={e => setForm({ ...form, fecha_hora: e.target.value })} className="input" /></div>
              <div><label className="label">Duración (minutos)</label><input type="number" value={form.duracion_min} onChange={e => setForm({ ...form, duracion_min: +e.target.value })} className="input" /></div>
              <div><label className="label">Descripción</label><textarea value={form.descripcion} onChange={e => setForm({ ...form, descripcion: e.target.value })} rows={2} className="input resize-none" placeholder="Servicio solicitado..." /></div>
              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="btn-secondary flex-1">Cancelar</button>
                <button type="submit" disabled={crear.isPending} className="btn-primary flex-1">
                  {crear.isPending ? <><Loader2 size={14} className="animate-spin" /> Guardando...</> : "Guardar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
