import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import { calculateLiveWorkingHours } from "../utils/timeUtils";
import { XMarkIcon } from "@heroicons/react/24/outline";

const API_BASE = import.meta.env.VITE_BASE;

// ─── Time button meta (same as ProjTaskManagement) ───────────────────────────
const TIME_SLOTS = [
  { key: "timeIn", label: "Time In", color: "emerald" },
  { key: "MGBreakIn", label: "MG In", color: "sky" },
  { key: "MGBreakOut", label: "MG Out", color: "sky" },
  { key: "LunchbreakIn", label: "Lunch In", color: "amber" },
  { key: "LunchbreakOut", label: "Lunch Out", color: "amber" },
  { key: "EveBreakIn", label: "Eve In", color: "violet" },
  { key: "EveBreakOut", label: "Eve Out", color: "violet" },
  { key: "timeOut", label: "Time Out", color: "rose" },
];

const TILE_COLOR = {
  emerald: "bg-emerald-50 border-emerald-200 text-emerald-800",
  sky: "bg-sky-50 border-sky-200 text-sky-800",
  amber: "bg-amber-50 border-amber-200 text-amber-800",
  violet: "bg-violet-50 border-violet-200 text-violet-800",
  rose: "bg-rose-50 border-rose-200 text-rose-800",
};

export default function BusinessTaskView() {
  const { token } = useContext(AuthContext);
  const [members, setMembers] = useState([]);
  const [selectedMember, setSelectedMember] = useState(
    () => localStorage.getItem("selectedMember") || "",
  );
  const [groups, setGroups] = useState([]);
  const [filterDate, setFilterDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [modalImage, setModalImage] = useState(null);
  const [liveTime, setLiveTime] = useState(Date.now());

  const headers = { headers: { Authorization: `Bearer ${token}` } };

  // ✅ Fetch all project members
  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const res = await axios.get(
          `${API_BASE}/profile/all-project-users`,
          headers,
        );
        setMembers(res.data || []);
        if (res.data.length) setSelectedMember(res.data[0]._id);
      } catch (err) {
        console.error("Error fetching members:", err);
      }
    };
    fetchMembers();
  }, []);

  // ✅ Fetch task groups for selected user
  useEffect(() => {
    if (!selectedMember) return;
    fetchGroups();
    // eslint-disable-next-line
  }, [selectedMember, filterDate]);

  const fetchGroups = async () => {
    setLoading(true);
    try {
      const url = filterDate
        ? `${API_BASE}/tasks/groups/user/${selectedMember}?date=${filterDate}`
        : `${API_BASE}/tasks/groups/user/${selectedMember}`;
      const res = await axios.get(url, headers);
      setGroups(res.data || []);
    } catch (err) {
      console.error("Fetch groups error:", err);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Convert UTC to IST with AM/PM
  const formatToISTTime = (isoString) => {
    if (!isoString) return "-";
    const date = new Date(isoString);
    if (isNaN(date)) return "-";
    const formatted = date.toLocaleTimeString("en-IN", {
      timeZone: "Asia/Kolkata",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
    return formatted.replace(":", ".").toLowerCase();
  };

  const formatDate = (iso) => {
    if (!iso) return "-";
    const d = new Date(iso);
    return `${String(d.getDate()).padStart(2, "0")}-${String(d.getMonth() + 1).padStart(2, "0")}-${d.getFullYear()}`;
  };

  useEffect(() => {
    if (members.length > 0 && !selectedMember) {
      setSelectedMember(members[0]._id);
    }
  }, [members]);

  // Live timer
  useEffect(() => {
    const timer = setInterval(() => {
      const hasActiveGroup = groups.some((g) => g.timeIn && !g.timeOut);
      if (hasActiveGroup) setLiveTime(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, [groups]);

  // Selected member object
  const selectedMemberObj = members.find((m) => m._id === selectedMember);

  return (
    <div className="min-h-screen bg-slate-50 pt-20 pb-12">
      <div className="max-w-screen-xl mx-auto px-4 lg:px-6">
        {/* ── Header ───────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          {/* Left: title + member selector */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow">
              <svg
                className="w-5 h-5 text-white"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-800 leading-tight">
                Team Task View
              </h1>
              <p className="text-xs text-slate-500">
                {groups.length} group{groups.length !== 1 ? "s" : ""} found
              </p>
            </div>

            {/* Member avatar + dropdown */}
            <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-2 shadow-sm">
              {selectedMemberObj && (
                <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold flex-shrink-0">
                  {selectedMemberObj.name?.charAt(0).toUpperCase()}
                </div>
              )}
              <select
                value={selectedMember}
                onChange={(e) => {
                  setSelectedMember(e.target.value);
                  localStorage.setItem("selectedMember", e.target.value);
                }}
                className="text-sm text-slate-700 bg-transparent outline-none cursor-pointer font-medium pr-1"
              >
                {members.map((m) => (
                  <option key={m._id} value={m._id}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Right: date filter */}
          <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-2 shadow-sm">
            <svg
              className="w-4 h-4 text-slate-400"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="text-sm text-slate-700 bg-transparent outline-none"
            />
            {filterDate && (
              <button
                onClick={() => setFilterDate("")}
                className="w-4 h-4 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center hover:bg-slate-300 transition text-xs font-bold"
              >
                ×
              </button>
            )}
          </div>
        </div>

        {/* ── Loading ──────────────────────────────────────────────── */}
        {loading && (
          <div className="flex justify-center py-16">
            <div className="flex flex-col items-center gap-3">
              <div className="w-10 h-10 border-4 border-slate-200 border-t-indigo-500 rounded-full animate-spin" />
              <p className="text-sm text-slate-400">Loading tasks…</p>
            </div>
          </div>
        )}

        {/* ── Empty ────────────────────────────────────────────────── */}
        {!loading && groups.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
              <svg
                className="w-8 h-8 text-slate-300"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.5}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
            </div>
            <p className="text-slate-500 font-medium">No task data available</p>
            <p className="text-slate-400 text-sm mt-1">
              {filterDate
                ? "Try clearing the date filter"
                : `No records found for ${selectedMemberObj?.name || "this member"}`}
            </p>
          </div>
        )}

        {/* ── Groups ───────────────────────────────────────────────── */}
        {!loading && (
          <div className="space-y-6">
            {groups.map((group) => {
              const isActive = group.timeIn && !group.timeOut;
              return (
                <div
                  key={group._id}
                  className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden"
                >
                  {/* Colored top accent */}
                  <div
                    className={`h-1 w-full ${isActive ? "bg-gradient-to-r from-emerald-400 via-sky-400 to-violet-400" : "bg-slate-100"}`}
                  />

                  <div className="p-5">
                    {/* ── Group Header ─────────────────────────────── */}
                    <div className="flex flex-wrap items-start justify-between gap-4 mb-5">
                      {/* Date + active badge */}
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500">
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth={2}
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-400 uppercase tracking-widest font-medium">
                            Date
                          </p>
                          <p className="text-sm font-bold text-slate-800">
                            {formatDate(group.date)}
                          </p>
                        </div>
                        {isActive && (
                          <span className="flex items-center gap-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1 rounded-full text-xs font-semibold">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse inline-block" />
                            Active
                          </span>
                        )}
                      </div>

                      {/* Working hours */}
                      <div
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold border ${
                          isActive
                            ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                            : group.timeIn
                              ? "bg-slate-50 text-slate-700 border-slate-200"
                              : "bg-slate-50 text-slate-400 border-slate-200"
                        }`}
                      >
                        <svg
                          className="w-4 h-4 opacity-70"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth={2}
                          viewBox="0 0 24 24"
                        >
                          <circle cx="12" cy="12" r="10" />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M12 6v6l4 2"
                          />
                        </svg>
                        {group.timeIn
                          ? calculateLiveWorkingHours(group)
                          : "0h 0m"}
                      </div>
                    </div>

                    {/* ── Time Stamp Tiles ──────────────────────────── */}
                    <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 mb-4">
                      {TIME_SLOTS.map(({ key, label, color }) => (
                        <div
                          key={key}
                          className={`border rounded-xl p-2 text-center ${
                            group[key]
                              ? TILE_COLOR[color]
                              : "bg-slate-50 border-slate-100 text-slate-400"
                          }`}
                        >
                          <p className="text-[9px] uppercase tracking-wider font-semibold truncate opacity-70">
                            {label}
                          </p>
                          <p className="text-xs font-bold mt-0.5">
                            {group[key] ? (
                              formatToISTTime(group[key])
                            ) : (
                              <span className="text-slate-300">—</span>
                            )}
                          </p>
                        </div>
                      ))}
                    </div>

                    {/* ── Break Durations ───────────────────────────── */}
                    {(group.mgBreakDuration ||
                      group.lunchBreakDuration ||
                      group.eveBreakDuration) && (
                      <div className="flex flex-wrap gap-2 mb-5">
                        {group.mgBreakDuration &&
                          group.mgBreakDuration !== "0h 0m" && (
                            <span className="inline-flex items-center gap-1.5 bg-sky-50 text-sky-700 border border-sky-200 px-3 py-1 rounded-full text-xs font-semibold">
                              ☕ MG Break{" "}
                              <span className="font-bold">
                                {group.mgBreakDuration}
                              </span>
                            </span>
                          )}
                        {group.lunchBreakDuration &&
                          group.lunchBreakDuration !== "0h 0m" && (
                            <span className="inline-flex items-center gap-1.5 bg-amber-50 text-amber-700 border border-amber-200 px-3 py-1 rounded-full text-xs font-semibold">
                              🍱 Lunch{" "}
                              <span className="font-bold">
                                {group.lunchBreakDuration}
                              </span>
                            </span>
                          )}
                        {group.eveBreakDuration &&
                          group.eveBreakDuration !== "0h 0m" && (
                            <span className="inline-flex items-center gap-1.5 bg-violet-50 text-violet-700 border border-violet-200 px-3 py-1 rounded-full text-xs font-semibold">
                              🌇 Evening{" "}
                              <span className="font-bold">
                                {group.eveBreakDuration}
                              </span>
                            </span>
                          )}
                      </div>
                    )}

                    {/* ── Tasks section label ───────────────────────── */}
                    <div className="flex items-center gap-2 mb-3">
                      <h3 className="text-sm font-bold text-slate-700">
                        Tasks
                      </h3>
                      {group.tasks?.length > 0 && (
                        <span className="bg-indigo-100 text-indigo-700 text-xs px-2 py-0.5 rounded-full font-semibold">
                          {group.tasks.length}
                        </span>
                      )}
                    </div>

                    {/* ── Task Table ────────────────────────────────── */}
                    <div className="overflow-x-auto rounded-xl border border-slate-200">
                      <table className="min-w-[860px] w-full text-sm border-collapse">
                        <thead>
                          <tr className="bg-slate-50 border-b border-slate-200">
                            {[
                              "Project",
                              "Task",
                              "Start",
                              "End",
                              "Issue",
                              "Status",
                              "Images",
                            ].map((h, i) => (
                              <th
                                key={i}
                                className="px-3 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500"
                                style={{
                                  width: [
                                    "16%",
                                    "26%",
                                    "9%",
                                    "9%",
                                    "15%",
                                    "15%",
                                    "10%",
                                  ][i],
                                }}
                              >
                                {h}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {group.tasks?.length ? (
                            group.tasks.map((task) => {
                              const taskActive = task.timing && !task.endTiming;
                              return (
                                <tr
                                  key={task._id}
                                  className={`hover:bg-slate-50 transition-colors ${taskActive ? "bg-emerald-50/30" : ""}`}
                                >
                                  {/* Project */}
                                  <td className="px-3 py-3 align-top">
                                    {task.projname ? (
                                      <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 rounded-md bg-indigo-100 text-indigo-700 flex items-center justify-center text-[10px] font-bold flex-shrink-0">
                                          {task.projname
                                            .charAt(0)
                                            .toUpperCase()}
                                        </div>
                                        <span className="text-slate-700 font-medium text-xs leading-snug">
                                          {task.projname}
                                        </span>
                                        {task.projectId ? (
                                          <span className="w-fit text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-semibold">
                                            Linked
                                          </span>
                                        ) : (
                                          <span className="w-fit text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-semibold">
                                            Manual
                                          </span>
                                        )}
                                      </div>
                                    ) : (
                                      <span className="text-slate-300 text-xs">
                                        —
                                      </span>
                                    )}
                                  </td>

                                  {/* Task name */}
                                  <td className="px-3 py-3 align-top">
                                    <p className="text-slate-700 text-xs leading-relaxed whitespace-pre-wrap">
                                      {task.name || (
                                        <span className="text-slate-300">
                                          —
                                        </span>
                                      )}
                                    </p>
                                  </td>

                                  {/* Start */}
                                  <td className="px-3 py-3 align-top">
                                    <div className="flex items-center gap-1">
                                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0" />
                                      <span className="text-xs font-semibold text-slate-600">
                                        {formatToISTTime(task.timing)}
                                      </span>
                                    </div>
                                  </td>

                                  {/* End */}
                                  <td className="px-3 py-3 align-top">
                                    {task.endTiming ? (
                                      <div className="flex items-center gap-1">
                                        <div className="w-1.5 h-1.5 rounded-full bg-rose-400 flex-shrink-0" />
                                        <span className="text-xs font-semibold text-slate-600">
                                          {formatToISTTime(task.endTiming)}
                                        </span>
                                      </div>
                                    ) : (
                                      <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-semibold px-2 py-0.5 rounded-full">
                                        <span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse inline-block" />
                                        Running
                                      </span>
                                    )}
                                  </td>

                                  {/* Issue */}
                                  <td className="px-3 py-3 align-top">
                                    {task.issue ? (
                                      <p className="text-xs text-amber-700 bg-amber-50 border border-amber-100 rounded-lg px-2 py-1 leading-relaxed">
                                        {task.issue}
                                      </p>
                                    ) : (
                                      <span className="text-slate-300 text-xs">
                                        —
                                      </span>
                                    )}
                                  </td>

                                  {/* Status */}
                                  <td className="px-3 py-3 align-top">
                                    {task.status ? (
                                      <span className="inline-block bg-violet-50 text-violet-700 border border-violet-100 text-xs font-medium px-2.5 py-1 rounded-lg">
                                        {task.status}
                                      </span>
                                    ) : (
                                      <span className="text-slate-300 text-xs">
                                        —
                                      </span>
                                    )}
                                  </td>

                                  {/* Images */}
                                  <td className="px-3 py-3 align-top">
                                    {task.images?.length > 0 ? (
                                      <div className="flex gap-1.5 flex-wrap">
                                        {task.images.map((img, i) => {
                                          const url =
                                            typeof img === "string"
                                              ? img
                                              : img.url;
                                          return (
                                            <img
                                              key={i}
                                              src={url}
                                              onClick={() => setModalImage(img)}
                                              className="w-9 h-9 rounded-lg border border-slate-200 object-cover cursor-pointer hover:opacity-80 hover:border-sky-300 transition-all"
                                              alt="task"
                                            />
                                          );
                                        })}
                                      </div>
                                    ) : (
                                      <span className="text-slate-300 text-xs">
                                        —
                                      </span>
                                    )}
                                  </td>
                                </tr>
                              );
                            })
                          ) : (
                            <tr>
                              <td colSpan={7} className="py-10 text-center">
                                <div className="flex flex-col items-center gap-2">
                                  <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center">
                                    <svg
                                      className="w-4 h-4 text-slate-300"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeWidth={2}
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2"
                                      />
                                    </svg>
                                  </div>
                                  <p className="text-slate-400 text-xs">
                                    No tasks recorded
                                  </p>
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
            })}
          </div>
        )}
      </div>

      {/* ── Image Modal ──────────────────────────────────────────────── */}
      {modalImage && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50"
          onClick={() => setModalImage(null)}
        >
          <div
            className="relative bg-white rounded-2xl shadow-2xl p-5 max-w-3xl w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setModalImage(null)}
              className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 transition-colors"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
            <img
              src={typeof modalImage === "string" ? modalImage : modalImage.url}
              alt="Preview"
              className="w-full h-auto rounded-xl max-h-[80vh] object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
}
