import { useEffect, useMemo, useState } from "react";
import {  initials } from "./data";

/**
 * UserProjectSearch
 * Props:
 *   selectedUserId  : string  — controlled
 *   selectedProject : string  — controlled
 *   onUserChange    : (userId: string) => void
 *   onProjectChange : (project: string) => void
 */
export default function UserProjectSearch({
  users,
  selectedUserId,
  selectedProject,
  onUserChange,
  onProjectChange,
  projects,
  setProjects,
  token,
  getProjectsByUserApi,
}) {
  const [loadingProjects, setLoadingProjects] = useState(false);

  // ✅ Selected User
  const selectedUser = users.find((u) => u._id === selectedUserId);
  useEffect(() => {
    if (!selectedUserId) return;

    loadProjects();
  }, [selectedUserId]);
  const loadProjects = async () => {
    try {
      setLoadingProjects(true);
      console.log("selectedUserId", selectedUserId);
      const data = await getProjectsByUserApi(selectedUserId, token);
      console.log("data", data);
      setProjects(data);
      onProjectChange("");
    } catch (err) {
      console.log(err);
    } finally {
      setLoadingProjects(false);
    }
  };

  const userProjects = useMemo(() => {
    return projects || [];
  }, [projects]);

  const handleUserChange = (e) => {
    onUserChange(e.target.value);
    onProjectChange("");
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
          <svg
            className="w-5 h-5 text-blue-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
            />
          </svg>
        </div>
        <div>
          <h1 className="text-lg font-medium text-gray-900">
            Analytics report
          </h1>
          <p className="text-xs text-gray-500">
            Task performance by user &amp; project
          </p>
        </div>
      </div>

      {/* Selects */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">
            Select user
          </label>
          <select
            value={selectedUserId}
            onChange={handleUserChange}
            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-800 bg-white
              focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">— Choose user —</option>
            {users.map((u) => (
              <option key={u.id} value={u._id}>
                {u.name} — {u.role}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">
            Select project
          </label>
          <select
            value={selectedProject}
            onChange={(e) => onProjectChange(e.target.value)}
            disabled={!selectedUserId}
            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-800 bg-white
              focus:outline-none focus:ring-2 focus:ring-blue-500
              disabled:bg-gray-100 disabled:text-gray-400"
          >
            <option value="">— Choose project —</option>
            {userProjects.map((p) => (
              <option key={p._id} value={p._id}>
                {p.projectName}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* User card */}
      {selectedUser && (
        <div className="bg-white border border-gray-200 rounded-xl p-4 flex items-center gap-4">
          <div
            className="w-11 h-11 rounded-full bg-blue-100 text-blue-700 text-sm font-medium
            flex items-center justify-center flex-shrink-0"
          >
            {initials(selectedUser.name)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-medium text-gray-900 text-sm">
              {selectedUser.name}
            </div>
            <div className="text-xs text-gray-500">{selectedUser.role}</div>
            <div className="text-xs text-gray-400">{selectedUser.email}</div>
          </div>
          <span className="text-xs font-medium bg-blue-50 text-blue-700 px-2.5 py-1 rounded-md flex-shrink-0">
            {selectedUser.role.split(" ")[0]}
          </span>
        </div>
      )}
    </div>
  );
}
