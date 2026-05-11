import React, { useState, useEffect, useContext, useRef } from "react";
import axios from "axios";
import { Trash2, Upload, FileText, Eye } from "lucide-react";
import InputField from "../../components/InputField";
import Button from "../../components/Button";
import { AuthContext } from "../../context/AuthContext";
import toast, { Toaster } from "react-hot-toast";

const API_BASE = import.meta.env.VITE_BASE;

export default function ProjectHandle() {
  const { token, user } = useContext(AuthContext); // ✅ use user info
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    if (user?._id) fetchProjects();
  }, [user]);

  // ✅ Fetch only this user's projects
  const fetchProjects = async () => {
    try {
      const res = await axios.get(`${API_BASE}/projects/user/${user._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProjects(res.data);
    } catch (err) {
      console.error("Error fetching projects:", err);
      toast.error("Failed to load projects");
    }
  };

  // ✅ Add new blank project
  const handleAddProject = () => {
    setProjects([
      ...projects,
      {
        projectName: "",
        projectType: "",
        startDate: "",
        endDate: "",
        requirements: "",
        status: "Inprogress",
        user: user._id, // ✅ attach user ID
        isNew: true,
      },
    ]);
    toast.success("New project section added");
  };

  const handleChange = (index, field, value) => {
    const updated = [...projects];
    updated[index][field] = value;
    setProjects(updated);
  };

  // ✅ Delete project
  const handleDelete = async (id, index) => {
    try {
      if (id) {
        await axios.delete(`${API_BASE}/projects/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success("Project deleted successfully");
      } else {
        toast("Removed unsaved project section", { icon: "🗑️" });
      }
      setProjects(projects.filter((_, i) => i !== index));
    } catch (err) {
      console.error("Error deleting project:", err);
      toast.error("Failed to delete project");
    }
  };

  // ✅ Save or update project
  const handleSave = async (project, index) => {
    try {
      const formData = new FormData();
      formData.append("projectName", project.projectName);
      formData.append("projectType", project.projectType);
      formData.append("startDate", project.startDate);
      formData.append("endDate", project.endDate);
      formData.append("requirements", project.requirements);
      formData.append("status", project.status);
      formData.append("user", user._id);

      // Append files if any
      if (project.files) {
        project.files.forEach((file) => {
          formData.append("files", file);
        });
      }

      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      };

      if (project._id) {
        const res = await axios.put(
          `${API_BASE}/projects/${project._id}`,
          formData,
          config
        );
        const updated = [...projects];
        updated[index] = res.data;
        setProjects(updated);
        toast.success("Project updated successfully");
      } else {
        const res = await axios.post(`${API_BASE}/projects`, formData, config);

        const updated = [...projects];
        updated[index] = res.data;
        setProjects(updated);
        toast.success("Project saved successfully");
      }
    } catch (err) {
      console.error("Error saving project:", err);
      toast.error("Failed to save project");
    }
  };

  const handleFileChange = (index, e) => {
    const selectedFiles = Array.from(e.target.files);
    const updated = [...projects];
    updated[index].files = [...(updated[index].files || []), ...selectedFiles];
    setProjects(updated);
  };

  const handleViewFile = (filePath) => {
    window.open(`${API_BASE}${filePath}`, "_blank");
  };

  const handleDeleteFile = async (projectId, filePath, projectIndex) => {
    if (!window.confirm("Are you sure you want to delete this file?")) return;
    try {
      const res = await axios.delete(`${API_BASE}/projects/${projectId}/file`, {
        headers: { Authorization: `Bearer ${token}` },
        data: { filePath },
      });
      const updated = [...projects];
      updated[projectIndex] = res.data.project;
      setProjects(updated);
      toast.success("File deleted successfully");
    } catch (err) {
      console.error("Error deleting file:", err);
      toast.error("Failed to delete file");
    }
  };

  return (
    <div className="p-6 mt-16">
      <Toaster position="top-right" reverseOrder={false} />

      <h2 className="text-2xl font-semibold mb-4">Project Management</h2>

      <button
        onClick={handleAddProject}
        className="bg-blue-600 text-white px-3 py-1 rounded mb-4 text-sm hover:bg-blue-700"
      >
        Add
      </button>

      <div className="space-y-6">
        {projects.map((project, index) => (
          <div
            key={index}
            className="relative border rounded-md p-4 shadow-md bg-white"
          >
            {/* Status Label */}
            <div
              className={`absolute top-2 right-10 px-3 py-1 text-xs font-semibold rounded ${project.status === "Completed"
                ? "bg-green-500 text-white"
                : "bg-red-500 text-white"
                }`}
            >
              {project.status}
            </div>

            {/* Delete Icon */}
            <button
              onClick={() => handleDelete(project._id, index)}
              className="absolute top-2 right-2 text-gray-500 hover:text-red-600"
            >
              <Trash2 size={16} />
            </button>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium">Project Name *</label>
                <InputField
                  type="text"
                  value={project.projectName}
                  onChange={(e) =>
                    handleChange(index, "projectName", e.target.value)
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium">Project Type *</label>
                <InputField
                  type="text"
                  value={project.projectType}
                  onChange={(e) =>
                    handleChange(index, "projectType", e.target.value)
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium">Start Date *</label>
                <InputField
                  type="date"
                  value={project.startDate}
                  onChange={(e) =>
                    handleChange(index, "startDate", e.target.value)
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium">End Date *</label>
                <InputField
                  type="date"
                  value={project.endDate}
                  onChange={(e) =>
                    handleChange(index, "endDate", e.target.value)
                  }
                />
              </div>

              <div className="sm:col-span-1">
                <label className="block text-sm font-medium">Requirements *</label>
                <div className="flex gap-2 items-start mt-1">
                  <textarea
                    value={project.requirements}
                    onChange={(e) =>
                      handleChange(index, "requirements", e.target.value)
                    }
                    className="border w-full p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400 min-h-[100px]"
                    placeholder="Enter project requirements..."
                  />
                  <div className="flex flex-col gap-2">
                    <label className="cursor-pointer bg-gray-100 p-2 rounded hover:bg-gray-200 border transition-colors shadow-sm">
                      <Upload size={20} className="text-blue-600" />
                      <input
                        type="file"
                        multiple
                        className="hidden"
                        onChange={(e) => handleFileChange(index, e)}
                        accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                      />
                    </label>
                  </div>
                </div>

                {/* File List */}
                <div className="mt-3 space-y-2">
                  {/* Existing Files */}
                  {project.requirementFiles?.map((file, fIdx) => (
                    <div
                      key={`exist-${fIdx}`}
                      className="flex items-center justify-between bg-blue-50 p-2 rounded border border-blue-100"
                    >
                      <div className="flex items-center gap-2 overflow-hidden">
                        <FileText size={16} className="text-blue-500 shrink-0" />
                        <span className="text-xs truncate text-blue-700">
                          {file.split("/").pop()}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleViewFile(file)}
                          className="text-blue-600 hover:text-blue-800 p-1"
                          title="View File"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteFile(project._id, file, index)}
                          className="text-red-500 hover:text-red-700 p-1"
                          title="Delete File"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}

                  {/* Newly Selected Files */}
                  {project.files?.map((file, fIdx) => (
                    <div
                      key={`new-${fIdx}`}
                      className="flex items-center justify-between bg-green-50 p-2 rounded border border-green-100"
                    >
                      <div className="flex items-center gap-2 overflow-hidden">
                        <FileText size={16} className="text-green-500 shrink-0" />
                        <span className="text-xs truncate text-green-700">
                          {file.name} (Pending)
                        </span>
                      </div>
                      <button
                        onClick={() => {
                          const updated = [...projects];
                          updated[index].files = updated[index].files.filter(
                            (_, i) => i !== fIdx
                          );
                          setProjects(updated);
                        }}
                        className="text-red-500 hover:text-red-700 p-1"
                        title="Remove"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium">Status *</label>
                <select
                  value={project.status}
                  onChange={(e) =>
                    handleChange(index, "status", e.target.value)
                  }
                  className="border w-full p-2 rounded focus:ring-2 focus:ring-blue-400"
                >
                  <option value="Inprogress">Inprogress </option>
                  <option value="Completed">Completed</option>
                </select>
              </div>

              <div className="flex items-end">
                <Button
                  text={project._id ? "Update" : "Save"}
                  onClick={() => handleSave(project, index)}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
