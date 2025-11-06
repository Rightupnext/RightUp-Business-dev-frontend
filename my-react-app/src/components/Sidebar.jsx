import React, { useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import {
  HomeIcon,
  UsersIcon,
  UserGroupIcon,
  ClipboardDocumentIcon,
  UserCircleIcon,
} from "@heroicons/react/24/outline";

// ✅ Menus without leading slashes
const BUSINESS_MENU = [
  { name: "Dashboard", icon: HomeIcon, path: "main-dashboard" },
  { name: "Clients", icon: UsersIcon, path: "clients" },
  { name: "Members", icon: UserGroupIcon, path: "members" },
  { name: "Tasks", icon: ClipboardDocumentIcon, path: "tasks" },
  { name: "Monthly Report", icon: UserCircleIcon, path: "monthly-report" },
];

const PROJECT_MENU = [
  { name: "Task Management", icon: ClipboardDocumentIcon, path: "project-tasks" },
  { name: "Project Management", icon: UserCircleIcon, path: "project" },
  { name: "Profile", icon: UserCircleIcon, path: "project-profile" },
];

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useContext(AuthContext);

  const isProject = user?.role === "project";
  const basePath = isProject ? "/project" : "/business";
  const menuItems = isProject ? PROJECT_MENU : BUSINESS_MENU;

  return (
    <div className="h-full bg-[#f3f3ff] border-r p-4 mt-12 flex flex-col gap-4">
      {menuItems.map((item) => {
        // ✅ Prepend role-based base path
        const fullPath = `${basePath}/${item.path}`;
        const isActive = location.pathname === fullPath;

        return (
          <button
            key={item.name}
            onClick={() => navigate(fullPath)}
            className={`flex items-center gap-3 p-2 rounded-md transition cursor-pointer ${
              isActive
                ? "bg-white text-[#5B4FE8] shadow-md font-medium"
                : "text-gray-700 hover:bg-white/60 hover:text-[#5B4FE8]"
            }`}
          >
            <item.icon className="h-6 w-6" />
            <span className="hidden lg:block text-sm font-medium">{item.name}</span>
          </button>
        );
      })}
    </div>
  );
}
