import { QueryClient } from "@tanstack/react-query";

// Stale times por tipo de dato (en milisegundos)
export const STALE = {
  productos: 5 * 60_000,      // 5 min — catálogo estable
  clientes: 3 * 60_000,       // 3 min
  cotizaciones: 60_000,        // 1 min
  citas: 60_000,               // 1 min
  ordenes: 30_000,             // 30 seg — dato muy dinámico
  bajoStock: 2 * 60_000,      // 2 min
  me: 10 * 60_000,             // 10 min — perfil de usuario
};

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      gcTime: 5 * 60_000,
      retry: 1,
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: 0,
    },
  },
});
