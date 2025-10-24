import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { HomeIcon, UsersIcon, UserGroupIcon, ClipboardDocumentIcon } from "@heroicons/react/24/outline";

const menuItems = [
  { name: "Dashboard", icon: HomeIcon, path: "/main-dashboard" },
  { name: "Clients", icon: UsersIcon, path: "/clients" },
  { name: "Members", icon: UserGroupIcon, path: "/members" },
  { name: "Task", icon: ClipboardDocumentIcon, path: "/tasks" },
];

export default function Sidebar() {
  const [active, setActive] = useState("Clients");
  const navigate = useNavigate(); // Works now because Router is above

  return (
    <div className="h-[calc(100vh-3.5rem)] bg-[#f3f3ff] border-r p-4 flex flex-col gap-4">
      {menuItems.map((item) => (
        <button
          key={item.name}
          onClick={() => {
            setActive(item.name);
            navigate(item.path); // Sidebar handles navigation itself
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
