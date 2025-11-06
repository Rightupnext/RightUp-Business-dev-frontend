import React, { useEffect, useState, useContext } from "react";
import { Routes, Route } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import BusinessClient from "./BusinessClient";
import CardDashboard from "./Card-Dashboard";
import BusinessTaskView from "./Business-task";
import MonthlyReport from "./MonthlyReport";
import Members from "./Members";
import Navbar from "../components/Navbar";
import { AuthContext } from "../context/AuthContext";
import axios from "axios";
import BusinessUserProjects from "./BusinessUserProjects";

const API_BASE = import.meta.env.VITE_BASE;

export default function BusinessDashboardLayout() {
  const { user, token, logout } = useContext(AuthContext);
  const [dashboardData, setDashboardData] = useState(null);

  useEffect(() => {
    if (!token) return;

    const fetchDashboard = async () => {
      try {
        const res = await axios.get(`${API_BASE}/auth/dashboard`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setDashboardData(res.data.dashboardData);
      } catch (err) {
        console.error("Error fetching dashboard:", err);
        if (err.response?.status === 401) logout();
      }
    };
    fetchDashboard();
  }, [token]);

  if (!dashboardData)
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600 font-medium">Loading dashboard...</p>
        </div>
      </div>
    );

  return (
    <div className="flex h-[100vh] flex-col">
      <Navbar userName={user?.name} />
      <div className="flex flex-1">
        <Sidebar />
        <div className="flex-1 p-4 overflow-auto">
          {/* ✅ Notice: No leading "/" in paths here */}
          <Routes>
            <Route path="main-dashboard" element={<CardDashboard cards={dashboardData.cards} />} />
            <Route path="clients" element={<BusinessClient clients={dashboardData.clients} />} />
            <Route path="members" element={<Members members={dashboardData.members} />} />
            <Route path="tasks" element={<BusinessTaskView />} />
            <Route path="monthly-report" element={<MonthlyReport />} />
            <Route path="business-user-projects/:id" element={<BusinessUserProjects />} />
          </Routes>
        </div>
      </div>
    </div>
  );
}
