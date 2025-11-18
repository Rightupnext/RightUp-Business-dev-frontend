import React, { useEffect, useState, useContext, useCallback } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { AuthContext } from "../../context/AuthContext";
import Button from "../../components/Button";
import { TrashIcon, PlusIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { FaUpload } from "react-icons/fa6";

const API_BASE = import.meta.env.VITE_BASE;

// ✅ Format full date to IST
const formatToIST = (dateString) => {
  if (!dateString) return "-";
  const date = new Date(dateString);
  if (isNaN(date)) return dateString;
  return date.toLocaleDateString("en-IN", { timeZone: "Asia/Kolkata" });
};

// ✅ Format time-only string to IST
const formatToISTTime = (timeString) => {
  if (!timeString) return "-";
  const date = new Date(`1970-01-01T${timeString}Z`); // Treat as UTC
  if (isNaN(date)) return timeString;
  return date.toLocaleTimeString("en-IN", {
    timeZone: "Asia/Kolkata",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true
  });
};

function debounce(fn, wait) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), wait);
  };
}

export default function ProjTaskManagement() {
  const { token } = useContext(AuthContext);
  const [groups, setGroups] = useState([]);
  const [filterDate, setFilterDate] = useState("");
  const [loading, setLoading] = useState(false);
  const headers = { headers: { Authorization: `Bearer ${token}` } };

  useEffect(() => {
    fetchGroups();
    // eslint-disable-next-line
  }, [filterDate]);

  const fetchGroups = async () => {
    setLoading(true);
    try {
      const url = filterDate
        ? `${API_BASE}/tasks/groups?date=${filterDate}`
        : `${API_BASE}/tasks/groups`;
      const res = await axios.get(url, headers);
      setGroups(res.data || []);
    } catch {
      toast.error("Failed to fetch groups");
    } finally {
      setLoading(false);
    }
  };

  const createGroup = async () => {
    try {
      const payload = filterDate ? { date: filterDate } : {};
      const res = await axios.post(
        `${API_BASE}/tasks/groups`,
        payload,
        headers
      );
      setGroups((prev) => [res.data, ...prev]);
      toast.success("New group created!");
    } catch {
      toast.error("Failed to create group");
    }
  };

  const setTime = async (groupId, type) => {
    try {
      const res = await axios.put(
        `${API_BASE}/tasks/groups/${groupId}/time`,
        { type },
        headers
      );
      setGroups((prev) => prev.map((g) => (g._id === groupId ? res.data : g)));
      toast.success(`${type} recorded`);
    } catch (err) {
      toast.error(err.response?.data?.message || "Already recorded or failed");
    }
  };



const addTask = async (groupId) => {
  try {
    // 🕒 Get current IST time
    const now = new Date().toLocaleTimeString("en-IN", {
      timeZone: "Asia/Kolkata",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true, // ✅ shows AM/PM
    });

    const payload = { timing: now };

    const res = await axios.post(
      `${API_BASE}/tasks/groups/${groupId}/tasks`,
      payload,
      headers
    );

    setGroups((prev) =>
      prev.map((g) => (g._id === groupId ? res.data : g))
    );
    toast.success("Task added");
  } catch {
    toast.error("Failed to add task");
  }
};



  const deleteGroup = async (groupId) => {
    if (!confirm("Delete this group?")) return;
    try {
      await axios.delete(`${API_BASE}/tasks/groups/${groupId}`, headers);
      setGroups((prev) => prev.filter((g) => g._id !== groupId));
      toast.success("Group deleted");
    } catch {
      toast.error("Failed to delete");
    }
  };

  const deleteTask = async (groupId, taskId) => {
    if (!confirm("Delete this task?")) return;
    try {
      const res = await axios.delete(
        `${API_BASE}/tasks/groups/${groupId}/tasks/${taskId}`,
        headers
      );
      setGroups((prev) => prev.map((g) => (g._id === groupId ? res.data : g)));
      toast.success("Task deleted");
    } catch {
      toast.error("Failed to delete task");
    }
  };

  const saveTaskServer = async (groupId, taskId, patch) => {
    try {
      const res = await axios.patch(
        `${API_BASE}/tasks/groups/${groupId}/tasks/${taskId}`,
        patch,
        headers
      );
      setGroups((prev) => prev.map((g) => (g._id === groupId ? res.data : g)));
    } catch {
      toast.error("Auto-save failed");
    }
  };

  const debouncedSave = useCallback(debounce(saveTaskServer, 600), []);

  const updateTaskLocal = (groupId, taskId, patch, persist = true) => {
    setGroups((prev) =>
      prev.map((g) =>
        g._id === groupId
          ? {
              ...g,
              tasks: g.tasks.map((t) =>
                t._id === taskId ? { ...t, ...patch } : t
              ),
            }
          : g
      )
    );
    if (persist) debouncedSave(groupId, taskId, patch);
  };

  return (
    <div className="p-4 lg:p-6 mt-20">
      <div className="flex flex-col sm:flex-row cursor-pointer sm:items-center sm:justify-between mb-6 gap-4">
        <div className="w-full sm:w-auto bg-sky-600 cursor-pointer">
          <Button text="New Group" onClick={createGroup} />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <label className="text-sm text-gray-600 whitespace-nowrap cursor-pointer">
            Filter by date
          </label>
          <input
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="border rounded px-2 py-1"
          />
          <button
            className="bg-gray-200 px-3 py-1 rounded hover:bg-gray-300 transition"
            onClick={() => {
              setFilterDate("");
              fetchGroups();
            }}
          >
            Clear
          </button>
        </div>
      </div>

      {loading && (
        <div className="flex justify-center py-8">
          <div className="w-10 h-10 border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
        </div>
      )}

      {groups.map((group) => (
        <div
          key={group._id}
          className="bg-white border rounded-lg p-4 shadow-sm mb-6"
        >
          <div className="flex flex-wrap justify-between gap-2">
            <div className="text-sm">Date: {formatToIST(group.date)}</div>

            <div className="flex flex-wrap gap-2 cursor-pointer">
              {[
                "timeIn",
                "MGBreakIn",
                "MGBreakOut",
                "LunchbreakIn",
                "LunchbreakOut",
                "EveBreakIn",
                "EveBreakOut",
                "timeOut",
              ].map((type) => (
                <button
                  key={type}
                  disabled={!!group[type]}
                  onClick={() => setTime(group._id, type)}
                  className={`px-3 py-1 text-sm cursor-pointer rounded text-white ${
                    group[type]
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-sky-600 hover:bg-blue-700"
                  }`}
                >
                  {type.replace(/([A-Z])/g, " $1")}
                </button>
              ))}
              <button
                onClick={() => deleteGroup(group._id)}
                className="text-red-600"
              >
                <TrashIcon className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 mt-3 cursor-pointer">
            {[
              "timeIn",
              "MGBreakIn",
              "MGBreakOut",
              "LunchbreakIn",
              "LunchbreakOut",
              "EveBreakIn",
              "EveBreakOut",
              "timeOut",
            ].map((key) => (
              <div key={key} className="px-3 py-1 bg-gray-100 rounded text-sm">
                <div className="text-xs text-gray-500">
                  {key.replace(/([A-Z])/g, " $1")}
                </div>
                <div className="font-medium">{formatToISTTime(group[key])}</div>
              </div>
            ))}
          </div>

          <div className="mt-4">
            <button
              onClick={() => addTask(group._id)}
              className="bg-sky-600 text-white px-3 py-1 cursor-pointer rounded text-sm flex items-center gap-2"
            >
              <PlusIcon className="w-4 h-4" /> Task
            </button>
          </div>

          <div className="mt-4 overflow-x-auto cursor-pointer">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 cursor-pointer">
                <tr>
                  <th className="p-2 text-left">Project</th>
                  <th className="p-2 text-left">Task</th>
                  <th className="p-2 text-left">Timing</th>
                  <th className="p-2 text-left">End Timing</th>
                  <th className="p-2 text-left">Issue</th>
                  <th className="p-2 text-left">Status</th>
                  <th className="p-2 text-left">Img upload</th>
                  <th className="p-2 text-left">Action</th>
                </tr>
              </thead>
              <tbody>
                {group.tasks?.length ? (
                  group.tasks.map((task) => (
                    <TaskRow
                      key={task._id}
                      groupId={group._id}
                      task={task}
                      token={token}
                      onLocalChange={(patch, persist = true) =>
                        updateTaskLocal(group._id, task._id, patch, persist)
                      }
                      onDelete={() => deleteTask(group._id, task._id)}
                    />
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="text-center text-gray-400 p-4">
                      No tasks yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
}

// ✅ TaskRow Component
function TaskRow({ groupId, task, onLocalChange, onDelete, token }) {
  const [showModal, setShowModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const headers = { headers: { Authorization: `Bearer ${token}` } };

  const uploadImage = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("image", file);
      const res = await axios.post(
        `${API_BASE}/tasks/groups/${groupId}/tasks/${task._id}/images`,
        formData,
        headers
      );
      toast.success("Image uploaded");
      onLocalChange(
        {
          images: res.data.tasks.find((t) => t._id === task._id).images,
        },
        false
      );
    } catch {
      toast.error("Upload failed");
    } finally {
      setUploading(false);
    }
  };

   // ✅ FIX → Moving saveEndTiming INSIDE TaskRow
  const saveEndTiming = async () => {
    try {
      const now = new Date().toLocaleTimeString("en-IN", {
        timeZone: "Asia/Kolkata",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      });

      const res = await axios.patch(
        `${API_BASE}/tasks/groups/${groupId}/tasks/${task._id}`,
        { endTiming: now },
        headers
      );

      toast.success("End timing saved");

      // Update UI locally
      onLocalChange({ endTiming: now }, false);
    } catch (err) {
      toast.error("Failed to save end time");
    }
  };
  const deleteImage = async (imageUrl) => {
    if (!confirm("Delete this image?")) return;
    try {
      const res = await axios.delete(
        `${API_BASE}/tasks/groups/${groupId}/tasks/${task._id}/images`,
        { ...headers, data: { imageUrl } }
      );
      toast.success("Image deleted");
      onLocalChange(
        {
          images: res.data.tasks.find((t) => t._id === task._id).images,
        },
        false
      );
    } catch {
      toast.error("Delete failed");
    }
  };

  return (
    <>
 <tr className="border-b">
  <td className="p-2">
    <textarea
      value={task.projname || ""}
      onChange={(e) => onLocalChange({ projname: e.target.value })}
      className="border rounded px-2 py-1 w-full h-20 resize-none"
    />
  </td>

  <td className="p-2">
    <textarea
      value={task.name || ""}
      onChange={(e) => onLocalChange({ name: e.target.value })}
      className="border rounded px-2 py-1 w-full h-20 resize-none"
    />
  </td>

  <td className="p-2">
    <textarea
      value={
        task.timing
          ? new Date(`1970-01-01T${task.timing}Z`).toLocaleTimeString("en-IN", {
              timeZone: "Asia/Kolkata",
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
              hour12: true,
            })
          : ""
      }
      readOnly
      className="border rounded px-2 py-1 w-full h-20 bg-gray-100 cursor-not-allowed resize-none"
    />
  </td>
<td className="p-2">
  <button
    disabled={!!task.endTiming}
    onClick={saveEndTiming}
    className={`px-3 py-1 text-sm rounded text-white ${
      task.endTiming
        ? "bg-gray-400 cursor-not-allowed"
        : "bg-sky-600 hover:bg-sky-700"
    }`}
  >
    {task.endTiming ? task.endTiming : "End Timing"}
  </button>
</td>


  <td className="p-2">
    <textarea
      value={task.issue || ""}
      onChange={(e) => onLocalChange({ issue: e.target.value })}
      className="border rounded px-2 py-1 w-full h-20 resize-none"
    />
  </td>

  <td className="p-2 flex items-center gap-2">
    <textarea
      value={task.status || ""}
      onChange={(e) => onLocalChange({ status: e.target.value })}
      className="border rounded px-2 py-1 w-full h-20 resize-none"
    />
  </td>

  <td>
    <label className="cursor-pointer">
      <FaUpload className="w-5 h-5 text-sky-600" />
      <input
        type="file"
        className="hidden"
        accept="image/*"
        onChange={uploadImage}
        disabled={uploading}
      />
    </label>
  </td>
        <td className="p-2 text-red-600">
          <button onClick={onDelete}>
            <TrashIcon className="w-5 h-5" />
          </button>
        </td>
      </tr>

      {task.images?.length > 0 && (
        <tr>
          <td colSpan={7}>
            <div className="flex gap-2 flex-wrap mt-2">
              {task.images.map((img, idx) => (
                <img
                  key={idx}
                  src={img}
                  onClick={() => setShowModal(img)}
                  className="w-12 h-12 rounded cursor-pointer hover:opacity-75 border"
                />
              ))}
            </div>
          </td>
        </tr>
      )}

      {showModal && (
        <div
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50"
          onClick={() => setShowModal(false)}
        >
          <div
            className="relative bg-white p-4 rounded-lg shadow-lg max-w-lg w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-2 right-2 text-gray-600 hover:text-black"
            >
              <XMarkIcon className="w-6 h-6 cursor-pointer" />
            </button>

            <img
              src={showModal}
              alt="Preview"
              className="w-full cursor-pointer h-auto rounded hover:scale-105 transition-transform"
            />

            <div className="flex justify-end mt-3">
              <button
                onClick={() => deleteImage(showModal)}
                className="bg-red-600 text-white px-4 py-1 rounded"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
