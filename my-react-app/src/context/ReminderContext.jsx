import React, { createContext, useState, useEffect, useContext } from "react";
import axios from "axios";
import { AuthContext } from "./AuthContext";

export const ReminderContext = createContext();

export const ReminderProvider = ({ children }) => {
  const { token } = useContext(AuthContext);
  const [reminders, setReminders] = useState([]);
  const API_BASE = import.meta.env.VITE_BASE;

  // ✅ Fetch reminders (today & upcoming)
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

  useEffect(() => {
    if (!token) return;
    fetchReminders();
    const interval = setInterval(fetchReminders, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [token]);

  return (
    <ReminderContext.Provider value={{ reminders, fetchReminders, deleteReminder }}>
      {children}
    </ReminderContext.Provider>
  );
};
