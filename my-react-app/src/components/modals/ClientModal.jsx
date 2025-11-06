import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import addNotification from "react-push-notification";
import { AuthContext } from "../../context/AuthContext";

const API_BASE = import.meta.env.VITE_BASE;

export default function ClientModal({ onClose, refresh, client }) {
  const { token } = useContext(AuthContext);

  const [form, setForm] = useState({
    clientName: "",
    clientRefrence: "",
    clientRequirement: "",
    clientContact: "",
    clientEmail: "",
    clientLocation: "",
    clientStartDate: "",
    clientEndDate: "",
    clientDiscussionDate: "",
    clientFollowup: "",
    reminderDate: "",
    reminderTime: "",
    reminderMessage: "",
  });

  // ✅ Load existing client
  useEffect(() => {
    if (client) {
      setForm({
        clientName: client.clientName || "",
        clientRefrence: client.clientRefrence || "",
        clientRequirement: client.clientRequirement || "",
        clientContact: client.clientContact || "",
        clientEmail: client.clientEmail || "",
        clientLocation: client.clientLocation || "",
        clientStartDate: client.clientStartDate || "",
        clientEndDate: client.clientEndDate || "",
        clientDiscussionDate: client.clientDiscussionDate || "",
        clientFollowup: client.clientFollowup || "",
        reminderDate: client.reminders?.[0]?.date || "",
        reminderTime: client.reminders?.[0]?.time || "",
        reminderMessage: client.reminders?.[0]?.message || "",
      });
    }
  }, [client]);

  const handleChange = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // ✅ Load saved reminders on mount
  useEffect(() => {
    const storedReminders = JSON.parse(localStorage.getItem("reminders") || "[]");
    storedReminders.forEach((rem) => {
      const now = new Date();
      const reminderTime = new Date(rem.timestamp);
      const delay = reminderTime - now;

      if (delay > 0) {
        setTimeout(() => triggerNotification(rem), delay);
      }
    });
  }, []);

  // ✅ Helper to trigger notification
  const triggerNotification = (data) => {
    addNotification({
      title: "🔔 Reminder Alert",
      subtitle: data.clientName || "Client Reminder",
      message: `${data.reminderMessage} — ${data.reminderDate} at ${data.reminderTime}`,
      theme: "darkblue",
      duration: 6000,
      native: true,
      vibrate: [200, 100, 200],
      icon: "/icon.png",
    });
  };

  // ✅ Schedule local OS notification
  const scheduleNotification = () => {
    if (!form.reminderDate || !form.reminderTime || !form.reminderMessage) return;

    try {
      const dateStr = form.reminderDate;
      const timeStr = form.reminderTime.trim();
      let reminderDateTime;

      // Detect AM/PM or 24-hour format
      if (timeStr.toLowerCase().includes("am") || timeStr.toLowerCase().includes("pm")) {
        const [time, modifier] = timeStr.split(" ");
        let [hours, minutes] = time.split(":").map(Number);
        if (modifier.toLowerCase() === "pm" && hours !== 12) hours += 12;
        if (modifier.toLowerCase() === "am" && hours === 12) hours = 0;
        reminderDateTime = new Date(`${dateStr}T${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:00`);
      } else {
        reminderDateTime = new Date(`${dateStr}T${timeStr}:00`);
      }

      const now = new Date();
      const delay = reminderDateTime - now;

      if (delay > 0) {
        // Store reminder for persistence
        const reminderData = {
          clientName: form.clientName,
          reminderDate: form.reminderDate,
          reminderTime: form.reminderTime,
          reminderMessage: form.reminderMessage,
          timestamp: reminderDateTime.toISOString(),
        };

        const existing = JSON.parse(localStorage.getItem("reminders") || "[]");
        existing.push(reminderData);
        localStorage.setItem("reminders", JSON.stringify(existing));

        console.log(`✅ Reminder set for ${reminderDateTime.toLocaleString()}`);
        setTimeout(() => triggerNotification(reminderData), delay);
      } else {
        
        triggerNotification({
          ...form,
          reminderDate: form.reminderDate,
          reminderTime: form.reminderTime,
          reminderMessage: form.reminderMessage,
        });
      }
    } catch (err) {
      console.error("❌ Failed to schedule notification:", err);
    }
  };

  // ✅ Save/Update client + show instant popup
  const handleSubmit = async () => {
    try {
      if (!token) {
        alert("Unauthorized: Please login again");
        return;
      }

      const headers = { Authorization: `Bearer ${token}` };

      if (client && client._id) {
        await axios.put(`${API_BASE}/clients/${client._id}`, form, { headers });
        addNotification({
          title: "✅ Client Updated",
          subtitle: form.clientName || "Client Details Updated",
         
          theme: "green",
          duration: 4000,
          native: true,
        });
      } else {
        await axios.post(`${API_BASE}/clients`, form, { headers });
        addNotification({
          title: "🆕 New Client Added",
          subtitle: form.clientName || "Client Created",
        
          theme: "darkblue",
          duration: 4000,
          native: true,
        });
      }

      scheduleNotification();
      refresh();
      onClose();
    } catch (err) {
      console.error("❌ Failed to save client:", err);
      alert(err.response?.status === 403 ? "Unauthorized" : "Failed to save client");
    }
  };

  const textFields = [
    { name: "clientName", label: "Client Name" },
    { name: "clientRefrence", label: "Reference" },
    { name: "clientRequirement", label: "Requirement" },
    { name: "clientContact", label: "Contact" },
    { name: "clientEmail", label: "Email Id" },
    { name: "clientLocation", label: "Location" },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-md w-[420px] max-h-[85vh] overflow-y-auto shadow-lg">
        <div className="flex justify-between items-center mb-3">
          <h2 className="font-semibold text-lg">
            {client ? "Edit Client" : "Add Client"}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-black">
            ✖
          </button>
        </div>

        <div className="flex flex-col gap-2">
          {textFields.map(({ name, label }) => (
            <div key={name} className="flex flex-col">
              <label className="text-sm text-gray-600">{label}</label>
              <input
                type="text"
                value={form[name] || ""}
                onChange={(e) => handleChange(name, e.target.value)}
                className="border p-2 rounded-md"
              />
            </div>
          ))}

          {[
            ["clientStartDate", "Start Date"],
            ["clientEndDate", "End Date"],
            ["clientDiscussionDate", "Last Discussion Date"],
            ["clientFollowup", "Follow-up Date"],
          ].map(([name, label]) => (
            <div key={name}>
              <label className="text-sm text-gray-600">{label}</label>
              <input
                type="date"
                value={form[name] || ""}
                onChange={(e) => handleChange(name, e.target.value)}
                className="border p-2 rounded-md w-full"
              />
            </div>
          ))}

          <h3 className="font-semibold mt-3 text-[#5B4FE8]">Reminder</h3>

          <label className="text-sm text-gray-600">Reminder Date</label>
          <input
            type="date"
            value={form.reminderDate || ""}
            onChange={(e) => handleChange("reminderDate", e.target.value)}
            className="border p-2 rounded-md"
          />

          <label className="text-sm text-gray-600">Reminder Time (24-hr or AM/PM)</label>
          <input
            type="text"
            placeholder="e.g. 14:30 or 02:30 PM"
            value={form.reminderTime || ""}
            onChange={(e) => handleChange("reminderTime", e.target.value)}
            className="border p-2 rounded-md"
          />

          <label className="text-sm text-gray-600">Reminder Message</label>
          <input
            type="text"
            value={form.reminderMessage || ""}
            onChange={(e) => handleChange("reminderMessage", e.target.value)}
            className="border p-2 rounded-md"
          />
        </div>

        <button
          onClick={handleSubmit}
          className="mt-4 w-full bg-[#5B4FE8] text-white py-2 rounded-md font-medium"
        >
          {client ? "Update Client" : "Save Client"}
        </button>
      </div>
    </div>
  );
}
