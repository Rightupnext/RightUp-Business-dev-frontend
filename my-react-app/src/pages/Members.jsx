import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const API_BASE = import.meta.env.VITE_BASE;

export default function Members() {
  const { token } = useContext(AuthContext);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
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
    fetchMembers();
  }, [token]);

  return (
    <div className="min-h-screen bg-white p-6 mt-15">
      <h1 className="text-lg font-semibold mb-4">Project Members</h1>

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
                  "Profile Image",
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
                members.map((member, idx) => (
                  <tr
                    key={idx}
                    className="hover:bg-gray-50 transition-colors border-t border-gray-100"
                  >
                    <td className="px-4 py-3 text-gray-700 whitespace-nowrap">
                      {member.employeeId || "-"}
                    </td>

                    <td
                      onClick={() =>
                        navigate(`/business-user-projects/${member._id}`)
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

                    <td className="px-4 py-3 text-gray-700 whitespace-nowrap">
                      {member.profileImage ? (
                        <img
                          src={`${API_BASE.replace("/api", "")}/${
                            member.profileImage
                          }`}
                          alt="Profile"
                          className="w-10 h-10 rounded-full object-cover border"
                        />
                      ) : (
                        <span className="text-gray-400 italic">No Image</span>
                      )}
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
