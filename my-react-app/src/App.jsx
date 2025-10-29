import React, { useContext } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, AuthContext } from "./context/AuthContext";
import AuthModal from "./components/modals/AuthModal";

// ✅ Layouts
import AdminDashboard from "./pages/AdminDashboard";
import BusinessDashboardLayout from "./pages/BusinessDashboardLayout";
import ProjectDashboardLayout from "./pages/ProjectDashboardLayout";

function AppContent() {
  const { user } = useContext(AuthContext);

  if (!user) {
    return (
      <Routes>
        <Route path="*" element={<AuthModal />} />
      </Routes>
    );
  }

  return (
    <Routes>
      {/* ✅ Business User */}
      {user.role === "business" && (
        <>
          <Route path="/*" element={<BusinessDashboardLayout />} />
        </>
      )}

      {/* ✅ Project User */}
      {user.role === "project" && (
        <>
          <Route path="/*" element={<ProjectDashboardLayout />} />
        </>
      )}

      {/* ✅ Admin User */}
      {user.role === "admin" && (
        <>
          <Route path="/*" element={<AdminDashboard />} />
        </>
      )}

      {/* ✅ Safety Redirect */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
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
