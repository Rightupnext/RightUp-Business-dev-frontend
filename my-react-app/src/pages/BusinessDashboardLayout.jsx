import React, { useEffect, useState, useContext } from "react";
import { Routes, Route } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import BusinessClient from "./BusinessClient";
import CardDashboard from "./Card-Dashboard";
import Members from "./Members";
// import Tasks from "./Tasks";
import Navbar from "../components/Navbar";
import { AuthContext } from "../context/AuthContext";
import axios from "axios";

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

  if (!dashboardData) return <div>Loading...</div>;

  return (
    <div className="flex h-[100vh] flex-col">
      <Navbar userName={user?.name} />
      <div className="flex flex-1">
        <Sidebar />
        <div className="flex-1 p-4 overflow-auto">
          <Routes>
            <Route path="/main-dashboard" element={<CardDashboard cards={dashboardData.cards} />} />
            <Route path="/clients" element={<BusinessClient clients={dashboardData.clients} />} />
            <Route path="/members" element={<Members members={dashboardData.members} />} />
            {/* <Route path="/tasks" element={<Tasks />} /> */}
          </Routes>
        </div>
      </div>
    </div>
  );
}
