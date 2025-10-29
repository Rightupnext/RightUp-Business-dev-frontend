import React from "react";
import { Routes, Route } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import ProjTaskManagement from "./proj-management/proj-task-management";
import ProjManagementProfile from "./proj-management/ProjManagement-profile";
import { AuthContext } from "../context/AuthContext";
import { useContext } from "react";

export default function ProjectDashboardLayout() {
  const { user } = useContext(AuthContext);

  return (
    <div className="flex h-[100vh] flex-col">
      <Navbar userName={user?.name} />
      <div className="flex flex-1">
        <Sidebar />
        <div className="flex-1 p-4 overflow-auto">
          <Routes>
            <Route path="/project-tasks" element={<ProjTaskManagement />} />
            <Route path="/project-profile" element={<ProjManagementProfile />} />
          </Routes>
        </div>
      </div>
    </div>
  );
}
