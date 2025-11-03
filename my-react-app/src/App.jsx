import React, { useContext, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, AuthContext } from "./context/AuthContext";
import AuthModal from "./components/modals/AuthModal";
import { Toaster } from "react-hot-toast";

// Layouts
import AdminDashboard from "./pages/AdminDashboard";
import BusinessDashboardLayout from "./pages/BusinessDashboardLayout";
import ProjectDashboardLayout from "./pages/ProjectDashboardLayout";

function AppContent() {
  const { user } = useContext(AuthContext);

useEffect(() => {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/pushify-sw.js')
        .then((registration) => {
          console.log('✅ Pushify Service Worker registered:', registration);
        })
        .catch((error) => {
          console.error('❌ Pushify SW registration failed:', error);
        });
    });
  }
}, []);


  // ✅ App Logic
  if (!user) {
    return (
      <>
        <Routes>
          <Route path="*" element={<AuthModal />} />
        </Routes>
        <Toaster position="top-right" reverseOrder={false} />
      </>
    );
  }

  return (
    <>
      <Routes>
        {user.role === "business" && <Route path="/*" element={<BusinessDashboardLayout />} />}
        {user.role === "project" && <Route path="/*" element={<ProjectDashboardLayout />} />}
        {user.role === "admin" && <Route path="/*" element={<AdminDashboard />} />}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
      <Toaster position="top-right" reverseOrder={false} />
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
