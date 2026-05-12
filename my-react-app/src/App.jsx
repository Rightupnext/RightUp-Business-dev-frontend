import React, { useContext } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, AuthContext } from "./context/AuthContext";
import AuthModal from "./components/modals/AuthModal";
import { Toaster } from "react-hot-toast";
import { Notifications } from "react-push-notification";
import { ReminderProvider } from "./context/ReminderContext";

// Layouts
import BusinessDashboardLayout from "./pages/BusinessDashboardLayout";
import ProjectDashboardLayout from "./pages/ProjectDashboardLayout";

function ProtectedRoute({ children, allowedRole }) {
  const { user } = useContext(AuthContext);

  // 🚫 No user → go to login
  if (!user) return <Navigate to="/" replace />;

  // 🚫 Wrong role → redirect to their correct dashboard
  if (user.role !== allowedRole) {
    if (user.role === "business") return <Navigate to="/business" replace />;
    if (user.role === "project") return <Navigate to="/project" replace />;
  }

  // ✅ Correct role → allow access
  return children;
}

function AppContent() {
  const { user } = useContext(AuthContext);

  return (
    <>
      <Notifications />
      <Toaster
  position="top-center"
  reverseOrder={false}
/>

      <Routes>
        {/* 🟢 Login / Root route */}
        <Route
          path="/"
          element={
            user ? (
              // ✅ Redirect logged-in users to their dashboard
              <Navigate
                to={user.role === "business" ? "/business/main-dashboard" : "/project/project-tasks"}
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

        {/* 🧭 Catch-all fallback */}
        <Route
          path="*"
          element={
            user ? (
              <Navigate
                to={user.role === "business" ? "/business" : "/project"}
                replace
              />
            ) : (
              <Navigate to="/" replace />
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
        <ReminderProvider>
      <Router>
        <AppContent />
      </Router>
      </ReminderProvider>
    </AuthProvider>
  );
}
