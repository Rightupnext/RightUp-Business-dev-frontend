import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";

const API_BASE = import.meta.env.VITE_BASE;

export default function BusinessTaskView() {
  const { token } = useContext(AuthContext);
  const [members, setMembers] = useState([]);
  const [selectedMember, setSelectedMember] = useState(null);
  const [groups, setGroups] = useState([]);
  const [filterDate, setFilterDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [modalImage, setModalImage] = useState(null);

  const headers = { headers: { Authorization: `Bearer ${token}` } };

  // ✅ Fetch all project members
  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const res = await axios.get(`${API_BASE}/profile/all-project-users`, headers);
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

// ✅ Convert UTC or raw time string to IST with AM/PM
const formatToISTTime = (timeString) => {
  if (!timeString) return "-";
  const date = new Date(`1970-01-01T${timeString}Z`); // interpret as UTC
  if (isNaN(date)) return timeString;
  return date.toLocaleTimeString("en-IN", {
    timeZone: "Asia/Kolkata",
    hour: "2-digit",
    minute: "2-digit",
   
    hour12: true, // ✅ show AM/PM
  });
};

  const formatDate = (iso) => {
    if (!iso) return "-";
    const d = new Date(iso);
    return `${String(d.getDate()).padStart(2, "0")}-${String(d.getMonth() + 1).padStart(2, "0")}-${d.getFullYear()}`;
  };

  return (
    <div className="mt-20 relative">
      {/* ✅ Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        {/* Member Selection */}
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-semibold text-gray-800">Task Management</h2>
          <select
            value={selectedMember || ""}
            onChange={(e) => setSelectedMember(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
          >
            {members.map((m) => (
              <option key={m._id} value={m._id}>
                {m.name}
              </option>
            ))}
          </select>
        </div>

        {/* Date Filter */}
        <div className="flex items-center gap-3">
          <label className="text-sm text-gray-600">Filter by date</label>
          <input
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="border rounded px-2 py-1"
          />
          <button
            className="px-3 py-1 bg-gray-200 rounded text-sm"
            onClick={() => setFilterDate("")}
          >
            Clear
          </button>
        </div>
      </div>

      {/* ✅ Groups & Tasks Display */}
      {loading ? (
        <div className="text-sm text-gray-500"></div>
      ) : groups.length === 0 ? (
        <div className="text-gray-500">No task data available for this member.</div>
      ) : (
        <div className="space-y-6">
          {groups.map((group) => (
            <div
              key={group._id}
              className="bg-white border rounded-lg p-4 shadow-sm hover:shadow-md transition"
            >
              {/* Group Header */}
              <div className=" md:flex-row md:justify-between md:items-start gap-3 mb-3">
              
                  <span className="font-medium text-gray-800 ">Date:</span>
                  <span>{formatDate(group.date)}</span>
               

                {/* Time Details */}
                <div className="flex flex-wrap gap-3 mt-5">
                  {[
                    ["Time In", group.timeIn],
                    ["Morning Break In", group.MGBreakIn],
                    ["Morning Break Out", group.MGBreakOut],
                    ["Lunch Break In", group.LunchbreakIn],
                    ["Lunch Break Out", group.LunchbreakOut],
                    ["Evening Break In", group.EveBreakIn],
                    ["Evening Break Out", group.EveBreakOut],
                    ["Time Out", group.timeOut],
                  ].map(([label, value], idx) => (
                    <div
                      key={idx}
                      className="px-3 py-1 bg-blue-400 rounded text-sm text-white"
                    >
                      <div className="text-xs font-bold text-white">{label}</div>
                     
                      <div className="font-bold text-white">{formatToISTTime(value)}</div>

                    </div>
                  ))}
                </div>
              </div>

              {/* Task Table */}
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm border border-gray-200">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="p-2 text-left">Project</th>
                      <th className="p-2 text-left">Task</th>
                      <th className="p-2 text-left">Timing</th>
                        <th className="p-2 text-left">End Timing</th>
                      <th className="p-2 text-left">Issue</th>
                      <th className="p-2 text-left">Status</th>
                      <th className="p-2 text-left">Images</th>
                    </tr>
                  </thead>
                  <tbody>
                    {group.tasks?.length ? (
                      group.tasks.map((task) => (
                        <tr key={task._id} className="border-b hover:bg-gray-50">
                          <td className="p-2">{task.projname || "-"}</td>
                          <td className="p-2">{task.name || "-"}</td>
                          <td className="p-2">{formatToISTTime(task.timing)}</td>
                          <td className="p-2">{formatToISTTime(task.endTiming)}</td>
                          <td className="p-2">{task.issue || "-"}</td>
                          <td className="p-2">{task.status || "-"}</td>
                          <td className="p-2">
                            {task.images?.length > 0 ? (
                              <div className="flex gap-2 flex-wrap">
                                {task.images.map((img, i) => (
                                  <img
                                    key={i}
                                    src={img}
                                    onClick={() => setModalImage(img)}
                                    className="w-10 h-10 rounded border object-cover cursor-pointer hover:opacity-80"
                                    alt="task"
                                  />
                                ))}
                              </div>
                            ) : (
                              "-"
                            )}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="p-4 text-center text-gray-400">
                          No tasks recorded
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ✅ Image Modal */}
      {modalImage && (
        <div
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50"
          onClick={() => setModalImage(null)}
        >
          <div className="relative bg-white rounded-lg shadow-lg max-w-3xl w-full mx-4">
            <button
              onClick={() => setModalImage(null)}
              className="absolute top-2 right-2 bg-gray-200 hover:bg-gray-300 rounded-full p-2"
            >
              ✕
            </button>
            <img
              src={modalImage}
              alt="Preview"
              className="w-full h-auto rounded-lg max-h-[80vh] object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
}
