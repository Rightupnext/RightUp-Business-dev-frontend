import React, { useState, useContext, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { AuthContext } from "../context/AuthContext";

const API_BASE = import.meta.env.VITE_BASE;

const CardDashboard = () => {
  const { token } = useContext(AuthContext);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  /** ✅ Fetch all projects from backend */
  useEffect(() => {
    if (!token) return;

    const fetchAllProjects = async () => {
      try {
        const res = await axios.get(`${API_BASE}/projects`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log("✅ All Projects:", res.data);
        setProjects(res.data);
      } catch (err) {
        console.error("❌ Error fetching projects:", err);
        toast.error("Failed to load projects");
      } finally {
        setLoading(false);
      }
    };

    fetchAllProjects();
  }, [token]);

  return (
    <div className=" mt-20">
      <h2 className="text-xl font-semibold text-gray-800 mb-6">
        All Projects (All Users)
      </h2>

      {loading ? (
        <p className="text-center text-gray-500 py-8">Loading projects...</p>
      ) : projects.length === 0 ? (
        <p className="text-center text-gray-500 py-8">No projects found.</p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-gray-300 shadow-md bg-white">
          <table className="min-w-full border-collapse text-sm">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                <th className="border-b border-gray-300 px-4 py-3 text-left">#</th>
                <th className="border-b border-gray-300 px-4 py-3 text-left">User Name</th>
                <th className="border-b border-gray-300 px-4 py-3 text-left">Email</th>
                <th className="border-b border-gray-300 px-4 py-3 text-left">Project Name</th>
                <th className="border-b border-gray-300 px-4 py-3 text-left">Type</th>
                <th className="border-b border-gray-300 px-4 py-3 text-left">Start Date</th>
                <th className="border-b border-gray-300 px-4 py-3 text-left">End Date</th>
                <th className="border-b border-gray-300 px-4 py-3 text-left">Requirements</th>
                <th className="border-b border-gray-300 px-4 py-3 text-left">Status</th>
              </tr>
            </thead>

            <tbody>
              {projects.map((proj, index) => (
                <tr key={proj._id} className="hover:bg-gray-50 transition">
                  <td className="border-b border-gray-200 px-4 py-3">{index + 1}</td>
                  <td className="border-b border-gray-200 px-4 py-3 font-medium">
                    {proj.user?.name || "—"}
                  </td>
                  <td className="border-b border-gray-200 px-4 py-3">
                    {proj.user?.email || "—"}
                  </td>
                  <td className="border-b border-gray-200 px-4 py-3 font-semibold">
                    {proj.projectName}
                  </td>
                  <td className="border-b border-gray-200 px-4 py-3">
                    {proj.projectType}
                  </td>
                  <td className="border-b border-gray-200 px-4 py-3">
                    {proj.startDate}
                  </td>
                  <td className="border-b border-gray-200 px-4 py-3">
                    {proj.endDate}
                  </td>
                  <td className="border-b border-gray-200 px-4 py-3 max-w-xs truncate">
                    {proj.requirements || "—"}
                  </td>
                  <td className="border-b border-gray-200 px-4 py-3">
                    <span
                      className={`px-3 py-1 text-xs rounded-full ${
                        proj.status === "Completed"
                          ? "bg-green-500 text-white"
                          : "bg-yellow-500 text-white"
                      }`}
                    >
                      {proj.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default CardDashboard;
