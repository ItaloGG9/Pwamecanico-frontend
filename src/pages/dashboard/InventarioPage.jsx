import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { productosApi } from "../../lib/api.js";
import { STALE } from "../../lib/queryClient.js";
import { formatCLP, cn } from "../../lib/utils.js";
import { Plus, Search, AlertTriangle, Package, Pencil } from "lucide-react";
import toast from "react-hot-toast";

export default function InventarioPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const empty = { nombre: "", sku: "", stock_actual: 0, stock_minimo: 1, precio_costo: 0, precio_venta: 0, unidad: "unidad", descripcion: "" };
  const [form, setForm] = useState(empty);

  const { data: productos = [], isLoading } = useQuery({
    queryKey: ["productos"],
    queryFn: () => productosApi.listar().then(r => r.data),
    staleTime: STALE.productos,
  });

  const guardar = useMutation({
    mutationFn: (data) => editing ? productosApi.actualizar(editing.id, data) : productosApi.crear(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["productos"] });
      toast.success(editing ? "Producto actualizado" : "Producto creado");
      setShowForm(false); setEditing(null); setForm(empty);
    },
    onError: () => toast.error("Error al guardar"),
  });

  const openEdit = (p) => {
    setEditing(p);
    setForm({ nombre: p.nombre, sku: p.sku || "", stock_actual: p.stock_actual, stock_minimo: p.stock_minimo, precio_costo: p.precio_costo, precio_venta: p.precio_venta, unidad: p.unidad, descripcion: p.descripcion || "" });
    setShowForm(true);
  };

  const filtered = productos.filter(p =>
    p.nombre.toLowerCase().includes(search.toLowerCase()) || (p.sku || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-surface-900">Inventario</h1>
          {productos.filter(p => p.bajo_stock).length > 0 && (
            <div className="flex items-center gap-1.5 mt-1">
              <AlertTriangle size={13} className="text-amber-500" />
              <span className="text-xs text-amber-600">{productos.filter(p => p.bajo_stock).length} con bajo stock</span>
            </div>
          )}
        </div>
        <button onClick={() => { setEditing(null); setForm(empty); setShowForm(true); }} className="btn-primary flex items-center gap-2">
          <Plus size={15} /> Nuevo producto
        </button>
      </div>

      <div className="relative mb-5">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar por nombre o SKU..." className="input pl-9" />
      </div>

      <div className="card overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-surface-100">
              <th className="text-left px-4 py-3 text-xs font-medium text-surface-500">Producto</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-surface-500">SKU</th>
              <th className="text-right px-4 py-3 text-xs font-medium text-surface-500">Stock</th>
              <th className="text-right px-4 py-3 text-xs font-medium text-surface-500">Precio venta</th>
              <th className="text-center px-4 py-3 text-xs font-medium text-surface-500">Estado</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-50">
            {isLoading ? (
              <tr><td colSpan={6} className="text-center py-8 text-sm text-surface-400">Cargando...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-8 text-sm text-surface-400">Sin productos</td></tr>
            ) : filtered.map(p => (
              <tr key={p.id} className="hover:bg-surface-50 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-surface-100 flex items-center justify-center flex-shrink-0">
                      <Package size={14} className="text-surface-400" />
                    </div>
                    <span className="text-sm font-medium">{p.nombre}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-surface-500 font-mono">{p.sku || "—"}</td>
                <td className="px-4 py-3 text-right">
                  <span className={cn("text-sm font-semibold", p.bajo_stock ? "text-amber-600" : "text-surface-900")}>{p.stock_actual}</span>
                  <span className="text-xs text-surface-400 ml-1">/ mín {p.stock_minimo}</span>
                </td>
                <td className="px-4 py-3 text-right text-sm">{formatCLP(p.precio_venta)}</td>
                <td className="px-4 py-3 text-center">
                  {p.bajo_stock
                    ? <span className="badge bg-amber-50 text-amber-700"><AlertTriangle size={10} /> Bajo</span>
                    : <span className="badge bg-green-50 text-green-700">OK</span>}
                </td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => openEdit(p)} className="text-surface-400 hover:text-brand-600 transition-colors">
                    <Pencil size={14} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-float w-full max-w-md">
            <div className="p-5 border-b border-surface-100">
              <h3 className="text-base font-semibold">{editing ? "Editar producto" : "Nuevo producto"}</h3>
            </div>
            <form onSubmit={e => { e.preventDefault(); guardar.mutate(form); }} className="p-5 space-y-3">
              <div><label className="label">Nombre *</label><input required value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} className="input" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="label">SKU</label><input value={form.sku} onChange={e => setForm({ ...form, sku: e.target.value })} className="input" /></div>
                <div><label className="label">Unidad</label><input value={form.unidad} onChange={e => setForm({ ...form, unidad: e.target.value })} className="input" /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="label">Stock actual</label><input type="number" value={form.stock_actual} onChange={e => setForm({ ...form, stock_actual: +e.target.value })} className="input" /></div>
                <div><label className="label">Stock mínimo</label><input type="number" value={form.stock_minimo} onChange={e => setForm({ ...form, stock_minimo: +e.target.value })} className="input" /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="label">Precio costo</label><input type="number" value={form.precio_costo} onChange={e => setForm({ ...form, precio_costo: +e.target.value })} className="input" /></div>
                <div><label className="label">Precio venta</label><input type="number" value={form.precio_venta} onChange={e => setForm({ ...form, precio_venta: +e.target.value })} className="input" /></div>
              </div>
              <div><label className="label">Descripción</label><textarea value={form.descripcion} onChange={e => setForm({ ...form, descripcion: e.target.value })} rows={2} className="input resize-none" /></div>
              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => { setShowForm(false); setEditing(null); }} className="btn-secondary flex-1">Cancelar</button>
                <button type="submit" disabled={guardar.isPending} className="btn-primary flex-1">{guardar.isPending ? "Guardando..." : "Guardar"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
