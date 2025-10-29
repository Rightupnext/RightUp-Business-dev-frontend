// src/pages/proj-task-management.jsx
import React, { useEffect, useState, useContext, useCallback } from "react";
import axios from "axios";
import { AuthContext } from "../../context/AuthContext";
import Button from "../../components/Button";
import { TrashIcon, PlusIcon } from "@heroicons/react/24/outline";

const API_BASE = import.meta.env.VITE_BASE; // e.g. http://localhost:5000/api

// simple debounce helper
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
  const [loading, setLoading] = useState(false);
  const [filterDate, setFilterDate] = useState(""); // YYYY-MM-DD, empty for all
  const headers = { headers: { Authorization: `Bearer ${token}` } };

  useEffect(() => {
    fetchGroups();
    // eslint-disable-next-line
  }, [filterDate]);

  const fetchGroups = async () => {
    setLoading(true);
    try {
      const url = filterDate ? `${API_BASE}/tasks/groups?date=${filterDate}` : `${API_BASE}/tasks/groups`;
      const res = await axios.get(url, headers);
      setGroups(res.data || []);
    } catch (err) {
      console.error("Fetch groups", err);
    } finally {
      setLoading(false);
    }
  };

  // create new group — uses today's date if filter empty, or filterDate if set (makes it easy)
  const createGroup = async () => {
    try {
      const payload = filterDate ? { date: filterDate } : {};
      const res = await axios.post(`${API_BASE}/tasks/groups`, payload, headers);
      // add to top
      setGroups(prev => [res.data, ...prev]);
    } catch (err) {
      console.error(err);
    }
  };

  const deleteGroup = async (groupId) => {
    if (!confirm("Delete this group?")) return;
    try {
      await axios.delete(`${API_BASE}/tasks/groups/${groupId}`, headers);
      setGroups(prev => prev.filter(g => g._id !== groupId));
    } catch (err) {
      console.error(err);
    }
  };

  const setTime = async (groupId, type) => {
    try {
      const res = await axios.put(`${API_BASE}/tasks/groups/${groupId}/time`, { type }, headers);
      setGroups(prev => prev.map(g => (g._id === groupId ? res.data : g)));
    } catch (err) {
      console.error(err);
    }
  };

  const addTask = async (groupId) => {
    try {
      const res = await axios.post(`${API_BASE}/tasks/groups/${groupId}/tasks`, { name: "" }, headers);
      setGroups(prev => prev.map(g => (g._id === groupId ? res.data : g)));
    } catch (err) {
      console.error(err);
    }
  };

  const deleteTask = async (groupId, taskId) => {
    if (!confirm("Delete this task?")) return;
    try {
      const res = await axios.delete(`${API_BASE}/tasks/groups/${groupId}/tasks/${taskId}`, headers);
      setGroups(prev => prev.map(g => (g._id === groupId ? res.data : g)));
    } catch (err) {
      console.error(err);
    }
  };

  const deleteSelectedTasks = async (groupId, selectedIds) => {
    if (!selectedIds.length) return;
    if (!confirm(`Delete ${selectedIds.length} selected task(s)?`)) return;
    try {
      const res = await axios.put(`${API_BASE}/tasks/groups/${groupId}/tasks/delete`, { selectedTasks: selectedIds }, headers);
      setGroups(prev => prev.map(g => (g._id === groupId ? res.data : g)));
    } catch (err) {
      console.error(err);
    }
  };

  // Auto-save: update single task via PATCH
  const saveTaskServer = async (groupId, taskId, patch) => {
    try {
      const res = await axios.patch(`${API_BASE}/tasks/groups/${groupId}/tasks/${taskId}`, patch, headers);
      // update local group with returned document
      setGroups(prev => prev.map(g => (g._id === groupId ? res.data : g)));
    } catch (err) {
      console.error("Save task error", err);
    }
  };

  // debounced wrapper to avoid many rapid requests while typing
  const debouncedSave = useCallback(debounce(saveTaskServer, 600), []);

  // local top-level update for quick UI feedback
  const updateTaskLocal = (groupId, taskId, patch, shouldPersist = true) => {
    setGroups(prev => prev.map(g => {
      if (g._id !== groupId) return g;
      return {
        ...g,
        tasks: g.tasks.map(t => (t._id === taskId ? { ...t, ...patch } : t)),
      };
    }));
    if (shouldPersist) debouncedSave(groupId, taskId, patch);
  };

  return (
    <div className="p-4 lg:p-6 mt-20">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <Button text="New Group" onClick={createGroup} />
        </div>

        <div className="flex items-center gap-3">
          <label className="text-sm text-gray-600">Filter by date</label>
          <input
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="border rounded px-2 py-1"
          />
          <button
            className="px-3 py-1 bg-gray-200 rounded"
            onClick={() => { setFilterDate(""); fetchGroups(); }}
            title="Clear filter"
          >
            Clear
          </button>
        </div>
      </div>

      {loading && <div className="text-sm text-gray-500">Loading...</div>}

      <div className="space-y-6">
        {groups.length === 0 && !loading && (
          <div className="text-gray-500">No groups yet. Click “New Group” to start.</div>
        )}

        {groups.map(group => (
          <div key={group._id} className="bg-white border rounded-lg p-4 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
              <div className="flex items-center gap-4">
                <div className="text-sm text-gray-600 flex items-center gap-2">
                  <div className="text-xs text-gray-500">Date :</div>
                  <div className="text-sm font-medium">{group.date}</div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button onClick={() => setTime(group._id, "timeIn")} className="bg-blue-600 text-white px-3 py-1 rounded text-sm">Time In</button>
                <button onClick={() => setTime(group._id, "timeOut")} className="bg-blue-600 text-white px-3 py-1 rounded text-sm">Time out</button>
                <button onClick={() => setTime(group._id, "break")} className="bg-blue-600 text-white px-3 py-1 rounded text-sm">Break</button>

                <button onClick={() => deleteGroup(group._id)} className="ml-2 text-red-600 hover:text-red-800" title="Delete group">
                  <TrashIcon className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* times display */}
            <div className="flex flex-wrap gap-3 mt-3">
              <div className="px-3 py-1 bg-gray-100 rounded text-sm">
                <div className="text-xs text-gray-500">Time In</div>
                <div className="font-medium">{group.timeIn || "-"}</div>
              </div>
              <div className="px-3 py-1 bg-gray-100 rounded text-sm">
                <div className="text-xs text-gray-500">Time Out</div>
                <div className="font-medium">{group.timeOut || "-"}</div>
              </div>
              <div className="px-3 py-1 bg-gray-100 rounded text-sm">
                <div className="text-xs text-gray-500">Break</div>
                <div className="font-medium">{group.breakTime || "-"}</div>
              </div>
            </div>

            {/* controls */}
            <div className="mt-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button onClick={() => addTask(group._id)} className="bg-sky-600 text-white px-3 py-1 rounded text-sm flex items-center gap-2">
                  <PlusIcon className="w-4 h-4"/> Task
                </button>
              </div>
            </div>

            {/* table */}
            <div className="mt-4 overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="p-2 w-12"></th>
                    <th className="p-2 text-left">Task name</th>
                    <th className="p-2 text-left">Timing</th>
                    <th className="p-2 text-left">Issue</th>
                    <th className="p-2 text-left">Status</th>
                    <th className="p-2 text-left w-20">Action</th>
                  </tr>
                </thead>

                <tbody>
                  {group.tasks?.length ? group.tasks.map(task => (
                    <TaskRow
                      key={task._id}
                      groupId={group._id}
                      task={task}
                      onLocalChange={(patch) => updateTaskLocal(group._id, task._id, patch, true)}
                      onDelete={() => deleteTask(group._id, task._id)}
                      onDeleteSelected={(ids) => deleteSelectedTasks(group._id, ids)}
                    />
                  )) : (
                    <tr>
                      <td colSpan={6} className="p-6 text-center text-gray-400">No tasks. Click <span className="font-medium">Task</span> to add a new row.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---- TaskRow component ---- */
function TaskRow({ groupId, task, onLocalChange, onDelete }) {
  const [selected, setSelected] = useState(false);

  // local change handlers
  return (
    <tr className="border-b">
      <td className="p-2">
        <input type="checkbox" checked={selected} onChange={() => setSelected(s => !s)} />
      </td>
      <td className="p-2">
        <input
          className="w-full border px-2 py-1 rounded"
          value={task.name || ""}
          onChange={(e) => onLocalChange({ name: e.target.value })}
        />
      </td>
      <td className="p-2">
        <input
          className="w-full border px-2 py-1 rounded"
          value={task.timing || ""}
          onChange={(e) => onLocalChange({ timing: e.target.value })}
        />
      </td>
      <td className="p-2">
        <input
          className="w-full border px-2 py-1 rounded"
          value={task.issue || ""}
          onChange={(e) => onLocalChange({ issue: e.target.value })}
        />
      </td>
      <td className="p-2">
        <input
          className="w-full border px-2 py-1 rounded"
          value={task.status || ""}
          onChange={(e) => onLocalChange({ status: e.target.value })}
        />
      </td>
      <td className="p-2">
        <div className="flex gap-2 items-center">
          <button onClick={onDelete} className="text-red-600">
            <TrashIcon className="w-5 h-5" />
          </button>
        </div>
      </td>
    </tr>
  );
}
