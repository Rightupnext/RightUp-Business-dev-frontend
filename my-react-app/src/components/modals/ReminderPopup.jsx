import React from "react";
import { Phone, Trash2, X } from "lucide-react";
import axios from "axios";
import toast from "react-hot-toast";

const API_BASE = import.meta.env.VITE_BASE;

export default function ReminderPopup({ reminders = [], onDeleteSuccess, show, onClose }) {
  if (!show) return null;

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_BASE}/clients/reminders/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      toast.success("Reminder deleted successfully");  // ⭐ SHOW SUCCESS TOAST

      onDeleteSuccess(id); // update UI
    } catch (err) {
      console.error("Delete error:", err);
      toast.error("Failed to delete");
    }
  };

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className="absolute right-0 top-10 bg-white w-80 rounded-xl shadow-2xl 
                 border p-3 z-50 max-h-96 overflow-y-auto"
    >
      <button
        onClick={onClose}
        className="absolute top-2 right-2 text-gray-500 hover:text-black"
      >
        <X className="w-4 h-4 cursor-pointer" />
      </button>

      {reminders.length === 0 ? (
        <p className="text-gray-500 text-center py-4">No reminders</p>
      ) : (
        reminders.map((rem) => (
          <div
            key={rem._id}
            className="bg-white border p-3 rounded-lg mb-3 shadow-sm flex justify-between items-start"
          >
            <div>
              <p className="font-semibold text-sm text-black">{rem.clientName}</p>
              <p className="text-xs text-gray-600">{rem.clientContact}</p>

              <p className="text-xs text-gray-800 mt-1">
                <span className="font-semibold">Date:</span> {rem.date}
              </p>
              <p className="text-xs text-gray-800">
                <span className="font-semibold">Time:</span> {rem.time}
              </p>

              <p className="text-xs mt-1 text-gray-700">{rem.message}</p>
            </div>

            <div className="flex flex-col gap-3 ml-3">
              <a href={`tel:${rem.clientContact}`}>
                <Phone className="w-4 h-4 text-green-600 cursor-pointer" />
              </a>

              <Trash2
                className="w-4 h-4 text-red-500 cursor-pointer"
                onClick={() => handleDelete(rem._id)}
              />
            </div>
          </div>
        ))
      )}
    </div>
  );
}
