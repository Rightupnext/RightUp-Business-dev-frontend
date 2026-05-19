import React, { useContext, useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import {
  HomeIcon,
  ChartBarIcon,
  UsersIcon,
  UserGroupIcon,
  ClipboardDocumentIcon,
  UserCircleIcon,
  ShieldCheckIcon,
  IdentificationIcon,
  ClipboardDocumentCheckIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";
import socket from "../socket/socket";

// ── Menus ─────────────────────────────────────────────────────────────────────
const BUSINESS_MENU = [
  { name: "demo-overview-analytics", icon: HomeIcon,                       path: "demo-overview-analytics"  },
  { name: "Dashboard",               icon: HomeIcon,                       path: "main-dashboard"           },
  { name: "Analytics Report",        icon: ChartBarIcon,                   path: "analytics-report"         },
  { name: "Schedule",                icon: ClipboardDocumentCheckIcon,     path: "admin-task-schedule"      },
  { name: "Tasks",                   icon: ClipboardDocumentIcon,          path: "tasks"                    },
  { name: "Clients",                 icon: UsersIcon,                      path: "clients"                  },
  { name: "Members",                 icon: UserGroupIcon,                  path: "members"                  },
  { name: "Monthly Report",          icon: UserCircleIcon,                 path: "monthly-report"           },
  { name: "Holiday Calendar",        icon: IdentificationIcon,             path: "business-holidays"        },
];

const PROJECT_MENU = [
  { name: "Task Management",   icon: ClipboardDocumentIcon, path: "project-tasks"        },
  { name: "Project Management",icon: UserCircleIcon,        path: "project"              },
  { name: "Profile",           icon: IdentificationIcon,   path: "project-profile"      },
  { name: "Permission",        icon: ShieldCheckIcon,       path: "project-permission"   },
  { name: "Holiday-Calendar",  icon: IdentificationIcon,   path: "project-holidays"     },
  { name: "Leave Report",      icon: UserCircleIcon,        path: "project-leave-report" },
];

// ── Sidebar ───────────────────────────────────────────────────────────────────
export default function Sidebar() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { user }  = useContext(AuthContext);

  const [scheduleCount, setScheduleCount] = useState(0);
  const [collapsed,     setCollapsed]     = useState(false);

  const isProject = user?.role === "project";
  const basePath  = isProject ? "/project" : "/business";
  const menuItems = isProject ? PROJECT_MENU : BUSINESS_MENU;

  // ── Socket: schedule badge ─────────────────────────────────────────────────
  useEffect(() => {
    if (!user?._id) return;
    socket.emit("join", user._id);
    socket.on("scheduleCreated", () => setScheduleCount((p) => p + 1));
    socket.on("scheduleDeleted", () => setScheduleCount((p) => (p > 0 ? p - 1 : 0)));
    return () => {
      socket.off("scheduleCreated");
      socket.off("scheduleDeleted");
    };
  }, [user]);

  return (
    <>
      {/* ── Sidebar panel ── */}
      <div
        className={`
          h-full bg-[#f3f3ff] border-r flex flex-col mt-12 pt-3 pb-6
          transition-all duration-300 ease-in-out overflow-hidden
          ${collapsed ? "w-[64px]" : "w-[220px]"}
        `}
      >
        {/* Toggle button */}
        <div className={`flex ${collapsed ? "justify-center" : "justify-end pr-3"} mb-3`}>
          <button
            onClick={() => setCollapsed((c) => !c)}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className="w-7 h-7 flex items-center justify-center rounded-lg bg-white border border-slate-200 shadow-sm text-slate-400 hover:text-[#5B4FE8] hover:border-[#5B4FE8] hover:shadow-md transition-all duration-200"
          >
            {collapsed
              ? <ChevronRightIcon className="w-4 h-4" />
              : <ChevronLeftIcon  className="w-4 h-4" />
            }
          </button>
        </div>

        {/* Menu items */}
        <nav className="flex flex-col gap-1 px-2 flex-1">
          {menuItems.map((item) => {
            const fullPath = `${basePath}/${item.path}`;
            const isActive = location.pathname === fullPath;
            const isSchedule = item.path === "admin-task-schedule";

            return (
              <button
                key={item.name}
                onClick={() => navigate(fullPath)}
                title={collapsed ? item.name : undefined}
                className={`
                  relative flex items-center gap-3 rounded-lg transition-all duration-200 cursor-pointer
                  ${collapsed ? "justify-center px-0 py-2.5" : "px-3 py-2.5"}
                  ${isActive
                    ? "bg-white text-[#5B4FE8] shadow-md font-semibold"
                    : "text-gray-600 hover:bg-white/70 hover:text-[#5B4FE8] hover:shadow-sm"
                  }
                `}
              >
                {/* Icon */}
                <div className="relative flex-shrink-0">
                  <item.icon className="h-5 w-5" />
                  {/* Badge on icon when collapsed */}
                  {isSchedule && scheduleCount > 0 && collapsed && (
                    <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center leading-none">
                      {scheduleCount > 9 ? "9+" : scheduleCount}
                    </span>
                  )}
                </div>

                {/* Label + badge (expanded only) */}
                {!collapsed && (
                  <>
                    <span className="text-sm font-medium truncate flex-1 text-left">
                      {item.name}
                    </span>
                    {isSchedule && scheduleCount > 0 && (
                      <span className="flex-shrink-0 bg-red-500 text-white text-[10px] font-bold min-w-[20px] h-5 px-1.5 rounded-full flex items-center justify-center leading-none">
                        {scheduleCount > 9 ? "9+" : scheduleCount}
                      </span>
                    )}
                  </>
                )}

                {/* Active indicator bar */}
                {isActive && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-[#5B4FE8] rounded-r-full" />
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </>
  );
}