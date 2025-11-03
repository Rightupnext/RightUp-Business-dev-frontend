import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
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
    clientProjectValue: "",
    clientStartDate: "",
    clientEndDate: "",
    clientDiscussionDate: "",
    clientFollowup: "",
    reminderDate: "",
    reminderTime: "",
    reminderMessage: "",
  });

  useEffect(() => {
    if (client) {
      setForm({
        clientName: client.clientName || "",
         clientName: client.clientRefrence || "",
        clientRequirement: client.clientRequirement || "",
        clientContact: client.clientContact || "",
        clientEmail: client.clientEmail || "",
        clientLocation: client.clientLocation || "",
        clientProjectValue: client.clientProjectValue || "",
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
      alert(
        err.response?.status === 403 ? "Unauthorized" : "Failed to save client"
      );
    }
  };

  const textFields = [
    { name: "clientName", label: "Client Name" },
     { name: "clientRefrence", label: "Reference" },
    { name: "clientRequirement", label: "Requirement" },
    { name: "clientContact", label: "Contact" },
    { name: "clientEmail", label: "Email Id" },
    { name: "clientLocation", label: "Location" },
    { name: "clientProjectValue", label: "Project Value" },
    { name: "clientDiscussionDate", label: "Last Discussion Date" },
    { name: "clientFollowup", label: "Followup Date" },
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

          <label className="text-sm text-gray-600">Start Date</label>
          <input
            type="date"
            value={form.clientStartDate || ""}
            onChange={(e) => handleChange("clientStartDate", e.target.value)}
            className="border p-2 rounded-md"
          />

         

          <h3 className="font-semibold mt-3 text-[#5B4FE8]">Reminder</h3>
          <label className="text-sm text-gray-600">Reminder Date</label>
          <input
            type="date"
            value={form.reminderDate || ""}
            onChange={(e) => handleChange("reminderDate", e.target.value)}
            className="border p-2 rounded-md"
          />

          <label className="text-sm text-gray-600">Reminder Time (AM/PM)</label>
          <input
            type="text"
            placeholder="e.g. 02:30 PM"
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
