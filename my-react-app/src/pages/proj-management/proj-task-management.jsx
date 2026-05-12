import React, { useEffect, useState, useContext, useCallback } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { AuthContext } from "../../context/AuthContext";
import { ReminderContext } from "../../context/ReminderContext";
import Button from "../../components/Button";
import { TrashIcon, PlusIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { FaUpload } from "react-icons/fa6";
import {
  calculateLiveWorkingHours,
  formatToISTTime,
  formatToISTDate as formatToIST,
} from "../../utils/timeUtils";

const API_BASE = import.meta.env.VITE_BASE;

function debounce(fn, wait) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), wait);
  };
}

// Shared utils imported from timeUtils
export default function ProjTaskManagement() {
  const { token, user } = useContext(AuthContext);
  const { fetchTodayGroup } = useContext(ReminderContext); // ✅ Add this
  const [groups, setGroups] = useState([]);
  const [filterDate, setFilterDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [liveTime, setLiveTime] = useState(Date.now()); // For live timer updates
  const headers = { headers: { Authorization: `Bearer ${token}` } };
  const [projects, setProjects] = useState([]);

  const fetchProjects = async () => {
    try {
      const res = await axios.get(`${API_BASE}/projects/user/${user?._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProjects(res.data);
    } catch (err) {
      console.error("Error fetching projects:", err);
      toast.error("Failed to load projects");
    }
  };

  // fetch projects when user changes
  useEffect(() => {
    if (user?._id) fetchProjects();
  }, [user?._id]);

  // fetch groups when filterDate changes
  useEffect(() => {
    fetchGroups();
  }, [filterDate]);
  console.log("projects", projects);
  // Live timer - updates every second for active groups
  useEffect(() => {
    const timer = setInterval(() => {
      // Only update if there's at least one active group (timeIn but no timeOut)
      const hasActiveGroup = groups.some((g) => g.timeIn && !g.timeOut);
      if (hasActiveGroup) {
        setLiveTime(Date.now());
      }
    }, 1000); // Update every second

    return () => clearInterval(timer);
  }, [groups]);

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
        headers,
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
        headers,
      );
      setGroups((prev) => prev.map((g) => (g._id === groupId ? res.data : g)));
      toast.success(`${type} recorded`);
      fetchTodayGroup(); // ✅ Refresh Navbar's todayGroup immediately
    } catch (err) {
      toast.error(err.response?.data?.message || "Already recorded or failed");
    }
  };

const addTask = async (groupId) => {
  try {
    // Find current group
    const currentGroup = groups.find((g) => g._id === groupId);

    // Check active task
    const activeTask = currentGroup?.tasks?.find(
      (t) => !t.endTiming
    );

    // Prevent creating another task
    if (activeTask) {
      toast.custom((t) => (
        <div
          className={`${
            t.visible ? "animate-enter" : "animate-leave"
          } max-w-md w-full bg-white shadow-2xl rounded-2xl pointer-events-auto flex overflow-hidden border border-orange-100`}
        >
          {/* Left Content */}
          <div className="flex-1 p-4">
            <div className="flex items-start gap-3">
              {/* Icon */}
              <div className="flex-shrink-0 w-11 h-11 rounded-full bg-orange-100 flex items-center justify-center">
                <span className="text-xl">⏱️</span>
              </div>

              {/* Message */}
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-900">
                  Active Task Running
                </p>

                <p className="mt-1 text-sm text-gray-500 leading-relaxed">
                  Please end your current task before creating a new one.
                </p>

                <div
                  className="mt-3 inline-flex items-center gap-2
                  bg-orange-50 text-orange-700 px-3 py-1
                  rounded-full text-xs font-medium"
                >
                  End previous task first
                </div>
              </div>
            </div>
          </div>

          {/* Close */}
          <div className="flex border-l border-gray-100">
            <button
              onClick={() => toast.dismiss(t.id)}
              className="px-4 text-sm font-medium text-orange-600 hover:bg-orange-50 transition"
            >
              Close
            </button>
          </div>
        </div>
      ));

      return;
    }

    // Current Time
    const now = new Date().toISOString();

    // Create Task Payload
    const payload = {
      timing: now,
      endTiming: null,
      projname: "",
      projectId: null,
      name: "",
      issue: "",
      status: "",
    };

    // Create Task API
    const res = await axios.post(
      `${API_BASE}/tasks/groups/${groupId}/tasks`,
      payload,
      headers
    );

    // Update State
    setGroups((prev) =>
      prev.map((g) =>
        g._id === groupId ? res.data : g
      )
    );

    // Success Toast
    toast.success("New task created");
  } catch (err) {
    console.error(err);

    toast.error("Failed to create task");
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
        headers,
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
        headers,
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
                t._id === taskId
                  ? {
                      ...t,
                      ...patch,
                      projectId: patch.projectId ?? t.projectId,
                      projname: patch.projname ?? t.projname,
                    }
                  : t,
              ),
            }
          : g,
      ),
    );

    if (persist) debouncedSave(groupId, taskId, patch);
  };

  return (
    <div className="p-4 lg:p-2 mt-20">
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
          className="bg-white border rounded-lg p-2 shadow-sm mb-6"
        >
          <div className="flex flex-wrap justify-between items-center gap-2">
            <div className="text-sm font-medium">
              Date: {formatToIST(group.date)}
            </div>

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
              ].map((type) => {
                // Disable break buttons if timeout is clicked
                const isBreakButton = type.includes("Break");
                const isDisabled =
                  !!group[type] || (isBreakButton && !!group.timeOut);

                return (
                  <button
                    key={type}
                    disabled={isDisabled}
                    onClick={() => setTime(group._id, type)}
                    className={`px-3 py-1 text-sm cursor-pointer rounded text-white ${
                      isDisabled
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-sky-600 hover:bg-blue-700"
                    }`}
                  >
                    {type.replace(/([A-Z])/g, " $1")}
                  </button>
                );
              })}
              <button
                onClick={() => deleteGroup(group._id)}
                className="text-red-600"
              >
                <TrashIcon className="w-5 h-5" />
              </button>

              {/* Working Hours Display - Live updating */}
              <div
                className={`px-4 py-1 text-sm rounded-lg font-semibold ${
                  group.timeIn && !group.timeOut
                    ? "bg-green-100 text-green-800 border border-green-300 animate-pulse"
                    : group.timeIn
                      ? "bg-green-100 text-green-800 border border-green-300"
                      : "bg-gray-100 text-gray-500 border border-gray-300"
                }`}
              >
                {group.timeIn
                  ? `⏱️ ${calculateLiveWorkingHours(group)}`
                  : "⏱️ 0h 0m"}
              </div>
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

          {/* Break Durations Display */}
          <div className="flex flex-wrap gap-3 mt-3">
            {group.mgBreakDuration && group.mgBreakDuration !== "0h 0m" && (
              <div className="px-3 py-1 bg-blue-50 border border-blue-200 rounded text-sm">
                <span className="text-xs text-blue-600 font-medium">
                  MG Break:{" "}
                </span>
                <span className="font-semibold text-blue-800">
                  {group.mgBreakDuration}
                </span>
              </div>
            )}
            {group.lunchBreakDuration &&
              group.lunchBreakDuration !== "0h 0m" && (
                <div className="px-3 py-1 bg-orange-50 border border-orange-200 rounded text-sm">
                  <span className="text-xs text-orange-600 font-medium">
                    Lunch Break:{" "}
                  </span>
                  <span className="font-semibold text-orange-800">
                    {group.lunchBreakDuration}
                  </span>
                </div>
              )}
            {group.eveBreakDuration && group.eveBreakDuration !== "0h 0m" && (
              <div className="px-3 py-1 bg-purple-50 border border-purple-200 rounded text-sm">
                <span className="text-xs text-purple-600 font-medium">
                  Evening Break:{" "}
                </span>
                <span className="font-semibold text-purple-800">
                  {group.eveBreakDuration}
                </span>
              </div>
            )}
          </div>

          <div className="mt-4">
            <button
              onClick={() => addTask(group._id)}
              className="bg-sky-600 text-white px-3 py-1 cursor-pointer rounded text-sm flex items-center gap-2"
            >
              <PlusIcon className="w-4 h-4" /> Task
            </button>
          </div>

          <div className="mt-4 overflow-x-auto cursor-pointer border rounded-lg">
            <table className="min-w-[1000px] w-full text-sm border-collapse">
              <thead className="bg-gray-50 sticky top-0 z-10 border-b">
                <tr>
                  <th className="p-3 text-left font-semibold text-gray-600 w-[20%]">
                    Project
                  </th>
                  <th className="p-3 text-left font-semibold text-gray-600 w-[25%]">
                    Task
                  </th>
                  <th className="p-3 text-left font-semibold text-gray-600 w-[10%]">
                    Timing
                  </th>
                  <th className="p-3 text-left font-semibold text-gray-600 w-[6%]">
                    End Timing
                  </th>
                  <th className="p-3 text-left font-semibold text-gray-600 w-[15%]">
                    Issue
                  </th>
                  <th className="p-3 text-left font-semibold text-gray-600 w-[10%]">
                    Status
                  </th>
                  <th className="p-3 text-center font-semibold text-gray-600 w-[3%]">
                    Upload
                  </th>
                  <th className="p-3 text-center font-semibold text-gray-600 w-[3%]">
                    Action
                  </th>
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
                      projects={projects}
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
function TaskRow({ groupId, task, onLocalChange, onDelete, token, projects }) {
  const [showModal, setShowModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const headers = { headers: { Authorization: `Bearer ${token}` } };
  const [showProjects, setShowProjects] = useState(false);
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
        headers,
      );
      toast.success("Image uploaded");
      onLocalChange(
        {
          images: res.data.tasks.find((t) => t._id === task._id).images,
        },
        false,
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
      const now = new Date().toISOString();

      const res = await axios.patch(
        `${API_BASE}/tasks/groups/${groupId}/tasks/${task._id}`,
        { endTiming: now },
        headers,
      );

      toast.success("End timing saved");

      // Update UI locally
      onLocalChange({ endTiming: now }, false);
    } catch (err) {
      toast.error("Failed to save end time");
    }
  };
  const deleteImage = async (image) => {
    const imageUrl = typeof image === "string" ? image : image.url;
    if (!confirm("Delete this image?")) return;
    try {
      const res = await axios.delete(
        `${API_BASE}/tasks/groups/${groupId}/tasks/${task._id}/images`,
        { ...headers, data: { imageUrl } },
      );
      toast.success("Image deleted");
      onLocalChange(
        {
          images: res.data.tasks.find((t) => t._id === task._id).images,
        },
        false,
      );
      setShowModal(false);
    } catch {
      toast.error("Delete failed");
    }
  };

  return (
    <>
      <tr className="border-b last:border-0 hover:bg-gray-50 transition-colors">
        <td className="p-2 align-top relative">
          {/* Input Area */}
          <div
            className={`border rounded-xl transition-all duration-200 bg-white overflow-hidden
    ${
      showProjects
        ? "border-sky-500 ring-4 ring-sky-100 shadow-lg"
        : "border-gray-200 hover:border-gray-300"
    }`}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-3 pt-2">
              <span className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                Project
              </span>

              {task.projectId && (
                <span className="text-[10px] bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">
                  Selected
                </span>
              )}
            </div>

            {/* Textarea */}
            <textarea
              value={task.projname || ""}
              placeholder="Search project or type custom project..."
              onFocus={() => setShowProjects(true)}
              onBlur={() => {
                setTimeout(() => {
                  setShowProjects(false);
                }, 200);
              }}
              onChange={(e) => {
                onLocalChange({
                  projname: e.target.value,
                  projectId: null,
                });
              }}
              className="w-full px-3 py-2 min-h-[85px] text-sm resize-none
      focus:outline-none bg-transparent placeholder:text-gray-400"
            />
          </div>

          {/* Dropdown */}
          {showProjects && (
            <div
              className="absolute left-0 right-0 mt-2 bg-white border border-gray-200
      rounded-2xl shadow-2xl overflow-hidden z-50 animate-in fade-in zoom-in-95"
            >
              {/* List */}
              <div className="max-h-56 overflow-y-auto py-1">
                {projects
                  .filter((p) =>
                    p.projectName
                      .toLowerCase()
                      .includes((task.projname || "").toLowerCase()),
                  )
                  .map((p) => (
                    <div
                      key={p._id}
                      onMouseDown={() => {
                        onLocalChange({
                          projectId: p._id,
                          projname: p.projectName,
                        });

                        setShowProjects(false);
                      }}
                      className="group px-4 py-3 cursor-pointer transition-all
              hover:bg-sky-50 border-b border-gray-100 last:border-0"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-800">
                            {p.projectName}
                          </p>

                          <p className="text-xs text-gray-400 mt-0.5">
                            {p.projectType}
                          </p>
                        </div>

                        <div
                          className="w-2 h-2 rounded-full bg-sky-500
                  opacity-0 group-hover:opacity-100 transition-opacity"
                        />
                      </div>
                    </div>
                  ))}

                {/* Empty State */}
                {projects.filter((p) =>
                  p.projectName
                    .toLowerCase()
                    .includes((task.projname || "").toLowerCase()),
                ).length === 0 && (
                  <div className="px-4 py-3 text-center">
                    <p className="text-sm text-gray-500">
                      No matching project found
                    </p>

                    {task.projname && (
                      <div
                        className="mt-3 inline-flex items-center gap-2
                bg-sky-50 text-sky-700 px-3 py-2 rounded-xl text-sm font-medium"
                      >
                        ✨ Create:
                        <span className="font-semibold">"{task.projname}"</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </td>

        <td className="p-2 align-top">
          <textarea
            value={task.name || ""}
            onChange={(e) => onLocalChange({ name: e.target.value })}
            placeholder="Type task details..."
            className="border border-gray-200 rounded-md px-3 py-2 w-full min-h-[110px] text-sm resize-none
               focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          />
        </td>

        <td className="p-2 align-top">
          <div className="border border-gray-200 rounded-md w-full bg-gray-50 text-gray-600 min-h-[80px] flex items-center justify-center font-medium">
            {formatToISTTime(task.timing)}
          </div>
        </td>

        <td className="p-2 align-top justify-center">
          <button
            disabled={!!task.endTiming}
            onClick={saveEndTiming}
            className={`w-full min-h-[80px] flex items-center justify-center rounded-md text-sm font-semibold transition-all ${
              task.endTiming
                ? "bg-gray-100 text-gray-500 cursor-not-allowed border border-gray-200"
                : "bg-sky-600 text-white hover:bg-sky-700 shadow-sm active:scale-95"
            }`}
          >
            {task.endTiming ? (
              formatToISTTime(task.endTiming)
            ) : (
              <div className="flex flex-col items-center">
                <span className="text-[10px] uppercase opacity-80">Stop</span>
                <span>End Timing</span>
              </div>
            )}
          </button>
        </td>

        <td className="p-2 align-top">
          <textarea
            value={task.issue || ""}
            onChange={(e) => onLocalChange({ issue: e.target.value })}
            placeholder="Any issues?"
            className="border border-gray-200 rounded-md px-3 py-2 w-full min-h-[110px] text-sm resize-none
               focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          />
        </td>

        <td className="p-2 align-top">
          <textarea
            value={task.status || ""}
            onChange={(e) => onLocalChange({ status: e.target.value })}
            placeholder="Status"
            className="border border-gray-200 rounded-md px-3 py-2 w-full min-h-[110px] text-sm resize-none
               focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          />
        </td>

        <td className="p-2 align-middle text-center">
          <label className="cursor-pointer group inline-block p-2 hover:bg-sky-50 rounded-full transition-colors">
            <FaUpload className="w-5 h-5 text-sky-600 group-hover:scale-110 transition-transform" />
            <input
              type="file"
              className="hidden"
              accept="image/*"
              onChange={uploadImage}
              disabled={uploading}
            />
          </label>
        </td>

        <td className="p-2 align-middle text-center">
          <button
            onClick={onDelete}
            className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors group"
          >
            <TrashIcon className="w-5 h-5 group-hover:scale-110 transition-transform" />
          </button>
        </td>
      </tr>

      {task.images?.length > 0 && (
        <tr>
          <td colSpan={7}>
            <div className="flex gap-2 flex-wrap mt-2">
              {task.images.map((img, idx) => {
                const url = typeof img === "string" ? img : img.url;
                return (
                  <img
                    key={idx}
                    src={url}
                    onClick={() => setShowModal(img)}
                    className="w-12 h-12 rounded cursor-pointer hover:opacity-75 border"
                    alt={`Task ${idx}`}
                  />
                );
              })}
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
              src={typeof showModal === "string" ? showModal : showModal.url}
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
