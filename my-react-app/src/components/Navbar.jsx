import React, { useState, useContext, useEffect, useRef } from "react";
import { Bell, ChevronDown, Trash2, Phone } from "lucide-react";
import axios from "axios";
import Logo from "../assets/rightup-logo.png";
import { AuthContext } from "../context/AuthContext";
import ProfileModal from "./modals/ProfileModal";

const API_BASE = import.meta.env.VITE_BASE;

export default function Navbar() {
  const { user, token, logout } = useContext(AuthContext);
  const [open, setOpen] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [reminders, setReminders] = useState([]);
  const dropdownRef = useRef(null);

  // ✅ Fetch reminders
  useEffect(() => {
    const fetchReminders = async () => {
      try {
        const res = await axios.get(`${API_BASE}/clients/reminders`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setReminders(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error("Failed to fetch reminders:", err);
        setReminders([]);
      }
    };
    fetchReminders();
  }, [token]);

  // ✅ Delete reminder
  const deleteReminder = async (id) => {
    try {
      await axios.delete(`${API_BASE}/clients/reminders/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setReminders((prev) => prev.filter((r) => r._id !== id));
    } catch (err) {
      console.error("Failed to delete reminder:", err);
    }
  };

  // ✅ Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
        setShowNotifications(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <>
      <div className="w-full h-14 fixed bg-[#F1F1FF] border-b flex items-center justify-between px-4 md:px-6 shadow-sm z-50">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <img src={Logo} alt="Right UpNext" className="h-6 md:h-7" />
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-3 md:gap-4 relative" ref={dropdownRef}>
          {/* 🔔 Notification Icon */}
          <button onClick={() => setShowNotifications(!showNotifications)} className="relative">
            <Bell className="w-5 h-5 text-gray-700" />
            {reminders.length > 0 && (
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
            )}
          </button>

          {/* 🔔 Notifications Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 md:right-16 top-12 bg-white border rounded-lg shadow-lg w-72 sm:w-80 min-h-[180px] max-h-[320px] overflow-y-auto p-3 z-50">
              <h3 className="font-semibold mb-2 text-gray-800 text-sm md:text-base">
                Reminders
              </h3>

              {reminders.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-8">
                  No reminders available
                </p>
              ) : (
                reminders.map((r) => (
                  <div
                    key={r._id}
                    className="border-b last:border-none py-2 flex justify-between items-start"
                  >
                    <div className="flex-1 pr-2">
                      <p className="font-medium text-sm text-gray-800">{r.clientName}</p>
                      <p className="text-xs text-gray-600">{r.clientContact}</p>
                      <p className="text-xs text-gray-600">
                        {r.date} — {r.time}
                      </p>
                      <p className="text-xs text-gray-500 italic break-words">
                        {r.message}
                      </p>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                      {r.clientContact && (
                        <a
                          href={`tel:${r.clientContact}`}
                          className="pointer-events-auto"
                        >
                          <Phone className="w-4 h-4 text-green-500 cursor-pointer" />
                        </a>
                      )}
                      <Trash2
                        className="w-4 h-4 text-red-500 cursor-pointer"
                        onClick={() => deleteReminder(r._id)}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* 👤 Profile Dropdown */}
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
            <div className="absolute right-0 top-12 bg-white border rounded-lg shadow-md w-36 md:w-40 z-50">
              <button
                onClick={() => {
                  setShowProfile(true);
                  setOpen(false);
                }}
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

      {/* Profile Modal */}
      {showProfile && <ProfileModal onClose={() => setShowProfile(false)} />}
    </>
  );
}
