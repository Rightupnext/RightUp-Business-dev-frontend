import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { Trash2 } from "lucide-react";
import InputField from "../../components/InputField";
import Button from "../../components/Button";
import { AuthContext } from "../../context/AuthContext";
import toast, { Toaster } from "react-hot-toast";

const API_BASE = import.meta.env.VITE_BASE;

export default function ProjectHandle() {
  const { token } = useContext(AuthContext);
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    fetchProjects();
  }, []);

  // ✅ Fetch Projects
  const fetchProjects = async () => {
    try {
      const res = await axios.get(`${API_BASE}/projects`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProjects(res.data);
      
    } catch (err) {
      console.error("Error fetching projects:", err);
     
    }
  };

  // ✅ Add new project section
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

  // ✅ Save or Update project
  const handleSave = async (project, index) => {
    try {
      if (project._id) {
        // Update existing
        const res = await axios.put(
          `${API_BASE}/projects/${project._id}`,
          project,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const updated = [...projects];
        updated[index] = res.data;
        setProjects(updated);
        toast.success("Project updated successfully");
      } else {
        // Create new
        const res = await axios.post(`${API_BASE}/projects`, project, {
          headers: { Authorization: `Bearer ${token}` },
        });
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

  return (
    <div className="p-6 mt-16">
      {/* Toaster */}
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
              className={`absolute top-2 right-10 px-3 py-1 text-xs font-semibold rounded ${
                project.status === "Completed"
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
                <label className="block text-sm font-medium">Project Name</label>
                <InputField
                  type="text"
                  value={project.projectName}
                  onChange={(e) =>
                    handleChange(index, "projectName", e.target.value)
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium">Project Type</label>
                <InputField
                  type="text"
                  value={project.projectType}
                  onChange={(e) =>
                    handleChange(index, "projectType", e.target.value)
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium">Start Date</label>
                <InputField
                  type="date"
                  value={project.startDate}
                  onChange={(e) =>
                    handleChange(index, "startDate", e.target.value)
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium">End Date</label>
                <InputField
                  type="date"
                  value={project.endDate}
                  onChange={(e) =>
                    handleChange(index, "endDate", e.target.value)
                  }
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-sm font-medium">
                  Requirements
                </label>
                <InputField
                  type="text"
                  value={project.requirements}
                  onChange={(e) =>
                    handleChange(index, "requirements", e.target.value)
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium">Status</label>
                <select
                  value={project.status}
                  onChange={(e) =>
                    handleChange(index, "status", e.target.value)
                  }
                  className="border w-full p-2 rounded focus:ring-2 focus:ring-blue-400"
                >
                  <option value="Inprogress">Inprogress</option>
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
