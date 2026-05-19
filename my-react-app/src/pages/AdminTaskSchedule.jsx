// src/pages/Schedule/AdminTaskSchedule.jsx

import React, { useContext, useEffect, useState, useMemo } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import { getUsersApi } from "./Analytics/useAnalyticsApi";
import useScheduleSocket from "../hooks/useScheduleSocket";

// ── Helpers ───────────────────────────────────────────────────────────────────
const fmt12 = (t) => {
  if (!t) return "--";
  const [h, m] = t.split(":");
  const hi = parseInt(h);
  return `${hi % 12 || 12}:${m} ${hi >= 12 ? "PM" : "AM"}`;
};

const initials = (name = "") =>
  name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase() || "?";

// ── Icons ─────────────────────────────────────────────────────────────────────
const IconPlus = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" viewBox="0 0 24 24">
    <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);
const IconEdit = () => (
  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);
const IconTrash = () => (
  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6" />
    <path d="M10 11v6" /><path d="M14 11v6" /><path d="M9 6V4h6v2" />
  </svg>
);
const IconSearch = () => (
  <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);
const IconCalendar = () => (
  <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);
const IconClock = () => (
  <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
  </svg>
);
const IconUser = () => (
  <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
  </svg>
);
const IconX = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" viewBox="0 0 24 24">
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);
const IconChevron = () => (
  <svg className="w-4 h-4 text-slate-400 pointer-events-none absolute right-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <polyline points="6 9 12 15 18 9" />
  </svg>
);
const IconEmpty = () => (
  <svg className="w-12 h-12 text-blue-200" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
    <line x1="8" y1="14" x2="16" y2="14" /><line x1="8" y1="18" x2="12" y2="18" />
  </svg>
);

// ── Badge config ──────────────────────────────────────────────────────────────
const PRIORITY_CLS = {
  low:    "bg-slate-100 text-slate-500 ring-1 ring-slate-200",
  medium: "bg-amber-50  text-amber-600  ring-1 ring-amber-200",
  high:   "bg-red-50    text-red-600    ring-1 ring-red-200",
};
const STATUS_CLS = {
  pending:    "bg-blue-50   text-blue-600   ring-1 ring-blue-100",
  inprogress: "bg-amber-50  text-amber-600  ring-1 ring-amber-100",
  completed:  "bg-green-50  text-green-600  ring-1 ring-green-100",
};
const STATUS_DOT = {
  pending:    "bg-blue-500",
  inprogress: "bg-amber-400",
  completed:  "bg-green-500",
};
const STATUS_LABEL = { pending: "Pending", inprogress: "In Progress", completed: "Completed" };

// ── Component ─────────────────────────────────────────────────────────────────
const AdminTaskSchedule = () => {
  const { token, user } = useContext(AuthContext);
  const API_BASE = import.meta.env.VITE_BASE;
  const headers  = { headers: { Authorization: `Bearer ${token}` } };

  const [showModal,      setShowModal]      = useState(false);
  const [employees,      setEmployees]      = useState([]);
  const [schedules,      setSchedules]      = useState([]);
  const [loading,        setLoading]        = useState(false);
  const [loadingList,    setLoadingList]    = useState(false);
  const [editingId,      setEditingId]      = useState(null);
  const [search,         setSearch]         = useState("");
  const [filterPriority, setFilterPriority] = useState("");
  const [filterStatus,   setFilterStatus]   = useState("");
  const [filterEmployee, setFilterEmployee] = useState("");

  const [formData, setFormData] = useState({
    title: "", description: "", scheduleDate: "",
    startTime: "", endTime: "", priority: "medium",
    status: "pending", assignedTo: "",
  });

  useEffect(() => { loadUsers(); fetchSchedules(); }, []);

  useScheduleSocket({
    userId: user?._id,
    onCreated: (s) => setSchedules((p) => p.find((i) => i._id === s._id) ? p : [s, ...p]),
    onUpdated: (s) => setSchedules((p) => p.map((i) => i._id === s._id ? s : i)),
    onDeleted: ({ id }) => setSchedules((p) => p.filter((i) => i._id !== id)),
  });

  const loadUsers = async () => {
    try { setEmployees(await getUsersApi(token) || []); } catch (e) { console.log(e); }
  };

  const fetchSchedules = async () => {
    try {
      setLoadingList(true);
      const res = await axios.get(`${API_BASE}/schedules`, headers);
      setSchedules(res.data?.schedules || []);
    } catch (e) { console.log(e); }
    finally { setLoadingList(false); }
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const resetForm = () => {
    setFormData({ title: "", description: "", scheduleDate: "", startTime: "", endTime: "", priority: "medium", status: "pending", assignedTo: "" });
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      if (editingId) {
        const res = await axios.patch(`${API_BASE}/schedules/${editingId}`, formData, headers);
        setSchedules((p) => p.map((i) => i._id === res.data.schedule._id ? res.data.schedule : i));
        alert("Schedule Updated Successfully");
      } else {
        const res = await axios.post(`${API_BASE}/schedules`, formData, headers);
        const c = res.data.schedule;
        setSchedules((p) => p.find((i) => i._id === c._id) ? p : [c, ...p]);
        alert("Schedule Created Successfully");
      }
      resetForm(); setShowModal(false);
    } catch (err) { alert(err?.response?.data?.message || "Something went wrong"); }
    finally { setLoading(false); }
  };

  const handleEdit = (item) => {
    setEditingId(item._id);
    setFormData({
      title: item.title || "", description: item.description || "",
      scheduleDate: item.scheduleDate || "", startTime: item.startTime || "",
      endTime: item.endTime || "", priority: item.priority || "medium",
      status: item.status || "pending", assignedTo: item.assignedTo?._id || "",
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this schedule?")) return;
    try {
      await axios.delete(`${API_BASE}/schedules/${id}`, headers);
      setSchedules((p) => p.filter((i) => i._id !== id));
      alert("Schedule Deleted Successfully");
    } catch (err) { alert(err?.response?.data?.message || "Failed to delete schedule"); }
  };

  // Filtered list
  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return schedules.filter((s) => {
      const matchQ  = !q || s.title?.toLowerCase().includes(q) || s.assignedTo?.name?.toLowerCase().includes(q) || s.description?.toLowerCase().includes(q);
      const matchP  = !filterPriority  || s.priority         === filterPriority;
      const matchS  = !filterStatus    || s.status           === filterStatus;
      const matchE  = !filterEmployee  || s.assignedTo?._id  === filterEmployee;
      return matchQ && matchP && matchS && matchE;
    });
  }, [schedules, search, filterPriority, filterStatus, filterEmployee]);

  const hasFilters = !!(search || filterPriority || filterStatus || filterEmployee);
  const clearAll   = () => { setSearch(""); setFilterPriority(""); setFilterStatus(""); setFilterEmployee(""); };

  const total     = schedules.length;
  const pending   = schedules.filter((s) => s.status === "pending").length;
  const inprog    = schedules.filter((s) => s.status === "inprogress").length;
  const done      = schedules.filter((s) => s.status === "completed").length;

  // Shared classes
  const inputCls  = "w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition";
  const labelCls  = "block text-xs font-semibold text-slate-500 uppercase tracking-widest mb-1.5";
  const selectCls = inputCls + " appearance-none pr-9 cursor-pointer";

  return (
    <div className="min-h-screen bg-slate-50 p-6">

      {/* ── HEADER ── */}
      <div className="flex flex-wrap items-end justify-between gap-4 mb-7">
        <div>
          <p className="text-xs font-bold text-blue-500 uppercase tracking-widest mb-1">Admin Panel</p>
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight leading-tight">
            Schedule Management
          </h1>
          <p className="text-sm text-slate-400 mt-1">Manage and track employee task schedules</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowModal(true); }}
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-sm font-semibold px-5 py-3 rounded-xl shadow-lg shadow-blue-200 transition-all hover:-translate-y-0.5"
        >
          <IconPlus /> Create Schedule
        </button>
      </div>

      {/* ── STATS ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total Schedules", val: total,   numCls: "text-slate-700",  bar: "bg-blue-300"  },
          { label: "Pending",         val: pending,  numCls: "text-blue-600",   bar: "bg-blue-500"  },
          { label: "In Progress",     val: inprog,   numCls: "text-amber-500",  bar: "bg-amber-400" },
          { label: "Completed",       val: done,     numCls: "text-green-600",  bar: "bg-green-500" },
        ].map(({ label, val, numCls, bar }) => (
          <div key={label} className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm relative overflow-hidden">
            <div className={`absolute top-0 left-0 right-0 h-1 rounded-t-2xl ${bar}`} />
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2">{label}</p>
            <p className={`text-4xl font-black leading-none ${numCls}`}>{val}</p>
          </div>
        ))}
      </div>

      {/* ── SEARCH & FILTERS ── */}
      <div className="bg-white border border-slate-100 rounded-2xl shadow-sm px-5 py-4 mb-4">
        <div className="flex flex-wrap gap-3 items-center">

          {/* Search input */}
          <div className="relative flex-1 min-w-[220px]">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <IconSearch />
            </span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search title, employee or description…"
              className="w-full pl-9 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition"
            />
          </div>

          {/* Priority */}
          <div className="relative">
            <select value={filterPriority} onChange={(e) => setFilterPriority(e.target.value)}
              className="appearance-none pl-3 pr-8 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition cursor-pointer min-w-[130px]">
              <option value="">All Priorities</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
            <IconChevron />
          </div>

          {/* Status */}
          <div className="relative">
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
              className="appearance-none pl-3 pr-8 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition cursor-pointer min-w-[130px]">
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="inprogress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
            <IconChevron />
          </div>

          {/* Employee */}
          <div className="relative">
            <select value={filterEmployee} onChange={(e) => setFilterEmployee(e.target.value)}
              className="appearance-none pl-3 pr-8 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition cursor-pointer min-w-[140px]">
              <option value="">All Employees</option>
              {employees.map((e) => <option key={e._id} value={e._id}>{e.name}</option>)}
            </select>
            <IconChevron />
          </div>

          {/* Clear */}
          {hasFilters && (
            <button onClick={clearAll}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-red-500 bg-slate-100 hover:bg-red-50 border border-slate-200 hover:border-red-200 px-3 py-2.5 rounded-xl transition whitespace-nowrap">
              <IconX /> Clear filters
            </button>
          )}
        </div>

        {/* Result count pill */}
        {hasFilters && (
          <div className="mt-3 flex items-center gap-2">
            <span className="text-xs text-slate-400">Showing</span>
            <span className="text-xs font-bold text-blue-600 bg-blue-50 ring-1 ring-blue-100 px-2.5 py-0.5 rounded-full">
              {filtered.length} of {total} results
            </span>
          </div>
        )}
      </div>

      {/* ── TABLE ── */}
      <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">

        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">All Schedules</p>
          <span className="text-xs font-semibold text-blue-600 bg-blue-50 ring-1 ring-blue-100 px-2.5 py-1 rounded-full">
            {filtered.length} record{filtered.length !== 1 ? "s" : ""}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                {["Task", "Employee", "Date", "Time", "Priority", "Status", "Actions"].map((h) => (
                  <th key={h} className="text-left px-6 py-3.5 text-xs font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loadingList ? (
                <tr>
                  <td colSpan={7} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                      <p className="text-sm text-slate-400">Loading schedules…</p>
                    </div>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <IconEmpty />
                      <p className="text-sm font-semibold text-slate-500">
                        {hasFilters ? "No schedules match your filters" : "No schedules yet"}
                      </p>
                      <p className="text-xs text-slate-400">
                        {hasFilters ? "Try adjusting your search or filters" : "Click \"Create Schedule\" to add one"}
                      </p>
                      {hasFilters && (
                        <button onClick={clearAll} className="text-xs font-semibold text-blue-600 hover:text-blue-700 underline underline-offset-2 mt-1">
                          Clear all filters
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((item) => (
                  <tr key={item._id} className="hover:bg-blue-50/40 transition-colors">

                    {/* Task */}
                    <td className="px-6 py-4 max-w-[220px]">
                      <p className="font-semibold text-slate-800 leading-snug truncate">{item.title}</p>
                      {item.description && (
                        <p className="text-xs text-slate-400 mt-0.5 truncate" title={item.description}>
                          {item.description}
                        </p>
                      )}
                    </td>

                    {/* Employee */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 text-xs font-bold flex items-center justify-center ring-2 ring-white flex-shrink-0">
                          {initials(item.assignedTo?.name)}
                        </div>
                        <span className="font-medium text-slate-700 whitespace-nowrap">
                          {item.assignedTo?.name || (
                            <span className="italic text-slate-400 font-normal text-xs">Unassigned</span>
                          )}
                        </span>
                      </div>
                    </td>

                    {/* Date */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 whitespace-nowrap">
                        <IconCalendar />
                        <span className="text-slate-600 text-sm">{item.scheduleDate || "--"}</span>
                      </div>
                    </td>

                    {/* Time */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 whitespace-nowrap">
                        <IconClock />
                        <span className="font-medium text-slate-700 tabular-nums">{fmt12(item.startTime)}</span>
                        <span className="text-slate-300 text-xs">–</span>
                        <span className="text-slate-500 tabular-nums">{fmt12(item.endTime)}</span>
                      </div>
                    </td>

                    {/* Priority */}
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${PRIORITY_CLS[item.priority] || PRIORITY_CLS.medium}`}>
                        {item.priority}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_CLS[item.status] || STATUS_CLS.pending}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT[item.status] || STATUS_DOT.pending}`} />
                        {STATUS_LABEL[item.status] || item.status}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(item)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition"
                        >
                          <IconEdit /> Edit
                        </button>
                        <button
                          onClick={() => handleDelete(item._id)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-red-500 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg transition"
                        >
                          <IconTrash /> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── MODAL ── */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={(e) => e.target === e.currentTarget && setShowModal(false)}
        >
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl shadow-blue-100/60 overflow-hidden">

            {/* Modal top bar */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-500 px-7 py-5 flex items-center justify-between">
              <div>
                <p className="text-blue-200 text-xs font-semibold uppercase tracking-widest mb-0.5">
                  {editingId ? "Editing schedule" : "New schedule"}
                </p>
                <h2 className="text-xl font-bold text-white leading-tight">
                  {editingId ? "Update Schedule" : "Create Schedule"}
                </h2>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="w-9 h-9 rounded-xl bg-white/15 hover:bg-white/25 text-white flex items-center justify-center transition"
              >
                <IconX />
              </button>
            </div>

            {/* Modal form */}
            <div className="p-7 max-h-[75vh] overflow-y-auto">
              <form onSubmit={handleSubmit} className="space-y-6">

                {/* Task Details */}
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <span className="h-px w-5 bg-blue-200 inline-block" /> Task Details
                  </p>
                  <div className="space-y-4">
                    <div>
                      <label className={labelCls}>Title</label>
                      <input type="text" name="title" placeholder="e.g. Weekly standup review" value={formData.title} onChange={handleChange} className={inputCls} required />
                    </div>
                    <div>
                      <label className={labelCls}>
                        <span className="flex items-center gap-1.5"><IconUser /> Assigned To</span>
                      </label>
                      <div className="relative">
                        <select name="assignedTo" value={formData.assignedTo} onChange={handleChange} className={selectCls}>
                          <option value="">Select an employee</option>
                          {employees.map((e) => <option key={e._id} value={e._id}>{e.name}</option>)}
                        </select>
                        <IconChevron />
                      </div>
                    </div>
                    <div>
                      <label className={labelCls}>Description</label>
                      <textarea name="description" placeholder="Add relevant notes or context…" value={formData.description} onChange={handleChange} className={inputCls + " min-h-[88px] resize-y"} />
                    </div>
                  </div>
                </div>

                {/* Schedule */}
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <span className="h-px w-5 bg-blue-200 inline-block" /> Schedule
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className={labelCls}>
                        <span className="flex items-center gap-1"><IconCalendar /> Date</span>
                      </label>
                      <input type="date" name="scheduleDate" value={formData.scheduleDate} onChange={handleChange} className={inputCls} required />
                    </div>
                    <div>
                      <label className={labelCls}>
                        <span className="flex items-center gap-1"><IconClock /> Start Time</span>
                      </label>
                      <input type="time" name="startTime" value={formData.startTime} onChange={handleChange} className={inputCls} />
                    </div>
                    <div>
                      <label className={labelCls}>
                        <span className="flex items-center gap-1"><IconClock /> End Time</span>
                      </label>
                      <input type="time" name="endTime" value={formData.endTime} onChange={handleChange} className={inputCls} />
                    </div>
                  </div>
                </div>

                {/* Classification */}
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <span className="h-px w-5 bg-blue-200 inline-block" /> Classification
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className={labelCls}>Priority</label>
                      <div className="relative">
                        <select name="priority" value={formData.priority} onChange={handleChange} className={selectCls}>
                          <option value="low">🟡 Low</option>
                          <option value="medium">🟠 Medium</option>
                          <option value="high">🔴 High</option>
                        </select>
                        <IconChevron />
                      </div>
                    </div>
                    <div>
                      <label className={labelCls}>Status</label>
                      <div className="relative">
                        <select name="status" value={formData.status} onChange={handleChange} className={selectCls}>
                          <option value="pending">⏳ Pending</option>
                          <option value="inprogress">🔄 In Progress</option>
                          <option value="completed">✅ Completed</option>
                        </select>
                        <IconChevron />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-xl shadow-md shadow-blue-200 transition-all hover:-translate-y-0.5 text-sm"
                >
                  {loading ? (
                    <span className="inline-flex items-center gap-2 justify-center">
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Saving…
                    </span>
                  ) : editingId ? "Update Schedule" : "Create Schedule"}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminTaskSchedule;