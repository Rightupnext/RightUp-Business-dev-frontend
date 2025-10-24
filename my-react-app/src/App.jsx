import React, { useContext } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthContext, AuthProvider } from "./context/AuthContext";
import AuthModal from "./components/modals/AuthModal";
import AdminDashboard from "./pages/AdminDashboard";
import DashboardLayout from "./pages/DashboardLayout";
// import BusinessClient from "./pages/BusinessClient";
// import MembersPage from "./pages/MembersPage";
// import TaskPage from "./pages/TaskPage";
// import DashboardHome from "./pages/DashboardHome";

function AppContent() {
  const { user } = useContext(AuthContext);

  if (!user) return <AuthModal />;

  return (
    <Router>
      {user.role === "admin" ? (
        <AdminDashboard />
      ) : (
        <DashboardLayout />
      )}
    </Router>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
