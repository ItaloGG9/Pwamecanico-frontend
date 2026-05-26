import { Routes, Route, Navigate } from "react-router-dom";
import { useEffect } from "react";
import { useAuthStore } from "./stores/auth.js";
import LoginPage from "./pages/LoginPage.jsx";
import DashboardLayout from "./components/layout/DashboardLayout.jsx";
import DashboardPage from "./pages/dashboard/DashboardPage.jsx";
import InventarioPage from "./pages/dashboard/InventarioPage.jsx";
import ClientesPage from "./pages/dashboard/ClientesPage.jsx";
import OrdenesPage from "./pages/dashboard/OrdenesPage.jsx";
import CotizacionesPage from "./pages/dashboard/CotizacionesPage.jsx";
import AgendaPage from "./pages/dashboard/AgendaPage.jsx";
import ReportesPage from "./pages/dashboard/ReportesPage.jsx";

function PrivateRoute({ children }) {
  const token = useAuthStore((s) => s.token);
  if (!token) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  const hydrate = useAuthStore((s) => s.hydrate);
  useEffect(() => { hydrate(); }, []);

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/dashboard" element={<PrivateRoute><DashboardLayout /></PrivateRoute>}>
        <Route index element={<DashboardPage />} />
        <Route path="inventario" element={<InventarioPage />} />
        <Route path="clientes" element={<ClientesPage />} />
        <Route path="ordenes" element={<OrdenesPage />} />
        <Route path="cotizaciones" element={<CotizacionesPage />} />
        <Route path="agenda" element={<AgendaPage />} />
        <Route path="reportes" element={<ReportesPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
