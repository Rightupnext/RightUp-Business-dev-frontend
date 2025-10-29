import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../../context/AuthContext";
const API_BASE = import.meta.env.VITE_BASE; 


export default function ClientModal({ onClose, refresh, client }) {
  const { token } = useContext(AuthContext);
  const [form, setForm] = useState({
    clientName: "",
    clientRequirement: "",
    clientStartDate: "",
    clientEndDate: "",
    clientContact: "",
    clientEmail: "",
    clientLocation: "",
    clientProjectValue: "",
    reminderDate: "",
    reminderTime: "",
    reminderMessage: ""
  });

  useEffect(() => {
    if (client) {
      setForm({
        ...client,
        reminderDate: client.reminders?.[0]?.date || "",
        reminderTime: client.reminders?.[0]?.time || "",
        reminderMessage: client.reminders?.[0]?.message || ""
      });
    }
  }, [client]);

  const handleSubmit = async () => {
    try {
      if (!token) {
        alert("Unauthorized: Please login again");
        return;
      }

      const headers = { Authorization: `Bearer ${token}` };
      if (client && client._id) {
        await axios.put(`${API_BASE}/clients/${client._id}`, form, { headers });
      } else {
        await axios.post(`${API_BASE}/clients`, form, { headers });
      }

      refresh();
      onClose();
    } catch (err) {
      console.error("Failed to save client:", err);
      alert(err.response?.status === 403 ? "Unauthorized" : "Failed to save client");
    }
  };

  const textFields = [
    { name: "clientName", label: "Client Name" },
    { name: "clientRequirement", label: "Requirement" },
    { name: "clientContact", label: "Contact" },
    { name: "clientEmail", label: "Email Id" },
    { name: "clientLocation", label: "Location" },
    { name: "clientProjectValue", label: "Project Value" }
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-md w-[420px]">
        <div className="flex justify-between mb-3">
          <h2 className="font-semibold">{client ? "Edit Client" : "Add Client"}</h2>
          <button onClick={onClose}>❌</button>
        </div>

        <div className="flex flex-col gap-2">
          {textFields.map(({ name, label }) => (
            <input
              key={name}
              type="text"
              placeholder={label}
              value={form[name] || ""}
              onChange={(e) => setForm({ ...form, [name]: e.target.value })}
              className="border p-2 rounded-md"
            />
          ))}

          <label>Start Date</label>
          <input
            type="date"
            value={form.clientStartDate || ""}
            onChange={(e) => setForm({ ...form, clientStartDate: e.target.value })}
            className="border p-2 rounded-md"
          />

          <label>End Date</label>
          <input
            type="date"
            value={form.clientEndDate || ""}
            onChange={(e) => setForm({ ...form, clientEndDate: e.target.value })}
            className="border p-2 rounded-md"
          />

          <h3 className="font-semibold mt-2">Reminders</h3>
          <input
            type="date"
            value={form.reminderDate || ""}
            onChange={(e) => setForm({ ...form, reminderDate: e.target.value })}
            className="border p-2 rounded-md"
            placeholder="Reminder Date"
          />
          <input
            type="time"
            value={form.reminderTime || ""}
            onChange={(e) => setForm({ ...form, reminderTime: e.target.value })}
            className="border p-2 rounded-md"
            placeholder="Reminder Time"
          />
          <input
            type="text"
            value={form.reminderMessage || ""}
            onChange={(e) => setForm({ ...form, reminderMessage: e.target.value })}
            className="border p-2 rounded-md"
            placeholder="Reminder Message"
          />
        </div>

        <button
          onClick={handleSubmit}
          className="mt-4 w-full bg-[#5B4FE8] text-white py-2 rounded-md"
        >
          {client ? "Update" : "Save"}
        </button>
      </div>
    </div>
  );
}
