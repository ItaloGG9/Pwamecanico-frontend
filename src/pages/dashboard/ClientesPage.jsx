import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { clientesApi } from "../../lib/api.js";
import { STALE } from "../../lib/queryClient.js";
import { Plus, Search, User, Phone, Mail } from "lucide-react";
import toast from "react-hot-toast";

export default function ClientesPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const empty = { nombre: "", rut: "", telefono: "", email: "", direccion: "", notas: "" };
  const [form, setForm] = useState(empty);

  const { data: clientes = [], isLoading } = useQuery({
    queryKey: ["clientes"],
    queryFn: () => clientesApi.listar().then(r => r.data),
    staleTime: STALE.clientes,
  });

  const crear = useMutation({
    mutationFn: (data) => clientesApi.crear(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["clientes"] });
      toast.success("Cliente creado");
      setShowForm(false); setForm(empty);
    },
    onError: () => toast.error("Error al crear cliente"),
  });

  const filtered = clientes.filter(c =>
    c.nombre.toLowerCase().includes(search.toLowerCase()) ||
    (c.rut || "").includes(search) || (c.telefono || "").includes(search)
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-surface-900">Clientes</h1>
        <button onClick={() => setShowForm(true)} className="btn-primary flex items-center gap-2">
          <Plus size={15} /> Nuevo cliente
        </button>
      </div>

      <div className="relative mb-5">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar por nombre, RUT o teléfono..." className="input pl-9" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          <p className="text-sm text-surface-400 col-span-3 text-center py-8">Cargando...</p>
        ) : filtered.length === 0 ? (
          <p className="text-sm text-surface-400 col-span-3 text-center py-8">Sin clientes registrados</p>
        ) : filtered.map(c => (
          <div key={c.id} className="card p-4 hover:shadow-lg transition-shadow">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center flex-shrink-0">
                <User size={18} className="text-brand-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-surface-900 truncate">{c.nombre}</p>
                {c.rut && <p className="text-xs text-surface-400 mt-0.5">RUT: {c.rut}</p>}
                <div className="flex flex-col gap-1 mt-2">
                  {c.telefono && <div className="flex items-center gap-1.5 text-xs text-surface-500"><Phone size={11} />{c.telefono}</div>}
                  {c.email && <div className="flex items-center gap-1.5 text-xs text-surface-500"><Mail size={11} /><span className="truncate">{c.email}</span></div>}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-float w-full max-w-md">
            <div className="p-5 border-b border-surface-100">
              <h3 className="text-base font-semibold">Nuevo cliente</h3>
            </div>
            <form onSubmit={e => { e.preventDefault(); crear.mutate(form); }} className="p-5 space-y-3">
              <div><label className="label">Nombre *</label><input required value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} className="input" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="label">RUT</label><input value={form.rut} onChange={e => setForm({ ...form, rut: e.target.value })} placeholder="12.345.678-9" className="input" /></div>
                <div><label className="label">Teléfono</label><input value={form.telefono} onChange={e => setForm({ ...form, telefono: e.target.value })} placeholder="+56 9 1234 5678" className="input" /></div>
              </div>
              <div><label className="label">Email</label><input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="input" /></div>
              <div><label className="label">Dirección</label><input value={form.direccion} onChange={e => setForm({ ...form, direccion: e.target.value })} className="input" /></div>
              <div><label className="label">Notas</label><textarea value={form.notas} onChange={e => setForm({ ...form, notas: e.target.value })} rows={2} className="input resize-none" /></div>
              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="btn-secondary flex-1">Cancelar</button>
                <button type="submit" disabled={crear.isPending} className="btn-primary flex-1">{crear.isPending ? "Guardando..." : "Guardar"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
