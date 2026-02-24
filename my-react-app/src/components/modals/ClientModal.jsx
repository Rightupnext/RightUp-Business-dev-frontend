import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import addNotification from "react-push-notification";
import { AuthContext } from "../../context/AuthContext";

const API_BASE = import.meta.env.VITE_BASE;

export default function ClientModal({ onClose, refresh, client }) {
  const { token } = useContext(AuthContext);
  const [uploads, setUploads] = useState([]);

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
      // Load existing attachments
      if (client.attachments) {
        setUploads(client.attachments.map(att => ({
          ...att,
          id: att._id || crypto.randomUUID(),
          isExisting: true
        })));
      }
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

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);

    const newFiles = files.map((file) => ({
      file,
      id: crypto.randomUUID(),
      type: file.type,
      name: file.name,
      size: file.size,
      preview: file.type.startsWith("image/")
        ? URL.createObjectURL(file)
        : null,
    }));

    setUploads((prev) => [...prev, ...newFiles]);
  };


  const removeUpload = (id) => {
    setUploads((prev) => prev.filter((f) => f.id !== id));
  };


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

      const formData = new FormData();

      // Append form fields
      Object.keys(form).forEach(key => {
        formData.append(key, form[key]);
      });

      // Separate existing and new uploads
      const existingAttachments = uploads.filter(f => f.isExisting);
      const newFiles = uploads.filter(f => !f.isExisting);

      formData.append("existingAttachments", JSON.stringify(existingAttachments));

      newFiles.forEach(f => {
        formData.append("files", f.file);
      });

      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data"
        }
      };

      if (client && client._id) {
        await axios.put(`${API_BASE}/clients/${client._id}`, formData, config);
        addNotification({
          title: "✅ Client Updated",
          subtitle: form.clientName || "Client Details Updated",
          theme: "green",
          duration: 4000,
          native: true,
        });
      } else {
        await axios.post(`${API_BASE}/clients`, formData, config);
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
    { name: "clientName", label: "Client Name *" },
    { name: "clientRefrence", label: "Reference " },
    { name: "clientRequirement", label: "Requirement" },
    { name: "clientContact", label: "Contact *" },
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
          {/* 📎 Attachments */}
          <div className="mt-3">
            <label className="text-sm text-gray-600 flex items-center gap-2">
              Attachments
              <label className="cursor-pointer text-[#5B4FE8]">
                📤
                <input
                  type="file"
                  multiple
                  accept=".pdf,.doc,.docx,image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </label>

            {uploads.length > 0 && (
              <div className="mt-3 space-y-2">
                {uploads.map((file) => (
                  <div
                    key={file.id}
                    className="flex items-center justify-between border rounded-md p-2 bg-gray-50"
                  >
                    <div className="flex items-center gap-3">
                      {/* File Icon */}
                      <span className="text-2xl">
                        {file.type?.includes("pdf") || file.mimetype?.includes("pdf") ? "📄" :
                          file.type?.includes("word") || file.mimetype?.includes("word") ? "📝" :
                            (file.type?.startsWith("image/") || file.mimetype?.startsWith("image/")) ? "🖼️" : "📎"}
                      </span>

                      <div>
                        <p className="text-sm font-medium truncate max-w-[220px]">
                          {file.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {file.size ? `${(file.size / 1024).toFixed(1)} KB` : "Stored"}
                        </p>
                      </div>
                    </div>

                    {/* Delete */}
                    <button
                      onClick={() => removeUpload(file.id)}
                      className="text-red-500 hover:text-red-700 text-sm"
                    >
                      ✖
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>


          <h3 className="font-semibold mt-3 text-[#5B4FE8]">Reminder </h3>

          <label className="text-sm text-gray-600">Reminder Date *</label>
          <input
            type="date"
            value={form.reminderDate || ""}
            onChange={(e) => handleChange("reminderDate", e.target.value)}
            className="border p-2 rounded-md"
          />

          <label className="text-sm text-gray-600">Reminder Time *(24-hr or AM/PM)</label>
          <input
            type="text"
            placeholder="e.g. 14:30 or 02:30 PM"
            value={form.reminderTime || ""}
            onChange={(e) => handleChange("reminderTime", e.target.value)}
            className="border p-2 rounded-md"
          />

          <label className="text-sm text-gray-600">Reminder Message *</label>
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
