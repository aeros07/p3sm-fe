import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ children, redirectPath = "/login", allowedRoles = [] }) => {
  const { auth } = useAuth();
  const token = auth?.token && localStorage.getItem("token");
  const userRoleSlug = auth?.user?.role_slug || auth?.user?.role || "guest";

  // Belum login
  if (!token) {
    return <Navigate to={redirectPath} replace />;
  }

  // Tidak pakai filter role → semua boleh
  if (allowedRoles.length === 0) {
    return children;
  }

  // Kalau nanti mau pakai role-based:
  if (!allowedRoles.includes(userRoleSlug)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
