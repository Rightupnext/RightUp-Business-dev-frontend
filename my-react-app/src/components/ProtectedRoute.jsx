import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

export default function ProtectedRoute({ children, allowedRoles }) {
  const { user } = useContext(AuthContext);

  // ❌ No user = redirect to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // ❌ Wrong role = redirect to correct dashboard
  if (!allowedRoles.includes(user.role)) {
    if (user.role === "business") return <Navigate to="/main-dashboard" replace />;
    if (user.role === "project") return <Navigate to="/project-tasks" replace />;
    if (user.role === "admin") return <Navigate to="/admin-dashboard" replace />;
  }

  // ✅ Correct role = allow access
  return children;
}
