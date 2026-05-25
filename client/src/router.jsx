import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import PublicRoute from "./components/PublicRoute";

import AppShell from "./AppShell";
import Login from "./screens/Login";
import ForgotPassword from "./screens/ForgotPassword";
import Profile from "./screens/Profile";
import Dashboard from "./screens/Dashboard";
import Transactions from "./screens/Transactions";

export default function Router() {
  return (
    <BrowserRouter>
      <Routes>

  {/* public routes */}
  <Route element={<PublicRoute />}>
    <Route path="/login" element={<Login />} />
    <Route path="/forgot-password" element={<ForgotPassword />} />
  </Route>

  {/* protected routes */}
  <Route element={<ProtectedRoute />}>
    <Route element={<AppShell />}>
      <Route path="/profile" element={<Profile />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/transactions" element={<Transactions />} />
    </Route>
  </Route>

  <Route path="*" element={<Navigate to="/login" replace />} />

</Routes>
    </BrowserRouter>
  );
}