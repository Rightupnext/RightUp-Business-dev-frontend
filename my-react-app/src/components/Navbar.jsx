import React, { useState, useContext, useEffect, useRef } from "react";
import { Bell, ChevronDown } from "lucide-react";
import axios from "axios";
import Logo from "../assets/rightup-logo.png";
import { AuthContext } from "../context/AuthContext";
import ProfileModal from "./modals/ProfileModal";
const API_BASE = import.meta.env.VITE_BASE; 

export default function Navbar() {
  const { user, token, logout } = useContext(AuthContext);
  const [open, setOpen] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [reminders, setReminders] = useState([]);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const fetchReminders = async () => {
      try {
        const res = await axios.get(`${API_BASE}/clients/reminders`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setReminders(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    if (token) fetchReminders();
  }, [token]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <>
      <div className="w-full h-14 fixed bg-[#F1F1FF] border-b flex items-center justify-between px-6 shadow-sm">
        <div className="flex items-center gap-2">
          <img src={Logo} alt="Right UpNext" className="h-7" />
        </div>

        <div className="flex items-center gap-4 relative" ref={dropdownRef}>
          {/* Notification Icon */}
          <button className="relative">
            <Bell className="w-5 h-5 text-gray-700" />
            {reminders.length > 0 && (
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
            )}
          </button>

          {/* Profile Dropdown */}
          <button
            onClick={() => setOpen(!open)}
            className="flex items-center gap-1 px-2 py-1 rounded-full bg-white border text-sm font-semibold shadow-sm"
          >
            {user?.profilePic ? (
              <img
                src={user.profilePic}
                alt="Profile"
                className="w-8 h-8 rounded-full object-cover border border-gray-300"
              />
            ) : (
              <span className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-200 text-gray-700 font-medium">
                {user?.name?.[0]?.toUpperCase() || "D"}
              </span>
            )}
            <ChevronDown className="w-4 h-4 text-gray-600" />
          </button>

          {open && (
            <div className="absolute right-0 top-12 bg-white border rounded-lg shadow-md w-40 z-50">
              <button
                onClick={() => { setShowProfile(true); setOpen(false); }}
                className="block w-full text-left px-4 py-2 hover:bg-gray-100"
              >
                Profile
              </button>
              <button
                onClick={logout}
                className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-red-500"
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
