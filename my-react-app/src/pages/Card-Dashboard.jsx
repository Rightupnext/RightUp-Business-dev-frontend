import React, { useState, useContext } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { AuthContext } from "../context/AuthContext";

const API_BASE = import.meta.env.VITE_BASE;

const CardDashboard = () => {
  const { token } = useContext(AuthContext);
  const [projects, setProjects] = useState([]);
  const [selectedType, setSelectedType] = useState("");
  const [showModal, setShowModal] = useState(false);

  const [editProject, setEditProject] = useState(null);

  // Fetch projects based on type (Website, App, Digital Marketing)
  const handleCardClick = async (type) => {
    try {
      setSelectedType(type);
      setShowModal(true);
      const res = await axios.get(`${API_BASE}/projects/category/${type}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProjects(res.data);
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch projects");
    }
  };

  // Update project
  const handleUpdate = async (id, updatedData) => {
    try {
      const res = await axios.put(`${API_BASE}/projects/${id}`, updatedData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProjects((prev) =>
        prev.map((p) => (p._id === id ? res.data : p))
      );
      toast.success("Project updated");
      setEditProject(null);
    } catch {
      toast.error("Update failed");
    }
  };

  // Delete project
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this project?")) return;
    try {
      await axios.delete(`${API_BASE}/projects/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProjects((prev) => prev.filter((p) => p._id !== id));
      toast.success("Deleted successfully");
    } catch {
      toast.error("Failed to delete project");
    }
  };

  return (
    <div className="p-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 mt-20 lg:grid-cols-3 gap-6">
        {["Website", "App", "Digital Marketing"].map((type) => (
          <div
            key={type}
            onClick={() => handleCardClick(type)}
            className="cursor-pointer border border-gray-300 rounded-lg p-6 text-center hover:shadow-lg transition-all bg-white"
          >
            <h3 className="text-lg font-semibold text-gray-800">{type}</h3>
            <p className="text-gray-500 mt-2">View related projects</p>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white w-11/12 md:w-3/4 lg:w-2/3 p-6 rounded-xl shadow-lg max-h-[85vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">
                {selectedType} Projects ({projects.length})
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-red-500 font-semibold hover:text-red-700"
              >
                ✕ Close
              </button>
            </div>

            {projects.length > 0 ? (
              projects.map((proj) => (
                <div
                  key={proj._id}
                  className="border p-4 mb-4 rounded-lg shadow-sm bg-gray-50"
                >
                  {editProject === proj._id ? (
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        handleUpdate(proj._id, proj);
                      }}
                    >
                      <div className="grid md:grid-cols-2 gap-3">
                        <div>
                          <label>Project Name</label>
                          <input
                            className="w-full border rounded px-3 py-1"
                            value={proj.projectName}
                            onChange={(e) =>
                              setProjects((prev) =>
                                prev.map((p) =>
                                  p._id === proj._id
                                    ? { ...p, projectName: e.target.value }
                                    : p
                                )
                              )
                            }
                          />
                        </div>
                        <div>
                          <label>Project Type</label>
                          <input
                            className="w-full border rounded px-3 py-1"
                            value={proj.projectType}
                            onChange={(e) =>
                              setProjects((prev) =>
                                prev.map((p) =>
                                  p._id === proj._id
                                    ? { ...p, projectType: e.target.value }
                                    : p
                                )
                              )
                            }
                          />
                        </div>
                        <div>
                          <label>Start Date</label>
                          <input
                            type="text"
                            className="w-full border rounded px-3 py-1"
                            value={proj.startDate}
                            onChange={(e) =>
                              setProjects((prev) =>
                                prev.map((p) =>
                                  p._id === proj._id
                                    ? { ...p, startDate: e.target.value }
                                    : p
                                )
                              )
                            }
                          />
                        </div>
                        <div>
                          <label>End Date</label>
                          <input
                            type="text"
                            className="w-full border rounded px-3 py-1"
                            value={proj.endDate}
                            onChange={(e) =>
                              setProjects((prev) =>
                                prev.map((p) =>
                                  p._id === proj._id
                                    ? { ...p, endDate: e.target.value }
                                    : p
                                )
                              )
                            }
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label>Requirements</label>
                          <input
                            className="w-full border rounded px-3 py-1"
                            value={proj.requirements}
                            onChange={(e) =>
                              setProjects((prev) =>
                                prev.map((p) =>
                                  p._id === proj._id
                                    ? { ...p, requirements: e.target.value }
                                    : p
                                )
                              )
                            }
                          />
                        </div>
                        <div className="flex justify-between items-center mt-3">
                          <select
                            value={proj.status}
                            onChange={(e) =>
                              setProjects((prev) =>
                                prev.map((p) =>
                                  p._id === proj._id
                                    ? { ...p, status: e.target.value }
                                    : p
                                )
                              )
                            }
                            className="border rounded px-3 py-1"
                          >
                            <option>Inprogress</option>
                            <option>Completed</option>
                          </select>
                          <button
                            type="submit"
                            className="bg-blue-600 text-white px-4 py-1 rounded"
                          >
                            Update
                          </button>
                        </div>
                      </div>
                    </form>
                  ) : (
                    <div>
                      <div className="flex justify-between items-center">
                        <h3 className="font-semibold">{proj.projectName}</h3>
                        <div className="flex gap-2">
                          <button
                            onClick={() => setEditProject(proj._id)}
                            className="text-blue-600 hover:underline"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(proj._id)}
                            className="text-red-600 hover:underline"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600">
                        {proj.projectType} | {proj.startDate} → {proj.endDate}
                      </p>
                      <p className="text-gray-700 mt-1">
                        {proj.requirements || "No requirements provided"}
                      </p>
                      <span
                        className={`inline-block mt-2 px-3 py-1 text-sm rounded ${
                          proj.status === "Completed"
                            ? "bg-green-500 text-white"
                            : "bg-yellow-500 text-white"
                        }`}
                      >
                        {proj.status}
                      </span>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <p className="text-center text-gray-600 py-10">
                No {selectedType} projects found.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CardDashboard;
