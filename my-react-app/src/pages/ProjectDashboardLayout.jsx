import React, { useContext } from "react";
import { Routes, Route } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import ProjTaskManagement from "./proj-management/proj-task-management";
import ProjManagementProfile from "./proj-management/ProjManagement-profile";
import ProjectHandle from "./proj-management/ProjectHandle";
import ProjectPermission from "./proj-management/Permission";
import ProjectHolidays from "./proj-management/ProjectHolidays";
import LeaveReport from "./proj-management/LeaveReport";
import { AuthContext } from "../context/AuthContext";

export default function ProjectDashboardLayout() {
  const { user } = useContext(AuthContext);

  return (
    <div className="flex h-[100vh] flex-col">
      <Navbar userName={user?.name} />
      <div className="flex flex-1">
        <Sidebar />
        <div className="flex-1 p-4 overflow-auto">
          {/* ✅ Relative paths (no leading "/") */}
          <Routes>
            <Route path="project-tasks" element={<ProjTaskManagement />} />
            <Route path="project-profile" element={<ProjManagementProfile />} />
            <Route path="project" element={<ProjectHandle />} />
            <Route path="project-permission" element={<ProjectPermission />} />
            <Route path="project-holidays" element={<ProjectHolidays />} />
            <Route path="project-leave-report" element={<LeaveReport />} />
          </Routes>
        </div>
      </div>
    </div>
  );
}
