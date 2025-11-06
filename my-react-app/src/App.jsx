import React, { useContext } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, AuthContext } from "./context/AuthContext";
import AuthModal from "./components/modals/AuthModal";
import { Toaster } from "react-hot-toast";
import { Notifications } from "react-push-notification";

// Layouts
import AdminDashboard from "./pages/AdminDashboard";
import BusinessDashboardLayout from "./pages/BusinessDashboardLayout";
import ProjectDashboardLayout from "./pages/ProjectDashboardLayout";

function ProtectedRoute({ children, allowedRole }) {
  const { user } = useContext(AuthContext);

  // 🚫 No user → go to login
  if (!user) return <Navigate to="/login" replace />;

  // 🚫 Wrong role → redirect to their correct dashboard
  if (user.role !== allowedRole) {
    if (user.role === "business") return <Navigate to="/business" replace />;
    if (user.role === "project") return <Navigate to="/project" replace />;
    if (user.role === "admin") return <Navigate to="/admin" replace />;
  }

  // ✅ Correct role → allow access
  return children;
}

function AppContent() {
  const { user } = useContext(AuthContext);

  return (
    <>
      <Notifications />
      <Toaster position="top-right" reverseOrder={false} />

      <Routes>
        {/* 🟢 Auth / Login */}
        <Route
          path="/login"
          element={
            user ? (
              // ✅ Already logged in → go to correct dashboard
              <Navigate
                to={
                  user.role === "business"
                    ? "/business"
                    : user.role === "project"
                    ? "/project"
                    : "/admin"
                }
                replace
              />
            ) : (
              <AuthModal />
            )
          }
        />

        {/* 🧭 Role-protected routes */}
        <Route
          path="/business/*"
          element={
            <ProtectedRoute allowedRole="business">
              <BusinessDashboardLayout />
            </ProtectedRoute>
          }
        />
        <Route
          path="/project/*"
          element={
            <ProtectedRoute allowedRole="project">
              <ProjectDashboardLayout />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/*"
          element={
            <ProtectedRoute allowedRole="admin">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* 🏠 Root redirect */}
        <Route
          path="*"
          element={
            user ? (
              <Navigate
                to={
                  user.role === "business"
                    ? "/business"
                    : user.role === "project"
                    ? "/project"
                    : "/admin"
                }
                replace
              />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}
