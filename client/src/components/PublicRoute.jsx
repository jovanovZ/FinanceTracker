import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export default function PublicRoute() {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) return <div>Loading...</div>;

  if (!isAuthenticated) return <Outlet />;

  return <Navigate to={user?.onboardingDone ? '/dashboard' : '/onboarding'} replace />;
}