import React, { useEffect, useState, useContext, useCallback } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { AuthContext } from "../../context/AuthContext";
import { ReminderContext } from "../../context/ReminderContext";
import Button from "../../components/Button";
import { TrashIcon, PlusIcon, XMarkIcon, PencilIcon } from "@heroicons/react/24/outline";
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

// ─── Time button meta ────────────────────────────────────────────────────────
const TIME_BUTTONS = [
  { key: "timeIn",        label: "Time In",      color: "emerald" },
  { key: "MGBreakIn",     label: "MG In",        color: "sky"     },
  { key: "MGBreakOut",    label: "MG Out",       color: "sky"     },
  { key: "LunchbreakIn",  label: "Lunch In",     color: "amber"   },
  { key: "LunchbreakOut", label: "Lunch Out",    color: "amber"   },
  { key: "EveBreakIn",    label: "Eve In",       color: "violet"  },
  { key: "EveBreakOut",   label: "Eve Out",      color: "violet"  },
  { key: "timeOut",       label: "Time Out",     color: "rose"    },
];

const COLOR_MAP = {
  emerald: { active: "bg-emerald-500 hover:bg-emerald-600 text-white border-emerald-500", done: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  sky:     { active: "bg-sky-500 hover:bg-sky-600 text-white border-sky-500",             done: "bg-sky-50 text-sky-700 border-sky-200"             },
  amber:   { active: "bg-amber-500 hover:bg-amber-600 text-white border-amber-500",       done: "bg-amber-50 text-amber-700 border-amber-200"       },
  violet:  { active: "bg-violet-500 hover:bg-violet-600 text-white border-violet-500",   done: "bg-violet-50 text-violet-700 border-violet-200"   },
  rose:    { active: "bg-rose-500 hover:bg-rose-600 text-white border-rose-500",          done: "bg-rose-50 text-rose-700 border-rose-200"          },
};
const PRIORITY_COLORS = {
  low:    "bg-slate-100 text-slate-600 border-slate-200",
  medium: "bg-amber-50 text-amber-700 border-amber-200",
  high:   "bg-red-50 text-red-700 border-red-200",
};
 
const STATUS_COLORS = {
  pending:    "bg-slate-100 text-slate-600",
  inprogress: "bg-sky-100 text-sky-700",
  completed:  "bg-emerald-100 text-emerald-700",
};
// ─── Schedule Modal ───────────────────────────────────────────────────────────
function ScheduleModal({ token, onClose, onCountChange }) {
  const headers = { headers: { Authorization: `Bearer ${token}` } };
 
  const emptyForm = {
    title: "",
    description: "",
    scheduleDate: new Date().toISOString().split("T")[0],
    startTime: "",
    endTime: "",
    priority: "medium",
    status: "pending",
  };
 
  const [schedules,   setSchedules]   = useState([]);
  const [loadingList, setLoadingList] = useState(true);
  const [form,        setForm]        = useState(emptyForm);
  const [editingId,   setEditingId]   = useState(null);
  const [saving,      setSaving]      = useState(false);
  const [view,        setView]        = useState("list");
 
  useEffect(() => { fetchSchedules(); }, []);
 
  const fetchSchedules = async () => {
    setLoadingList(true);
    try {
      const res = await axios.get(`${API_BASE}/schedules`, headers);
      setSchedules(res.data?.schedules || []);
    } catch {
      toast.error("Failed to load schedules");
    } finally {
      setLoadingList(false);
    }
  };
 
  const syncBadge = (list) => {
    onCountChange?.(list.filter((s) => s.status !== "completed").length);
  };
 
  const handleSave = async () => {
    if (!form.title.trim()) return toast.error("Title is required");
    setSaving(true);
    try {
      let updated;
      if (editingId) {
        const res = await axios.patch(`${API_BASE}/schedules/${editingId}`, form, headers);
        updated = schedules.map((s) => (s._id === editingId ? res.data.schedule : s));
        toast.success("Schedule updated");
      } else {
        const res = await axios.post(`${API_BASE}/schedules`, form, headers);
        updated = [res.data.schedule, ...schedules];
        toast.success("Schedule created");
      }
      setSchedules(updated);
      syncBadge(updated);
      setForm(emptyForm);
      setEditingId(null);
      setView("list");
    } catch (err) {
      toast.error(err.response?.data?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };
 
  const handleEdit = (schedule) => {
    setForm({
      title:        schedule.title,
      description:  schedule.description  || "",
      scheduleDate: schedule.scheduleDate,
      startTime:    schedule.startTime    || "",
      endTime:      schedule.endTime      || "",
      priority:     schedule.priority     || "medium",
      status:       schedule.status       || "pending",
    });
    setEditingId(schedule._id);
    setView("form");
  };
 
  const handleDelete = async (id) => {
    if (!confirm("Delete this schedule?")) return;
    try {
      await axios.delete(`${API_BASE}/schedules/${id}`, headers);
      const updated = schedules.filter((s) => s._id !== id);
      setSchedules(updated);
      syncBadge(updated);
      toast.success("Schedule deleted");
    } catch {
      toast.error("Delete failed");
    }
  };
 
  const handleStatusToggle = async (schedule) => {
    const nextStatus =
      schedule.status === "pending"    ? "inprogress" :
      schedule.status === "inprogress" ? "completed"  : "pending";
    try {
      const res = await axios.patch(
        `${API_BASE}/schedules/${schedule._id}`,
        { status: nextStatus },
        headers
      );
      const updated = schedules.map((s) => (s._id === schedule._id ? res.data.schedule : s));
      setSchedules(updated);
      syncBadge(updated);
    } catch {
      toast.error("Status update failed");
    }
  };
 
  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            {view === "form" && (
              <button
                onClick={() => { setView("list"); setForm(emptyForm); setEditingId(null); }}
                className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-500 transition"
              >←</button>
            )}
            <div>
              <h2 className="text-base font-bold text-slate-800">
                {view === "form" ? (editingId ? "Edit Schedule" : "New Schedule") : "Schedules"}
              </h2>
              <p className="text-xs text-slate-400">All schedules</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {view === "list" && (
              <button
                onClick={() => { setForm(emptyForm); setEditingId(null); setView("form"); }}
                className="flex items-center gap-1.5 bg-lime-600 hover:bg-lime-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-all active:scale-95"
              >
                <PlusIcon className="w-3.5 h-3.5" /> Add
              </button>
            )}
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 transition"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
 
        {/* Body */}
        <div className="max-h-[70vh] overflow-y-auto">
 
          {/* LIST */}
          {view === "list" && (
            <div className="p-4 space-y-3">
              {loadingList ? (
                <div className="flex justify-center py-10">
                  <div className="w-8 h-8 border-4 border-slate-200 border-t-lime-500 rounded-full animate-spin" />
                </div>
              ) : schedules.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  <p className="text-sm">No schedules yet</p>
                  <p className="text-xs mt-1">Click "Add" to create one</p>
                </div>
              ) : (
                schedules.map((s) => (
                  <div
                    key={s._id}
                    className={`border rounded-xl p-3 hover:shadow-sm transition-shadow ${
                      s.status === "completed"
                        ? "border-emerald-100 bg-emerald-50/40 opacity-70"
                        : "border-slate-200"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className={`text-sm font-semibold truncate ${s.status === "completed" ? "line-through text-slate-400" : "text-slate-800"}`}>
                            {s.title}
                          </p>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${PRIORITY_COLORS[s.priority]}`}>
                            {s.priority}
                          </span>
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 border border-slate-200">
                            📅 {s.scheduleDate}
                          </span>
                        </div>
                        {s.description && (
                          <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{s.description}</p>
                        )}
                        <div className="flex items-center gap-2 mt-2 flex-wrap">
                          {(s.startTime || s.endTime) && (
                            <span className="text-[10px] text-slate-400 flex items-center gap-1">
                              🕐 {s.startTime}{s.endTime ? ` – ${s.endTime}` : ""}
                            </span>
                          )}
                          <button
                            onClick={() => handleStatusToggle(s)}
                            className={`text-[10px] font-semibold px-2 py-0.5 rounded-full cursor-pointer transition-all ${STATUS_COLORS[s.status]}`}
                          >
                            {s.status}
                          </button>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => handleEdit(s)}
                          className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-sky-50 text-slate-400 hover:text-sky-600 transition"
                        >
                          <PencilIcon className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(s._id)}
                          className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition"
                        >
                          <TrashIcon className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
 
          {/* FORM */}
          {view === "form" && (
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Title <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  placeholder="Schedule title…"
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-lime-400 focus:ring-2 focus:ring-lime-100"
                />
              </div>
 
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  placeholder="Details…"
                  rows={3}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm resize-none focus:outline-none focus:border-lime-400 focus:ring-2 focus:ring-lime-100"
                />
              </div>
 
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Date</label>
                  <input type="date" value={form.scheduleDate}
                    onChange={(e) => setForm((f) => ({ ...f, scheduleDate: e.target.value }))}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-lime-400 focus:ring-2 focus:ring-lime-100"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Start</label>
                  <input type="time" value={form.startTime}
                    onChange={(e) => setForm((f) => ({ ...f, startTime: e.target.value }))}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-lime-400 focus:ring-2 focus:ring-lime-100"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">End</label>
                  <input type="time" value={form.endTime}
                    onChange={(e) => setForm((f) => ({ ...f, endTime: e.target.value }))}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-lime-400 focus:ring-2 focus:ring-lime-100"
                  />
                </div>
              </div>
 
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Priority</label>
                  <select value={form.priority}
                    onChange={(e) => setForm((f) => ({ ...f, priority: e.target.value }))}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-lime-400 focus:ring-2 focus:ring-lime-100 bg-white"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Status</label>
                  <select value={form.status}
                    onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-lime-400 focus:ring-2 focus:ring-lime-100 bg-white"
                  >
                    <option value="pending">Pending</option>
                    <option value="inprogress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </div>
 
              <button
                onClick={handleSave}
                disabled={saving}
                className="w-full bg-lime-600 hover:bg-lime-700 disabled:bg-lime-300 text-white font-semibold py-2.5 rounded-xl text-sm transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                {saving && <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />}
                {editingId ? "Update Schedule" : "Save Schedule"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
export default function ProjTaskManagement() {
  const { token, user } = useContext(AuthContext);
  const { fetchTodayGroup } = useContext(ReminderContext);
  const [groups, setGroups] = useState([]);
  const [filterDate, setFilterDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [liveTime, setLiveTime] = useState(Date.now());
  const headers = { headers: { Authorization: `Bearer ${token}` } };
  const [projects, setProjects] = useState([]);
  // Global schedule modal
  const [showCommonSchedule, setShowCommonSchedule] = useState(false);
  const [globalScheduleCount, setGlobalScheduleCount] = useState(0);
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

  useEffect(() => { if (user?._id) fetchProjects(); }, [user?._id]);
  useEffect(() => { fetchGroups(); }, [filterDate]);
   useEffect(() => {
    if (user?.dashboardType === "project") fetchGlobalScheduleCount();
  }, [user?.dashboardType]);
  const fetchGlobalScheduleCount = async () => {
    try {
      const res = await axios.get(`${API_BASE}/schedules`, { headers: { Authorization: `Bearer ${token}` } });
      const all = res.data?.schedules || [];
      setGlobalScheduleCount(all.filter((s) => s.status !== "completed").length);
    } catch {}
  };
  useEffect(() => {
    const timer = setInterval(() => {
      const hasActiveGroup = groups.some((g) => g.timeIn && !g.timeOut);
      if (hasActiveGroup) setLiveTime(Date.now());
    }, 1000);
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
      const res = await axios.post(`${API_BASE}/tasks/groups`, payload, headers);
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
      fetchTodayGroup();
    } catch (err) {
      toast.error(err.response?.data?.message || "Already recorded or failed");
    }
  };

  const addTask = async (groupId) => {
    try {
      const currentGroup = groups.find((g) => g._id === groupId);
      const activeTask = currentGroup?.tasks?.find((t) => !t.endTiming);

      if (activeTask) {
        toast.custom((t) => (
          <div className={`${t.visible ? "animate-enter" : "animate-leave"} max-w-md w-full bg-white shadow-2xl rounded-2xl pointer-events-auto flex overflow-hidden border border-orange-100`}>
            <div className="flex-1 p-4">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-11 h-11 rounded-full bg-orange-100 flex items-center justify-center">
                  <span className="text-xl">⏱️</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-900">Active Task Running</p>
                  <p className="mt-1 text-sm text-gray-500 leading-relaxed">Please end your current task before creating a new one.</p>
                  <div className="mt-3 inline-flex items-center gap-2 bg-orange-50 text-orange-700 px-3 py-1 rounded-full text-xs font-medium">End previous task first</div>
                </div>
              </div>
            </div>
            <div className="flex border-l border-gray-100">
              <button onClick={() => toast.dismiss(t.id)} className="px-4 text-sm font-medium text-orange-600 hover:bg-orange-50 transition">Close</button>
            </div>
          </div>
        ));
        return;
      }

      const now = new Date().toISOString();
      const payload = { timing: now, endTiming: null, projname: "", projectId: null, name: "", issue: "", status: "" };
      const res = await axios.post(`${API_BASE}/tasks/groups/${groupId}/tasks`, payload, headers);
      setGroups((prev) => prev.map((g) => (g._id === groupId ? res.data : g)));
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
      const res = await axios.delete(`${API_BASE}/tasks/groups/${groupId}/tasks/${taskId}`, headers);
      setGroups((prev) => prev.map((g) => (g._id === groupId ? res.data : g)));
      toast.success("Task deleted");
    } catch {
      toast.error("Failed to delete task");
    }
  };

  const saveTaskServer = async (groupId, taskId, patch) => {
    try {
      const res = await axios.patch(`${API_BASE}/tasks/groups/${groupId}/tasks/${taskId}`, patch, headers);
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
                  ? { ...t, ...patch, projectId: patch.projectId ?? t.projectId, projname: patch.projname ?? t.projname }
                  : t,
              ),
            }
          : g,
      ),
    );
    if (persist) debouncedSave(groupId, taskId, patch);
  };

  return (
    <div className="min-h-screen bg-slate-50 pt-20 pb-12">
      <div className="max-w-screen-xl mx-auto px-4 lg:px-6">

        {/* ── Header Bar ─────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-600 flex items-center justify-center shadow">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-800 leading-tight">Task Management</h1>
              <p className="text-xs text-slate-500">{groups.length} group{groups.length !== 1 ? "s" : ""} found</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Date filter */}
            <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-2 shadow-sm">
              <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
              </svg>
              <input
                type="date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className="text-sm text-slate-700 bg-transparent outline-none"
              />
              {filterDate && (
                <button
                  onClick={() => { setFilterDate(""); fetchGroups(); }}
                  className="ml-1 w-4 h-4 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center hover:bg-slate-300 transition text-xs font-bold"
                >×</button>
              )}
            </div>
              {/* ✅ FIXED: Removed the orphaned "Add Schedule" button that was here.
                The schedule button correctly lives inside each GroupCard below. */}
 
            {user?.dashboardType === "project" && (
              <button
                onClick={() => setShowCommonSchedule(true)}
                className="relative flex items-center gap-2 bg-lime-600 hover:bg-lime-700 text-white text-sm font-semibold px-4 py-2 rounded-xl shadow-sm transition-all active:scale-95"
              >
                <PlusIcon className="w-4 h-4" /> Schedule
                {globalScheduleCount > 0 && (
                  <>
                    <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-400 animate-ping opacity-75" />
                    <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-500 flex items-center justify-center text-[10px] font-bold text-white leading-none">
                      {globalScheduleCount > 9 ? "9+" : globalScheduleCount}
                    </span>
                  </>
                )}
              </button>
            )}
            {/* New Group */}
            <button
              onClick={createGroup}
              className="flex items-center gap-2 bg-sky-600 hover:bg-sky-700 text-white text-sm font-semibold px-4 py-2 rounded-xl shadow-sm transition-all active:scale-95"
            >
              <PlusIcon className="w-4 h-4" />
              New Group
            </button>
          </div>
        </div>

        {/* ── Loading ─────────────────────────────────────────────────── */}
        {loading && (
          <div className="flex justify-center py-16">
            <div className="flex flex-col items-center gap-3">
              <div className="w-10 h-10 border-4 border-slate-200 border-t-sky-500 rounded-full animate-spin" />
              <p className="text-sm text-slate-400">Loading groups…</p>
            </div>
          </div>
        )}

        {/* ── Empty ───────────────────────────────────────────────────── */}
        {!loading && groups.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-slate-300" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <p className="text-slate-500 font-medium">No groups yet</p>
            <p className="text-slate-400 text-sm mt-1">Create a new group to get started</p>
          </div>
        )}

        {/* ── Groups ──────────────────────────────────────────────────── */}
        <div className="space-y-6">
          {groups.map((group, idx) => (
            <GroupCard
              key={group._id}
              group={group}
              projects={projects}
              token={token}
              onSetTime={setTime}
              onDeleteGroup={deleteGroup}
              onAddTask={addTask}
              onDeleteTask={deleteTask}
              onUpdateTask={updateTaskLocal}
              idx={idx}
            />
          ))}
        </div>
      </div>
      {/* ── Global Schedule Modal ── */}
      {showCommonSchedule && (
        <ScheduleModal
          token={token}
          onCountChange={setGlobalScheduleCount}
          onClose={() => { setShowCommonSchedule(false); fetchGlobalScheduleCount(); }}
        />
      )}
    </div>
  );
}

// ─── GroupCard ───────────────────────────────────────────────────────────────
function GroupCard({ group, projects, token, onSetTime, onDeleteGroup, onAddTask, onDeleteTask, onUpdateTask, idx }) {
  const isActive = group.timeIn && !group.timeOut;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">

      {/* Card top accent */}
      <div className={`h-1 w-full ${isActive ? "bg-gradient-to-r from-emerald-400 via-sky-400 to-violet-400" : "bg-slate-100"}`} />

      <div className="p-5">
        {/* ── Group Header ──────────────────────────────────────────── */}
        <div className="flex flex-wrap items-start justify-between gap-4 mb-5">
          {/* Left: date + badge */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
              </svg>
            </div>
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-widest font-medium">Date</p>
              <p className="text-sm font-bold text-slate-800">{formatToIST(group.date)}</p>
            </div>
            {isActive && (
              <span className="flex items-center gap-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1 rounded-full text-xs font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse inline-block" />
                Active
              </span>
            )}
          </div>

          {/* Right: working hours + delete */}
          <div className="flex items-center gap-3">
            <div className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold border ${
              isActive
                ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                : group.timeIn
                  ? "bg-slate-50 text-slate-700 border-slate-200"
                  : "bg-slate-50 text-slate-400 border-slate-200"
            }`}>
              <svg className="w-4 h-4 opacity-70" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10"/><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2"/>
              </svg>
              {group.timeIn ? calculateLiveWorkingHours(group) : "0h 0m"}
            </div>
            <button
              onClick={() => onDeleteGroup(group._id)}
              className="w-9 h-9 flex items-center justify-center rounded-xl text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors border border-transparent hover:border-red-100"
            >
              <TrashIcon className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ── Time Buttons ─────────────────────────────────────────── */}
        <div className="flex flex-wrap gap-2 mb-4">
          {TIME_BUTTONS.map(({ key, label, color }) => {
            const isBreak = key.includes("Break");
            const isDisabled = !!group[key] || (isBreak && !!group.timeOut);
            const isDone = !!group[key];
            const c = COLOR_MAP[color];
            return (
              <button
                key={key}
                disabled={isDisabled}
                onClick={() => onSetTime(group._id, key)}
                className={`px-3 md:w-[140px] md:h-[40px] py-1.5 text-xs font-semibold rounded-lg border transition-all active:scale-95 ${
                  isDisabled
                    ? isDone
                      ? c.done + " cursor-default"
                      : "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed"
                    : c.active + " shadow-sm cursor-pointer"
                }`}
              >
                {isDone ? "✓ " : ""}{label}
              </button>
            );
          })}
        </div>

        {/* ── Time Stamps ──────────────────────────────────────────── */}
        <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 mb-4">
          {TIME_BUTTONS.map(({ key, label }) => (
            <div key={key} className="bg-slate-50 border border-slate-100 rounded-xl p-2 text-center">
              <p className="text-[9px] text-slate-400 uppercase tracking-wider font-medium truncate">{label}</p>
              <p className="text-xs font-bold text-slate-700 mt-0.5">
                {group[key] ? formatToISTTime(group[key]) : <span className="text-slate-300">—</span>}
              </p>
            </div>
          ))}
        </div>

        {/* ── Break Durations ───────────────────────────────────────── */}
        {(group.mgBreakDuration || group.lunchBreakDuration || group.eveBreakDuration) && (
          <div className="flex flex-wrap gap-2 mb-4">
            {group.mgBreakDuration && group.mgBreakDuration !== "0h 0m" && (
              <span className="inline-flex items-center gap-1.5 bg-sky-50 text-sky-700 border border-sky-200 px-3 py-1 rounded-full text-xs font-semibold">
                ☕ MG Break <span className="font-bold">{group.mgBreakDuration}</span>
              </span>
            )}
            {group.lunchBreakDuration && group.lunchBreakDuration !== "0h 0m" && (
              <span className="inline-flex items-center gap-1.5 bg-amber-50 text-amber-700 border border-amber-200 px-3 py-1 rounded-full text-xs font-semibold">
                🍱 Lunch <span className="font-bold">{group.lunchBreakDuration}</span>
              </span>
            )}
            {group.eveBreakDuration && group.eveBreakDuration !== "0h 0m" && (
              <span className="inline-flex items-center gap-1.5 bg-violet-50 text-violet-700 border border-violet-200 px-3 py-1 rounded-full text-xs font-semibold">
                🌇 Evening <span className="font-bold">{group.eveBreakDuration}</span>
              </span>
            )}
          </div>
        )}

        {/* ── Add Task ─────────────────────────────────────────────── */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-slate-700">
            Tasks
            {group.tasks?.length > 0 && (
              <span className="ml-2 bg-sky-100 text-sky-700 text-xs px-2 py-0.5 rounded-full font-semibold">
                {group.tasks.length}
              </span>
            )}
          </h3>
          <button
            onClick={() => onAddTask(group._id)}
            className="flex items-center gap-1.5 bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg shadow-sm transition-all active:scale-95"
          >
            <PlusIcon className="w-3.5 h-3.5" /> Add Task
          </button>
        </div>

        {/* ── Tasks Table ──────────────────────────────────────────── */}
        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="min-w-[1020px] w-full text-sm border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                {["Project", "Task Details", "Start", "End", "Issue", "Status", "Upload", ""].map((h, i) => (
                  <th
                    key={i}
                    className={`px-3 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500 ${i === 6 || i === 7 ? "text-center" : ""}`}
                    style={{ width: ["20%","25%","9%","9%","14%","14%","5%","4%"][i] }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {group.tasks?.length ? (
                group.tasks.map((task) => (
                  <TaskRow
                    key={task._id}
                    groupId={group._id}
                    groupDate={group.date}
                    task={task}
                    token={token}
                    onLocalChange={(patch, persist = true) =>
                      onUpdateTask(group._id, task._id, patch, persist)
                    }
                    projects={projects}
                    onDelete={() => onDeleteTask(group._id, task._id)}
                  />
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="text-center py-12">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
                        <PlusIcon className="w-5 h-5 text-slate-300" />
                      </div>
                      <p className="text-slate-400 text-sm">No tasks yet — add one above</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── TaskRow ─────────────────────────────────────────────────────────────────
function TaskRow({ groupId, task, onLocalChange, onDelete, token, projects,groupDate }) {
  const [showModal, setShowModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const headers = { headers: { Authorization: `Bearer ${token}` } };
  const [showProjects, setShowProjects] = useState(false);

  const isActive = !task.endTiming;
  const today = new Date().toISOString().split("T")[0];
  const isTodayTask = groupDate === today;
  const isDisabled = !isTodayTask;
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
      onLocalChange({ images: res.data.tasks.find((t) => t._id === task._id).images }, false);
    } catch {
      toast.error("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const saveEndTiming = async () => {
    try {
      const now = new Date().toISOString();
      await axios.patch(`${API_BASE}/tasks/groups/${groupId}/tasks/${task._id}`, { endTiming: now }, headers);
      toast.success("End timing saved");
      onLocalChange({ endTiming: now }, false);
    } catch {
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
      onLocalChange({ images: res.data.tasks.find((t) => t._id === task._id).images }, false);
      setShowModal(false);
    } catch {
      toast.error("Delete failed");
    }
  };

  return (
    <>
      <tr className={`hover:bg-slate-50 transition-colors ${isActive ? "bg-emerald-50/30" : ""}`}>

        {/* ── Project ─────────────────────────────────────────────── */}
        <td className="p-2 align-top relative">
          <div className={`border rounded-xl transition-all duration-200 bg-white overflow-hidden
            ${showProjects ? "border-sky-500 ring-2 ring-sky-100 shadow-md" : "border-slate-200 hover:border-slate-300"}`}>
            <div className="flex items-center justify-between px-3 pt-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Project</span>
              {task.projectId && (
                <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-semibold">Linked</span>
              )}
            </div>
            <textarea
            disabled={isDisabled}
              value={task.projname || ""}
              placeholder="Search or type project…"
              onFocus={() => setShowProjects(true)}
              onBlur={() => setTimeout(() => setShowProjects(false), 200)}
              onChange={(e) => onLocalChange({ projname: e.target.value, projectId: null })}
              className="w-full px-3 py-2 min-h-[85px] text-sm resize-none focus:outline-none bg-transparent placeholder:text-slate-300"
            />
          </div>

          {showProjects && (
            <div className="absolute left-0 right-0 mt-1 bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden z-50">
              <div className="max-h-52 overflow-y-auto py-1">
                {projects
                  .filter((p) => p.projectName.toLowerCase().includes((task.projname || "").toLowerCase()))
                  .map((p) => (
                    <div
                      key={p._id}
                      onMouseDown={() => { onLocalChange({ projectId: p._id, projname: p.projectName }); setShowProjects(false); }}
                      className="px-4 py-3 cursor-pointer hover:bg-sky-50 border-b border-slate-50 last:border-0 flex items-center justify-between group"
                    >
                      <div>
                        <p className="text-sm font-semibold text-slate-800">{p.projectName}</p>
                        <p className="text-xs text-slate-400 mt-0.5">{p.projectType}</p>
                      </div>
                      <div className="w-2 h-2 rounded-full bg-sky-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  ))}
                {projects.filter((p) => p.projectName.toLowerCase().includes((task.projname || "").toLowerCase())).length === 0 && (
                  <div className="px-4 py-4 text-center">
                    <p className="text-sm text-slate-500">No matching project</p>
                    {task.projname && (
                      <div className="mt-2 inline-flex items-center gap-1.5 bg-sky-50 text-sky-700 px-3 py-1.5 rounded-xl text-xs font-semibold">
                        ✨ Use: <span className="font-bold">"{task.projname}"</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </td>

        {/* ── Task Name ───────────────────────────────────────────── */}
        <td className="p-2 align-top">
          <textarea
          disabled={isDisabled}
            value={task.name || ""}
            onChange={(e) => onLocalChange({ name: e.target.value })}
            placeholder="Describe the task…"
            className="border border-slate-200 hover:border-slate-300 focus:border-sky-400 focus:ring-2 focus:ring-sky-100 rounded-xl px-3 py-2 w-full min-h-[110px] text-sm resize-none focus:outline-none bg-white transition-all placeholder:text-slate-300"
          />
        </td>

        {/* ── Start Timing ────────────────────────────────────────── */}
        <td className="p-2 align-top">
          <div className="border border-slate-200 rounded-xl bg-slate-50 min-h-[80px] flex flex-col items-center justify-center gap-1 px-2">
            <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10"/><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2"/>
            </svg>
            <p className="text-xs font-bold text-slate-700 text-center">{formatToISTTime(task.timing)}</p>
          </div>
        </td>

        {/* ── End Timing ──────────────────────────────────────────── */}
        <td className="p-2 align-top">
          <button
            disabled={!!task.endTiming}
            onClick={saveEndTiming}
            className={`w-full min-h-[80px] flex flex-col items-center justify-center gap-1 rounded-xl text-xs font-bold transition-all border
              ${task.endTiming
                ? "bg-slate-50 text-slate-600 border-slate-200 cursor-default"
                : "bg-rose-500 hover:bg-rose-600 text-white border-rose-500 shadow-sm active:scale-95 cursor-pointer"
              }`}
          >
            {task.endTiming ? (
              <>
                <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10"/><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2"/>
                </svg>
                <span>{formatToISTTime(task.endTiming)}</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <rect x="6" y="6" width="12" height="12" rx="2"/>
                </svg>
                <span>Stop</span>
              </>
            )}
          </button>
        </td>

        {/* ── Issue ───────────────────────────────────────────────── */}
        <td className="p-2 align-top">
          <textarea
            value={task.issue || ""}
            onChange={(e) => onLocalChange({ issue: e.target.value })}
            placeholder="Any blockers?"
            className="border border-slate-200 hover:border-slate-300 focus:border-amber-400 focus:ring-2 focus:ring-amber-100 rounded-xl px-3 py-2 w-full min-h-[110px] text-sm resize-none focus:outline-none bg-white transition-all placeholder:text-slate-300"
            disabled={isDisabled}
          />
        </td>

        {/* ── Status ──────────────────────────────────────────────── */}
        <td className="p-2 align-top">
          <textarea
            value={task.status || ""}
            onChange={(e) => onLocalChange({ status: e.target.value })}
            placeholder="Status…"
            className="border border-slate-200 hover:border-slate-300 focus:border-violet-400 focus:ring-2 focus:ring-violet-100 rounded-xl px-3 py-2 w-full min-h-[110px] text-sm resize-none focus:outline-none bg-white transition-all placeholder:text-slate-300"
            disabled={isDisabled}
          />
        </td>

        {/* ── Upload ──────────────────────────────────────────────── */}
        <td className="p-2 align-middle text-center">
          <label className={`cursor-pointer group inline-flex items-center justify-center w-9 h-9 rounded-xl border transition-all ${uploading ? "border-sky-200 bg-sky-50" : "border-slate-200 hover:border-sky-300 hover:bg-sky-50"}`}>
            {uploading
              ? <div className="w-4 h-4 border-2 border-sky-300 border-t-sky-600 rounded-full animate-spin" />
              : <FaUpload className="w-3.5 h-3.5 text-slate-400 group-hover:text-sky-600 transition-colors" />
            }
            <input type="file" className="hidden" accept="image/*" onChange={uploadImage} disabled={uploading} />
          </label>

          {/* Image thumbnails */}
          {task.images?.length > 0 && (
            <div className="flex flex-wrap justify-center gap-1 mt-2">
              {task.images.map((img, idx) => {
                const url = typeof img === "string" ? img : img.url;
                return (
                  <img
                    key={idx}
                    src={url}
                    onClick={() => setShowModal(img)}
                    className="w-8 h-8 rounded-lg object-cover cursor-pointer hover:opacity-80 border border-slate-200 transition-opacity"
                    alt={`img-${idx}`}
                  />
                );
              })}
            </div>
          )}
        </td>

        {/* ── Delete ──────────────────────────────────────────────── */}
        <td className="p-2 align-middle text-center">
          <button
          disabled={isDisabled}
            onClick={onDelete}
            className="inline-flex items-center justify-center w-9 h-9 rounded-xl border border-transparent hover:border-red-100 hover:bg-red-50 text-slate-400 hover:text-red-500 transition-all"
          >
            <TrashIcon className="w-4 h-4" />
          </button>
        </td>
      </tr>

      {/* ── Image Preview Modal ───────────────────────────────────── */}
      {showModal && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50"
          onClick={() => setShowModal(false)}
        >
          <div
            className="relative bg-white rounded-2xl shadow-2xl p-5 max-w-lg w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 transition-colors"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
            <img
              src={typeof showModal === "string" ? showModal : showModal.url}
              alt="Preview"
              className="w-full h-auto rounded-xl"
            />
            <div className="flex justify-end mt-4">
              <button
                onClick={() => deleteImage(showModal)}
                className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-all active:scale-95"
              >
                <TrashIcon className="w-4 h-4" /> Delete Image
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}