import React from "react";
import { Routes, Route } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import BusinessClient from "./BusinessClient";
import CardDashboard from "./Card-Dashboard";
import Members from "./Members";
import Navbar from "../components/Navbar"; // import your Navbar component

export default function DashboardLayout() {
  return (
    <div className="flex h-[100vh] flex-col">
      {/* Navbar on top */}
      <Navbar />

      <div className="flex flex-1">
        {/* Sidebar on left */}
        <Sidebar />

        {/* Main content area */}
        <div className="flex-1 p-4 overflow-auto">
          <Routes>
            <Route path="/clients" element={<BusinessClient />} />
             <Route path="/main-dashboard" element={<CardDashboard />} />
              <Route path="/members" element={<Members/>} />
            {/* Add other routes here */}
          </Routes>
        </div>
      </div>
    </div>
  );
}
