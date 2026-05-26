import axios from "axios";

const api = axios.create({
  baseURL: (import.meta.env.VITE_API_URL || "https://pwamecanico.railway.internal") + "/api/v1",
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("usuario");
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

export default api;

export const authApi = {
  login: (email, password) => api.post("/auth/login", { email, password }),
  register: (data) => api.post("/auth/register", data),
  me: () => api.get("/auth/me"),
};

export const clientesApi = {
  listar: () => api.get("/clientes"),
  crear: (data) => api.post("/clientes", data),
  obtener: (id) => api.get(`/clientes/${id}`),
  actualizar: (id, data) => api.patch(`/clientes/${id}`, data),
  vehiculos: (id) => api.get(`/clientes/${id}/vehiculos`),
};

export const vehiculosApi = {
  crear: (data) => api.post("/vehiculos", data),
  obtener: (id) => api.get(`/vehiculos/${id}`),
};

export const productosApi = {
  listar: () => api.get("/productos"),
  bajoStock: () => api.get("/productos/bajo-stock"),
  crear: (data) => api.post("/productos", data),
  actualizar: (id, data) => api.patch(`/productos/${id}`, data),
  eliminar: (id) => api.delete(`/productos/${id}`),
};

export const ordenesApi = {
  listar: (estado) => api.get("/ordenes", { params: estado ? { estado } : {} }),
  crear: (data) => api.post("/ordenes", data),
  obtener: (id) => api.get(`/ordenes/${id}`),
  cambiarEstado: (id, data) => api.patch(`/ordenes/${id}/estado`, data),
};

export const cotizacionesApi = {
  listar: () => api.get("/cotizaciones"),
  crear: (data) => api.post("/cotizaciones", data),
  aprobar: (id) => api.post(`/cotizaciones/${id}/aprobar`),
  cambiarEstado: (id, estado) =>
    api.patch(`/cotizaciones/${id}/estado`, null, { params: { estado } }),
};

export const citasApi = {
  listar: (fecha) => api.get("/citas", { params: fecha ? { fecha } : {} }),
  crear: (data) => api.post("/citas", data),
  actualizar: (id, data) => api.patch(`/citas/${id}`, data),
  cancelar: (id) => api.delete(`/citas/${id}`),
};
