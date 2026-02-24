import React, { useState, useEffect } from "react";
import axios from "axios";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { calculateLiveWorkingHours } from "../utils/timeUtils";

const API_BASE = import.meta.env.VITE_BASE;

// Get all days of month till today
const getDaysInMonth = (year, month) => {
  const days = [];
  const totalDays = new Date(year, month, 0).getDate();
  const today = new Date();

  for (let i = 1; i <= totalDays; i++) {
    const date = new Date(year, month - 1, i);
    if (date > today) break;

    const formatted = `${year}-${String(month).padStart(2, "0")}-${String(
      i
    ).padStart(2, "0")}`;

    days.push(formatted);
  }
  return days;
};

const MonthlyReport = () => {
  const [members, setMembers] = useState([]);
  const [selectedMember, setSelectedMember] = useState("");
  const [reportData, setReportData] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [days, setDays] = useState([]);
  const [permissions, setPermissions] = useState([]);

  // Fetch Members
  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const token =
          sessionStorage.getItem("token") || localStorage.getItem("token");

        const res = await axios.get(
          `${API_BASE}/profile/all-project-users`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setMembers(res.data || []);
      } catch (err) {
        console.error("Failed to fetch members", err);
      }
    };

    fetchMembers();
  }, []);

  // Fetch Attendance + Permissions
  useEffect(() => {
    if (!selectedMember) return;

    const token =
      sessionStorage.getItem("token") || localStorage.getItem("token");

    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth() + 1;

    setDays(getDaysInMonth(year, month));

    axios
      .get(`${API_BASE}/permissions/monthly/${selectedMember}/${month}/${year}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setPermissions(res.data || []))
      .catch(console.error);

    axios
      .get(`${API_BASE}/reports/monthly/${selectedMember}/${month}/${year}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setReportData(res.data || []))
      .catch(console.error);

  }, [selectedMember, selectedDate]);

  // Sunday check
  const isSunday = (dateString) => {
    const d = new Date(dateString);
    return d.getDay() === 0;
  };

  // 1st & 3rd Saturday check
  const isFirstOrThirdSaturday = (dateString) => {
    const d = new Date(dateString);
    if (d.getDay() !== 6) return false;
    const weekNumber = Math.ceil(d.getDate() / 7);
    return weekNumber === 1 || weekNumber === 3;
  };

  const getAttendanceByDate = (day) => {
    return reportData.find((r) => r.date === day);
  };

  const getPermissionByDate = (day) => {
    return permissions.find((p) => p.date === day);
  };

  // FINAL STATUS LOGIC
  const getStatusInfo = (day) => {
    const attendance = getAttendanceByDate(day);
    const weekend = isSunday(day) || isFirstOrThirdSaturday(day);

    if (attendance && attendance.timeIn) {
      return { label: "Present", className: "bg-green-500 text-white" };
    }

    if (weekend) {
      return { label: "Leave", className: "bg-blue-400 text-white" };
    }

    return { label: "Leave", className: "bg-red-500 text-white" };
  };

  const getDayName = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", {
      weekday: "long",
      timeZone: "Asia/Kolkata",
    });
  };

  return (
    <div className="max-w-3xl mt-20 mx-auto p-4 sm:p-6">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">
        Monthly Report
      </h2>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <select
          value={selectedMember}
          onChange={(e) => setSelectedMember(e.target.value)}
          className="border rounded-md p-2 bg-white text-black"
        >
          <option value="">Select Member</option>
          {members.map((m) => (
            <option key={m._id} value={m._id}>
              {m.name}
            </option>
          ))}
        </select>

        <DatePicker
          selected={selectedDate}
          onChange={(date) => setSelectedDate(date)}
          dateFormat="MM/yyyy"
          showMonthYearPicker
          className="border p-2 rounded-md bg-blue-500 text-white cursor-pointer"
        />
      </div>

      {/* Table */}
      <div className="border rounded-lg overflow-hidden shadow-sm bg-white">
        {days.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            No past days to show
          </div>
        ) : (
          days.map((day, i) => {
            const statusInfo = getStatusInfo(day);
            const permission = getPermissionByDate(day);
            const formatted = new Date(day).toLocaleDateString("en-GB");
            const dayName = getDayName(day);

            return (
              <div key={i} className="border-b p-4 space-y-2 hover:bg-gray-50 relative">
                <div className="flex justify-between items-start">
                  <div className="font-medium text-gray-700">
                    {formatted} —{" "}
                    <span className="text-sm text-gray-500">{dayName}</span>
                  </div>
                  {statusInfo.label === "Present" && (
                    <div className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded border border-blue-100">
                      Working Hours: {calculateLiveWorkingHours(getAttendanceByDate(day))}
                    </div>
                  )}
                </div>

                {/* STATUS */}
                <span className={`${statusInfo.className} px-3 py-1 rounded`}>
                  {statusInfo.label}
                </span>

                {/* PERMISSION */}
                {permission && (
                  <div className="bg-yellow-50 border rounded p-3 text-sm">
                    <div>⏰ Permission In: {permission.permissionIn || "-"}</div>
                    <div>⏰ Permission Out: {permission.permissionOut || "-"}</div>
                    {permission.reason && <div>📝 {permission.reason}</div>}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default MonthlyReport;
