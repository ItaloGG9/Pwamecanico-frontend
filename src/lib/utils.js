import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function formatCLP(amount) {
  return new Intl.NumberFormat("es-CL", {
    style: "currency", currency: "CLP", minimumFractionDigits: 0,
  }).format(amount || 0);
}

export function formatFecha(date) {
  return new Date(date).toLocaleDateString("es-CL", {
    day: "2-digit", month: "2-digit", year: "numeric",
  });
}

export const ESTADO_OT_LABELS = {
  recibido: "Recibido",
  diagnostico: "Diagnóstico",
  en_reparacion: "En reparación",
  espera_repuesto: "Espera repuesto",
  listo: "Listo",
  entregado: "Entregado",
};

export const ESTADO_OT_COLORS = {
  recibido: "bg-surface-100 text-surface-600",
  diagnostico: "bg-amber-50 text-amber-700",
  en_reparacion: "bg-blue-50 text-blue-700",
  espera_repuesto: "bg-orange-50 text-orange-700",
  listo: "bg-green-50 text-green-700",
  entregado: "bg-surface-100 text-surface-400",
};
