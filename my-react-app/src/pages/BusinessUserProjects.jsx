import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import InputField from "../components/InputField";
import toast, { Toaster } from "react-hot-toast";

const API_BASE = import.meta.env.VITE_BASE;

export default function BusinessUserProjects() {
const { id } = useParams(); // get member ID from URL
const { token } = useContext(AuthContext);
const [projects, setProjects] = useState([]);
const [member, setMember] = useState(null);
const [loading, setLoading] = useState(true);
const navigate = useNavigate();

useEffect(() => {
if (id && token) {
fetchMemberProjects();
fetchMemberInfo();
}
}, [id, token]);

const fetchMemberProjects = async () => {
try {
const res = await axios.get(`${API_BASE}/projects/user/${id}`, {
headers: { Authorization: `Bearer ${token}` },
});
setProjects(res.data);
} catch (err) {
console.error("Error fetching user projects:", err);
toast.error("Failed to load user's projects");
} finally {
setLoading(false);
}
};

const fetchMemberInfo = async () => {
try {
const res = await axios.get(`${API_BASE}/profile/me`, {
headers: { Authorization: `Bearer ${token}` },
});
setMember(res.data);
} catch (err) {
console.error("Error fetching member details:", err);
}
};

return ( <div className="p-6 mt-16 bg-white min-h-screen"> <Toaster position="top-right" reverseOrder={false} />


  <div
    onClick={() => navigate(-1)}
    className="text-blue-600 hover:text-blue-800 cursor-pointer mb-6"
  >
    ← Back
  </div>

  <h2 className="text-2xl font-semibold mb-2">Projects Handled</h2>
 

  {loading ? (
    <p className="text-gray-500"></p>
  ) : projects.length === 0 ? (
    <p className="text-gray-500">No projects found for this member.</p>
  ) : (
    <div className="space-y-6">
      {projects.map((project) => (
        <div
          key={project._id}
          className="border rounded-md p-4 shadow-md bg-white relative"
        >
          <div
            className={`absolute top-2 right-3 px-3 py-1 text-xs font-semibold rounded ${
              project.status === "Completed"
                ? "bg-green-500 text-white"
                : "bg-yellow-500 text-white"
            }`}
          >
            {project.status}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-sm font-medium">Project Name</label>
              <InputField
                type="text"
                value={project.projectName || ""}
                readOnly
              />
            </div>

            <div>
              <label className="block text-sm font-medium">Project Type</label>
              <InputField
                type="text"
                value={project.projectType || ""}
                readOnly
              />
            </div>

            <div>
              <label className="block text-sm font-medium">Start Date</label>
              <InputField
                type="date"
                value={project.startDate?.slice(0, 10) || ""}
                readOnly
              />
            </div>

            <div>
              <label className="block text-sm font-medium">End Date</label>
              <InputField
                type="date"
                value={project.endDate?.slice(0, 10) || ""}
                readOnly
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-medium">Requirements</label>
              <InputField
                type="text"
                value={project.requirements || ""}
                readOnly
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  )}
</div>


);
}
