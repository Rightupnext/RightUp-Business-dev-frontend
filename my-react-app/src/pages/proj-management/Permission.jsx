import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { AuthContext } from "../../context/AuthContext";
import { TrashIcon } from "@heroicons/react/24/outline";

const API_BASE = import.meta.env.VITE_BASE;

export default function Permission() {
  const { token } = useContext(AuthContext);
  const headers = { headers: { Authorization: `Bearer ${token}` } };

  const [date, setDate] = useState("");
  const [permissions, setPermissions] = useState([]);

  useEffect(() => {
    fetchPermissions();
  }, []);

  const fetchPermissions = async () => {
    const res = await axios.get(`${API_BASE}/permissions`, headers);
    setPermissions(res.data);
  };

  const addPermission = async () => {
    if (!date) return toast.error("Select date");

    const res = await axios.post(`${API_BASE}/permissions`, { date }, headers);

    setPermissions((prev) => [res.data, ...prev]);
  };

  // 🔹 Local update (typing friendly)
  const updateLocal = (id, field, value) => {
    setPermissions((prev) =>
      prev.map((p) => (p._id === id ? { ...p, [field]: value } : p)),
    );
  };

  // 🔹 Save to backend on blur
  const saveField = async (id, field, value) => {
    await axios.put(
      `${API_BASE}/permissions/${id}`,
      { [field]: value },
      headers,
    );
  };

  const deletePermission = async (id) => {
    await axios.delete(`${API_BASE}/permissions/${id}`, headers);
    setPermissions((prev) => prev.filter((p) => p._id !== id));
    toast.success("Deleted");
  };

  return (
    <div className="p-6 mt-16">
       <h2 className="text-2xl font-semibold mb-4">Permission</h2>
    <div className="p-2 space-y-4 mt-7">
      {/* ADD BAR */}
      <div className="flex gap-3 flex-wrap">
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="border rounded px-3 py-2"
        />
        <button
          onClick={addPermission}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Add
        </button>
      </div>

      {/* ROWS */}
      {permissions.map((p) => (
        <div
          key={p._id}
          className="border rounded p-4 flex flex-wrap gap-4 items-center"
        >
          {/* DATE */}
          <div className="font-semibold w-32">{p.date}</div>

          {/* PERMISSION IN */}
          <div className="flex flex-col">
            <span className="text-sm text-gray-600 mb-1">Permission In</span>
            <input
              type="time"
              value={p.permissionIn || ""}
              onChange={(e) =>
                updateLocal(p._id, "permissionIn", e.target.value)
              }
              onBlur={(e) => saveField(p._id, "permissionIn", e.target.value)}
              className="border rounded px-3 py-2"
            />


          </div>

          {/* PERMISSION OUT */}
          <div className="flex flex-col">
            <span className="text-sm text-gray-600 mb-1">Permission Out</span>
            <input
              type="time"
              value={p.permissionOut || ""}
              onChange={(e) =>
                updateLocal(p._id, "permissionOut", e.target.value)
              }
              onBlur={(e) => saveField(p._id, "permissionOut", e.target.value)}
              className="border rounded px-3 py-2"
            />
          </div>

          {/* REASON */}
          <div className="flex flex-col">
            <span className="text-sm text-gray-600 mb-1">Reason</span>
            <input
              type="text"
              value={p.reason || ""}
              onChange={(e) => updateLocal(p._id, "reason", e.target.value)}
              onBlur={(e) => saveField(p._id, "reason", e.target.value)}
              className="border rounded px-3 py-2 flex-1 min-w-[200px]"
            />
          </div>
          {/* DELETE */}
          <button onClick={() => deletePermission(p._id)}>
            <TrashIcon className="w-5 h-5 text-red-600" />
          </button>
        </div>
      ))}
    </div>
    </div>
  );
}
