import React, { useState, useEffect } from "react";
import axios from "axios";

export default function ClientModal({ onClose, refresh, client }) {
  const [form, setForm] = useState({
    clientName: "",
    clientRequirement: "",
    clientStartDate: "",
    clientEndDate: "",
    clientContact: "",
    clientEmail: "",
    clientLocation: "",
    clientProjectValue: "",
  });

  // Fill form when editing
  useEffect(() => {
    if (client) setForm(client);
  }, [client]);

  const handleSubmit = async () => {
    try {
      if (client && client._id) {
        // Update
        await axios.put(`http://localhost:5000/api/clients/${client._id}`, form);
      } else {
        // Create
        await axios.post("http://localhost:5000/api/clients", form);
      }
      refresh();
      onClose();
    } catch (err) {
      console.error("Failed to save client:", err);
      alert("Failed to save client");
    }
  };

  const textFields = [
    { name: "clientName", label: "Client Name" },
    { name: "clientRequirement", label: "Requirement" },
    { name: "clientContact", label: "Contact" },
    { name: "clientEmail", label: "Email Id" },
    { name: "clientLocation", label: "Location" },
    { name: "clientProjectValue", label: "Project Value" },
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
