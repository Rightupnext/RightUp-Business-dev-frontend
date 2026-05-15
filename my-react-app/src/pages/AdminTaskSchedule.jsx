// src/pages/Schedule/AdminTaskSchedule.jsx

import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import { getUsersApi } from "./Analytics/useAnalyticsApi";

const AdminTaskSchedule = () => {
  const { token } = useContext(AuthContext);

  const API_BASE = import.meta.env.VITE_BASE;

  const headers = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  // =========================
  // STATES
  // =========================
  const [showModal, setShowModal] = useState(false);

  const [employees, setEmployees] = useState([]);

  const [schedules, setSchedules] = useState([]);

  const [loading, setLoading] = useState(false);

  const [loadingList, setLoadingList] = useState(false);

  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    scheduleDate: "",
    startTime: "",
    endTime: "",
    priority: "medium",
    status: "pending",
    assignedTo: "",
  });

  // =========================
  // LOAD USERS
  // =========================
  useEffect(() => {
    loadUsers();
    fetchSchedules();
  }, []);

  const loadUsers = async () => {
    try {
      const data = await getUsersApi(token);
      setEmployees(data || []);
    } catch (err) {
      console.log(err);
    }
  };

  // =========================
  // FETCH SCHEDULES
  // =========================
  const fetchSchedules = async () => {
    try {
      setLoadingList(true);

      const res = await axios.get(
        `${API_BASE}/schedules`,
        headers
      );

      setSchedules(res.data?.schedules || []);
    } catch (err) {
      console.log(err);
    } finally {
      setLoadingList(false);
    }
  };

  // =========================
  // HANDLE CHANGE
  // =========================
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // =========================
  // CREATE / UPDATE
  // =========================
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      if (editingId) {
        await axios.patch(
          `${API_BASE}/schedules/${editingId}`,
          formData,
          headers
        );

        alert("Schedule Updated Successfully");
      } else {
        await axios.post(
          `${API_BASE}/schedules`,
          formData,
          headers
        );

        alert("Schedule Created Successfully");
      }

      // RESET
      setFormData({
        title: "",
        description: "",
        scheduleDate: "",
        startTime: "",
        endTime: "",
        priority: "medium",
        status: "pending",
        assignedTo: "",
      });

      setEditingId(null);

      setShowModal(false);

      fetchSchedules();
    } catch (err) {
      console.log(err);

      alert(
        err?.response?.data?.message ||
          "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // EDIT
  // =========================
  const handleEdit = (item) => {
    setEditingId(item._id);

    setFormData({
      title: item.title || "",
      description: item.description || "",
      scheduleDate: item.scheduleDate || "",
      startTime: item.startTime || "",
      endTime: item.endTime || "",
      priority: item.priority || "medium",
      status: item.status || "pending",
      assignedTo:
        item.assignedTo?._id || "",
    });

    setShowModal(true);
  };
const handleDelete = async (id) => {
  const confirmDelete = window.confirm(
    "Are you sure want to delete this schedule?"
  );

  if (!confirmDelete) return;

  try {
    await axios.delete(
      `${API_BASE}/schedules/${id}`,
      headers
    );

    alert("Schedule Deleted Successfully");

    fetchSchedules();
  } catch (err) {
    console.log(err);

    alert(
      err?.response?.data?.message ||
        "Failed to delete schedule"
    );
  }
};
  return (
    <div className="w-full min-h-screen bg-[#f5f7fb] p-5 mt-5">
      {/* TOP */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-3xl font-bold">
            Schedule Management
          </h2>

          <p className="text-gray-500">
            Manage employee schedules
          </p>
        </div>

        <button
          onClick={() => {
            setEditingId(null);

            setFormData({
              title: "",
              description: "",
              scheduleDate: "",
              startTime: "",
              endTime: "",
              priority: "medium",
              status: "pending",
              assignedTo: "",
            });

            setShowModal(true);
          }}
          className="bg-lime-600 hover:bg-lime-700 text-white px-5 py-3 rounded-xl font-semibold"
        >
          + Create Schedule
        </button>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-2xl shadow-md overflow-hidden">
        <div className="overflow-auto">
          <table className="w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="text-left p-4">Title</th>
                <th className="text-left p-4">Employee</th>
                <th className="text-left p-4">Date</th>
                <th className="text-left p-4">Time</th>
                <th className="text-left p-4">Priority</th>
                <th className="text-left p-4">Status</th>
                <th className="text-left p-4">Action</th>
              </tr>
            </thead>

            <tbody>
              {loadingList ? (
                <tr>
                  <td
                    colSpan={7}
                    className="text-center p-5"
                  >
                    Loading...
                  </td>
                </tr>
              ) : schedules.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="text-center p-5"
                  >
                    No schedules found
                  </td>
                </tr>
              ) : (
                schedules.map((item) => (
                  <tr
                    key={item._id}
                    className="border-t"
                  >
                    <td className="p-4 font-medium">
                      {item.title}
                    </td>

                    <td className="p-4">
                      {item.assignedTo?.name}
                    </td>

                    <td className="p-4">
                      {item.scheduleDate}
                    </td>

                    <td className="p-4">
                      {item.startTime} -{" "}
                      {item.endTime}
                    </td>

                    <td className="p-4 capitalize">
                      {item.priority}
                    </td>

                    <td className="p-4 capitalize">
                      {item.status}
                    </td>

                    <td className="p-4">
                      <button
                        onClick={() =>
                          handleEdit(item)
                        }
                        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
                      >
                        Edit
                      </button>
                      <button
      onClick={() => handleDelete(item._id)}
      className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg"
    >
      Delete
    </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-3xl rounded-2xl p-6 relative max-h-[95vh] overflow-auto">
            {/* CLOSE */}
            <button
              onClick={() => setShowModal(false)}
              className="absolute right-4 top-4 text-2xl"
            >
              ✕
            </button>

            <h2 className="text-3xl font-bold mb-1">
              {editingId
                ? "Edit Schedule"
                : "Create Schedule"}
            </h2>

            <p className="text-gray-500 mb-6">
              Assign task schedule to employees
            </p>

            <form onSubmit={handleSubmit}>
              {/* TITLE */}
              <div className="mb-5">
                <label className="block mb-2 font-semibold">
                  Title
                </label>

                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full border rounded-xl px-4 py-3"
                  required
                />
              </div>

              {/* DESCRIPTION */}
              <div className="mb-5">
                <label className="block mb-2 font-semibold">
                  Description
                </label>

                <textarea
                  rows={4}
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className="w-full border rounded-xl px-4 py-3"
                />
              </div>

              {/* DATE TIME */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
                <div>
                  <label className="block mb-2 font-semibold">
                    Date
                  </label>

                  <input
                    type="date"
                    name="scheduleDate"
                    value={formData.scheduleDate}
                    onChange={handleChange}
                    className="w-full border rounded-xl px-4 py-3"
                    required
                  />
                </div>

                <div>
                  <label className="block mb-2 font-semibold">
                    Start Time
                  </label>

                  <input
                    type="time"
                    name="startTime"
                    value={formData.startTime}
                    onChange={handleChange}
                    className="w-full border rounded-xl px-4 py-3"
                  />
                </div>

                <div>
                  <label className="block mb-2 font-semibold">
                    End Time
                  </label>

                  <input
                    type="time"
                    name="endTime"
                    value={formData.endTime}
                    onChange={handleChange}
                    className="w-full border rounded-xl px-4 py-3"
                  />
                </div>
              </div>

              {/* PRIORITY STATUS */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
                <div>
                  <label className="block mb-2 font-semibold">
                    Priority
                  </label>

                  <select
                    name="priority"
                    value={formData.priority}
                    onChange={handleChange}
                    className="w-full border rounded-xl px-4 py-3"
                  >
                    <option value="low">Low</option>
                    <option value="medium">
                      Medium
                    </option>
                    <option value="high">High</option>
                  </select>
                </div>

                <div>
                  <label className="block mb-2 font-semibold">
                    Status
                  </label>

                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="w-full border rounded-xl px-4 py-3"
                  >
                    <option value="pending">
                      Pending
                    </option>
                    <option value="inprogress">
                      In Progress
                    </option>
                    <option value="completed">
                      Completed
                    </option>
                  </select>
                </div>
              </div>

              {/* ASSIGN USER */}
              <div className="mb-6">
                <label className="block mb-2 font-semibold">
                  Assign Employee
                </label>

                <select
                  name="assignedTo"
                  value={formData.assignedTo}
                  onChange={handleChange}
                  className="w-full border rounded-xl px-4 py-3"
                  required
                >
                  <option value="">
                    Select Employee
                  </option>

                  {employees.map((user) => (
                    <option
                      key={user._id}
                      value={user._id}
                    >
                      {user.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* BUTTON */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-lime-600 hover:bg-lime-700 text-white font-bold py-3 rounded-xl"
              >
                {loading
                  ? editingId
                    ? "Updating..."
                    : "Creating..."
                  : editingId
                  ? "Update Schedule"
                  : "Create Schedule"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminTaskSchedule;