import React, { useState, useContext, useEffect, useRef } from "react";
import { Bell, ChevronDown } from "lucide-react";
import Logo from "../assets/rightup-logo.png";
import { AuthContext } from "../context/AuthContext";
import { ReminderContext } from "../context/ReminderContext";
import ProfileModal from "./modals/ProfileModal";
import ReminderPopup from "./modals/ReminderPopup";

const API_BASE = import.meta.env.VITE_BASE;

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);

  // FIX: Import both reminders + setReminders
  const { reminders, setReminders } = useContext(ReminderContext);

  const [open, setOpen] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const dropdownRef = useRef(null);

  const fullImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith("http")) return path;
    return `${API_BASE}/${path}`;
  };

  // Click outside close
  useEffect(() => {
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
        setShowNotifications(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <>
      <div className="w-full h-14 fixed bg-[#F1F1FF] border-b flex items-center justify-between px-4 md:px-6 shadow-sm z-50">
        <img src={Logo} alt="Logo" className="h-6 md:h-7" />

        <div
          className="flex items-center gap-3 md:gap-4 relative"
          ref={dropdownRef}
        >
          {/* 🔔 Notification icon */}
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative flex items-center justify-center cursor-pointer"
          >
            <Bell className="w-5 h-5 text-gray-700" />

            {reminders.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-semibold rounded-full w-4 h-4 flex items-center justify-center">
                {reminders.length}
              </span>
            )}
          </button>

          {/* Profile */}
          <button
            onClick={() => setOpen(!open)}
            className="flex items-center gap-1 px-2 py-1 rounded-full bg-white border text-sm font-semibold shadow-sm"
          >
            {user?.profilePic || user?.profileImage ? (
              <img
                src={fullImageUrl(user.profilePic || user.profileImage)}
                className="w-8 h-8 rounded-full object-cover border"
              />
            ) : (
              <span className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-200 text-gray-700 font-medium">
                {user?.name?.[0]?.toUpperCase() || "D"}
              </span>
            )}
            <ChevronDown className="w-4 h-4 text-gray-600" />
          </button>

          <ReminderPopup
  reminders={reminders}
  show={showNotifications}
  onClose={() => setShowNotifications(false)}
  onDeleteSuccess={(id) => onDeleteSuccess(id)}
/>


          {/* Dropdown menu */}
          {open && (
            <div className="absolute right-0 top-12 bg-white border rounded-lg shadow-md w-40 z-50">
              <button
                onClick={() => {
                  setShowProfile(true);
                  setOpen(false);
                }}
                className="w-full text-left px-4 py-2 hover:bg-gray-100"
              >
                Profile
              </button>

              <button
                onClick={logout}
                className="w-full text-left px-4 py-2 text-red-500 hover:bg-gray-100"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>

      {showProfile && <ProfileModal onClose={() => setShowProfile(false)} />}
    </>
  );
}
