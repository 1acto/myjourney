import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { ReactElement } from "react";

interface ProtectedRouteProps {
  children: ReactElement;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuth, loading } = useAuth();

  if (loading) {
    // You can return a loading spinner or component here
    return <div>Loading...</div>;
  }

  return isAuth ? children : <Navigate to="/login" replace />;
}
