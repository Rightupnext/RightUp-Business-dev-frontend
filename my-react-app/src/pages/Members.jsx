import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Trash2 } from "lucide-react"; // DELETE ICON

const API_BASE = import.meta.env.VITE_BASE;

export default function Members() {
  const { token } = useContext(AuthContext);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // ---------------- DELETE MEMBER ----------------
  const deleteMember = async (id) => {
    if (!confirm("Are you sure you want to delete this user?")) return;

    try {
      await axios.delete(`${API_BASE}/auth/delete/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      fetchMembers(); // refresh list
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Failed to delete user.");
    }
  };

  // ---------------- FETCH MEMBERS ----------------
  const fetchMembers = async () => {
    try {
      const res = await axios.get(`${API_BASE}/profile/all-project-users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMembers(res.data);
    } catch (err) {
      console.error("Error fetching members:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, [token]);

  return (
    <div className="min-h-screen bg-white mt-20 p-6">
      <h1 className="text-xl font-semibold mb-4">Project Members</h1>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="w-full overflow-x-auto border border-gray-200 rounded-xl shadow-sm bg-white no-scrollbar">
          <table className="min-w-full border-collapse text-sm">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                {[
                  "Employee ID",
                  "Name",
                  "Role",
                  "Email",
                  "Address",
                  "Blood Group",
                  "Action",
                ].map((header) => (
                  <th
                    key={header}
                    className="border-b border-gray-300 px-4 py-3 text-left whitespace-nowrap"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {members.length > 0 ? (
                members.map((member) => (
                  <tr
                    key={member._id}
                    className="hover:bg-gray-50 transition-colors border-t border-gray-100"
                  >
                    <td className="px-4 py-3 text-gray-700 whitespace-nowrap">
                      {member.employeeId || "-"}
                    </td>

                    <td
                      onClick={() =>
                        navigate(
                          `/business/business-user-projects/${member._id}`
                        )
                      }
                      className="px-4 py-3 text-blue-600 cursor-pointer hover:underline whitespace-nowrap"
                    >
                      {member.name || "-"}
                    </td>

                    <td className="px-4 py-3 text-gray-700 whitespace-nowrap">
                      {member.emp_role || "-"}
                    </td>

                    <td className="px-4 py-3 text-gray-700 whitespace-nowrap">
                      {member.email || "-"}
                    </td>

                    <td className="px-4 py-3 text-gray-700 whitespace-nowrap">
                      {member.address || "-"}
                    </td>

                    <td className="px-4 py-3 text-gray-700 whitespace-nowrap">
                      {member.bloodGroup || "-"}
                    </td>

                    {/* ------------ DELETE ICON BUTTON ------------ */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <button
                        onClick={() => deleteMember(member._id)}
                        className="p-2 rounded-full hover:bg-red-100 transition"
                      >
                        <Trash2 className="w-5 h-5 text-red-600" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="7"
                    className="px-4 py-6 text-center text-gray-500 border-t border-gray-200"
                  >
                    No project members found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
