import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

// Icons
import { 
  HomeIcon, 
  UsersIcon, 
  UserGroupIcon, 
  ClipboardDocumentIcon, 
  UserCircleIcon 
} from "@heroicons/react/24/outline";

// ✅ Sidebar Menus Based on role
const BUSINESS_MENU = [
  { name: "Dashboard", icon: HomeIcon, path: "/main-dashboard" },
  { name: "Clients", icon: UsersIcon, path: "/clients" },
  { name: "Members", icon: UserGroupIcon, path: "/members" },
  { name: "Tasks", icon: ClipboardDocumentIcon, path: "/tasks" },
];

const PROJECT_MENU = [
  { name: "Task Management", icon: ClipboardDocumentIcon, path: "/project-tasks" },
  { name: "Profile", icon: UserCircleIcon, path: "/project-profile" },
];

export default function Sidebar() {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const [active, setActive] = useState("");

  // ✅ Choose menu based on role
  const menuItems = user?.role === "project" ? PROJECT_MENU : BUSINESS_MENU;

  return (
    <div className="h-full bg-[#f3f3ff] border-r p-4 mt-12 flex flex-col gap-4">

      {menuItems.map((item) => (
        <button
          key={item.name}
          onClick={() => {
            setActive(item.name);
            navigate(item.path);
          }}
          className={`flex items-center gap-3 p-2 rounded-md transition
          ${active === item.name ? "bg-white text-[#5B4FE8] shadow-md" : "text-gray-700"}`}
        >
          <item.icon className="h-6 w-6" />
          <span className="hidden lg:block text-sm font-medium">{item.name}</span>
        </button>
      ))}
    </div>
  );
}
