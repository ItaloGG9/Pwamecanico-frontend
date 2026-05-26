import { create } from "zustand";

export const useAuthStore = create((set) => ({
  usuario: null,
  token: null,
  setAuth: (usuario, token) => {
    localStorage.setItem("token", token);
    localStorage.setItem("usuario", JSON.stringify(usuario));
    set({ usuario, token });
  },
  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
    set({ usuario: null, token: null });
  },
  hydrate: () => {
    const token = localStorage.getItem("token");
    const raw = localStorage.getItem("usuario");
    if (token && raw) {
      try { set({ usuario: JSON.parse(raw), token }); } catch {}
    }
  },
}));
