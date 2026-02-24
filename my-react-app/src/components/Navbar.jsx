import { Bell, ChevronDown } from "lucide-react";
import addNotification from "react-push-notification";
import Logo from "../assets/rightup-logo.png";
import { AuthContext } from "../context/AuthContext";
import { ReminderContext } from "../context/ReminderContext";
import ProfileModal from "./modals/ProfileModal";
import ReminderPopup from "./modals/ReminderPopup";
import { useContext, useEffect, useState, dropdownRef } from "react";

const API_BASE = import.meta.env.VITE_BASE;

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);

  // FIX: Import both reminders + setReminders
  const { reminders, setReminders, todayGroup } = useContext(ReminderContext);

  const [open, setOpen] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [breakNotifications, setBreakNotifications] = useState([]);
  const [lastNotifiedBreak, setLastNotifiedBreak] = useState(null); // To avoid duplicate push notifications

  const fullImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith("http")) return path;
    return `${API_BASE}/${path}`;
  };

  // ✅ Break Reminder Logic
  useEffect(() => {
    const checkBreaks = () => {
      // Only show on the Project side
      if (!todayGroup || !window.location.pathname.startsWith("/project")) {
        if (breakNotifications.length > 0) setBreakNotifications([]);
        return;
      }

      const now = new Date();
      const newBreakNotifications = [];
      let triggerPush = null;

      const breaks = [
        { label: "MG Break", in: todayGroup.MGBreakIn, out: todayGroup.MGBreakOut },
        { label: "Eve Break", in: todayGroup.EveBreakIn, out: todayGroup.EveBreakOut },
      ];

      breaks.forEach((b) => {
        if (b.in && !b.out) {
          // Robust UTC-based time comparison for HH:mm:ss strings
          const startTime = new Date(`1970-01-01T${b.in}Z`);
          const nowISO = now.toISOString().split("T")[1].slice(0, 8);
          const nowTime = new Date(`1970-01-01T${nowISO}Z`);

          const elapsedMin = (nowTime - startTime) / (1000 * 60);

          // If break started more than 20 mins ago but less than 25 mins ago
          if (elapsedMin >= 20 && elapsedMin < 25) {
            const remainingMin = Math.ceil(25 - elapsedMin);
            const message = `${b.label}: only ${remainingMin} min${remainingMin > 1 ? "s" : ""} left`;
            newBreakNotifications.push({
              _id: `break-${b.label}-${remainingMin}`, // Unique ID for each minute update
              message,
              type: "break",
            });

            // Trigger Push Notification if not already done for this break session
            if (lastNotifiedBreak !== b.label) {
              triggerPush = { title: "Break Reminder", message };
              setLastNotifiedBreak(b.label);
            }
          }
        } else if (b.out && lastNotifiedBreak === b.label) {
          // Reset notification flag when break ends
          setLastNotifiedBreak(null);
        }
      });

      if (triggerPush) {
        addNotification({
          title: triggerPush.title,
          subtitle: "Break Timing",
          message: triggerPush.message,
          theme: "blue",
          native: true, // Native browser notification
        });
      }

      setBreakNotifications(newBreakNotifications);
    };

    checkBreaks();
    const interval = setInterval(checkBreaks, 5000); // Check every 5 seconds for real-time updates
    return () => clearInterval(interval);
  }, [todayGroup, window.location.pathname, lastNotifiedBreak]);

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

  const allReminders = [...breakNotifications, ...reminders];

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

            {allReminders.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-semibold rounded-full w-4 h-4 flex items-center justify-center">
                {allReminders.length}
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
            reminders={allReminders}
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
