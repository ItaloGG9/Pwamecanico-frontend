import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../stores/auth.js";
import { authApi } from "../lib/api.js";
import toast from "react-hot-toast";
import { Wrench, Eye, EyeOff, Loader2 } from "lucide-react";

export default function LoginPage() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [form, setForm] = useState({ email: "", password: "" });
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await authApi.login(form.email, form.password);
      setAuth(data.usuario, data.access_token);
      toast.success(`Bienvenido, ${data.usuario.nombre}`);
      navigate("/dashboard");
    } catch (err) {
      toast.error(err.response?.data?.detail || "Email o contraseña incorrectos");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface-950 flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-brand-600/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-brand-800/10 rounded-full blur-3xl" />
      </div>
      <div className="relative w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-brand-600 flex items-center justify-center mx-auto mb-4">
            <Wrench size={22} className="text-white" />
          </div>
          <h1 className="text-2xl font-semibold text-white">PWAmecanico</h1>
          <p className="text-surface-400 text-sm mt-1">Gestión de talleres automotrices</p>
        </div>
        <div className="bg-surface-900 border border-white/5 rounded-2xl p-6">
          <h2 className="text-base font-semibold text-white mb-5">Iniciar sesión</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-surface-400 mb-1.5">Email</label>
              <input type="email" required value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="tu@email.com"
                className="w-full bg-surface-800 border border-white/5 rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-surface-500 focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all" />
            </div>
            <div>
              <label className="block text-xs font-medium text-surface-400 mb-1.5">Contraseña</label>
              <div className="relative">
                <input type={show ? "text" : "password"} required value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="••••••••"
                  className="w-full bg-surface-800 border border-white/5 rounded-xl px-3 py-2.5 pr-10 text-sm text-white placeholder:text-surface-500 focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all" />
                <button type="button" onClick={() => setShow(!show)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-500 hover:text-surface-300">
                  {show ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2 py-2.5 mt-2">
              {loading && <Loader2 size={15} className="animate-spin" />}
              {loading ? "Ingresando..." : "Ingresar"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
