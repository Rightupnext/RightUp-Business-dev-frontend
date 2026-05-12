import { useState, useMemo, useEffect, useContext } from "react";

import UserProjectSearch from "./UserProjectSearch";
import TaskHours from "./TaskHours";
import TaskChart from "./TaskChart";
import TaskTable from "./TaskTable";
import {
  getUsersApi,
  getProjectsByUserApi,
  getProjectReportApi,
} from "./useAnalyticsApi";
import { AuthContext } from "../../context/AuthContext";
export default function Adminanalyticsreport() {
  const { token } = useContext(AuthContext);
  const [users, setUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState([]);
  const [selectedProject, setSelectedProject] = useState("");
  const [projects, setProjects] = useState([]);
  const [report, setReport] = useState(null);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const data = await getUsersApi(token);

      setUsers(data);
    } catch (err) {
      console.log(err);
    }
  };
  useEffect(() => {
    if (!selectedProject) return;

    loadReport();
  }, [selectedProject]);
  const loadReport = async () => {
    try {
      console.log("selectedProject", selectedProject);
      const data = await getProjectReportApi(selectedProject, token);
      console.log("Report", data);
      setReport(data);
    } catch (err) {
      console.log(err);
    }
  };
  const filteredTasks = report?.reports || [];
  const showEmpty =
    selectedUserId && selectedProject && filteredTasks.length === 0;

  return (
    <div className="min-h-screen p-6 mt-10">
      <div className=" mx-auto space-y-5">
        {/* 1. Search / filter */}
        <UserProjectSearch
          users={users}
          selectedUserId={selectedUserId}
          selectedProject={selectedProject}
          onUserChange={setSelectedUserId}
          onProjectChange={setSelectedProject}
          projects={projects}
          setProjects={setProjects}
          token={token}
          getProjectsByUserApi={getProjectsByUserApi}
        />

        {/* 2. Summary metric cards */}
        <TaskHours filteredTasks={filteredTasks} />

        {/* 3. Chart */}
        <TaskChart filteredTasks={filteredTasks} />

        {/* 4. Table */}
        <TaskTable filteredTasks={filteredTasks} />

        {/* Empty state */}
        {showEmpty && (
          <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
              <svg
                className="w-6 h-6 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
            </div>
            <p className="text-sm font-medium text-gray-500">No tasks found</p>
            <p className="text-xs text-gray-400 mt-1">
              No tasks for this user &amp; project combination.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
