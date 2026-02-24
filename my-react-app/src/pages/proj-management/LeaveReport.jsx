import React, { useEffect, useState } from "react";
import axios from "axios";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const API_BASE = import.meta.env.VITE_BASE;

// get all days in the month
const getDaysInMonth = (year, month) => {
  const days = [];
  const totalDays = new Date(year, month, 0).getDate();

  for (let i = 1; i <= totalDays; i++) {
    const formatted = `${year}-${String(month).padStart(2, "0")}-${String(
      i
    ).padStart(2, "0")}`;
    days.push(formatted);
  }
  return days;
};

const LeaveReport = () => {
  const [userId, setUserId] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [days, setDays] = useState([]);
  const [reportData, setReportData] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🔹 Get logged user automatically
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token =
          sessionStorage.getItem("token") || localStorage.getItem("token");

        if (!token) {
          setLoading(false);
          return;
        }

        const res = await axios.get(`${API_BASE}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        // Backend returns { user: { _id, ... } }
        if (res.data?.user?._id) {
          setUserId(res.data.user._id);
        } else {
          setLoading(false);
        }
      } catch (err) {
        console.error("Failed to fetch logged user", err);
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  // 🔹 Fetch attendance + permissions for that user
  useEffect(() => {
    if (!userId) return;

    const fetchReports = async () => {
      try {
        setLoading(true);

        const token =
          sessionStorage.getItem("token") || localStorage.getItem("token");

        const year = selectedDate.getFullYear();
        const month = selectedDate.getMonth() + 1;

        setDays(getDaysInMonth(year, month));

        const [attendanceRes, permissionRes] = await Promise.all([
          axios.get(`${API_BASE}/reports/monthly/${userId}/${month}/${year}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(
            `${API_BASE}/permissions/monthly/${userId}/${month}/${year}`,
            { headers: { Authorization: `Bearer ${token}` } }
          ),
        ]);

        setReportData(attendanceRes.data || []);
        setPermissions(permissionRes.data || []);
      } catch (err) {
        console.error("Failed fetching leave report", err);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, [userId, selectedDate]);

  // helpers
  const getAttendanceByDate = (day) =>
    reportData.find((r) => r.date === day);

  const getPermissionByDate = (day) =>
    permissions.find((p) => p.date === day);

  const isSunday = (dateString) => new Date(dateString).getDay() === 0;

  const isFirstOrThirdSaturday = (dateString) => {
    const d = new Date(dateString);
    if (d.getDay() !== 6) return false;
    const weekNumber = Math.ceil(d.getDate() / 7);
    return weekNumber === 1 || weekNumber === 3;
  };

  const getStatusInfo = (day) => {
    const attendance = getAttendanceByDate(day);
    const weekend = isSunday(day) || isFirstOrThirdSaturday(day);

    if (attendance && attendance.timeIn)
      return { label: "Present", className: "bg-green-500 text-white" };

    return { label: "Leave", className: weekend ? "bg-blue-400 text-white" : "bg-red-500 text-white" };
  };

  const getDayName = (dateString) =>
    new Date(dateString).toLocaleDateString("en-IN", {
      weekday: "long",
      timeZone: "Asia/Kolkata",
    });

  return (
    <div className="max-w-3xl mt-20 mx-auto p-4 sm:p-6">
      <h2 className="text-2xl font-semibold mb-6">My Monthly Report</h2>

      <div className="mb-6">
        <DatePicker
          selected={selectedDate}
          onChange={(date) => setSelectedDate(date)}
          dateFormat="MM/yyyy"
          showMonthYearPicker
          className="border-2 border-black p-2 rounded-lg bg-[#2563eb] text-white text-lg font-bold w-48 text-center cursor-pointer shadow-md"
        />
      </div>

      <div className="border rounded-lg bg-white shadow overflow-hidden">
        {loading ? (
          <div className="p-12 flex justify-center items-center flex-col gap-3">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-500 font-medium">Fetching Report...</p>
          </div>
        ) : days.length === 0 ? (
          <div className="p-10 text-center text-gray-400">
            <p className="text-lg">No data found for this period</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {days.map((day, i) => {
              const statusInfo = getStatusInfo(day);
              const permission = getPermissionByDate(day);
              const formatted = new Date(day).toLocaleDateString("en-GB");

              return (
                <div key={i} className="p-4 sm:p-6 hover:bg-gray-50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="text-lg font-bold text-gray-800">
                      {formatted}
                    </div>
                    <div className="text-sm text-gray-500 font-medium uppercase tracking-wider">
                      {getDayName(day)}
                    </div>
                  </div>

                  <div className="flex flex-col sm:items-end gap-2">
                    <span className={`${statusInfo.className} px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest shadow-sm w-fit`}>
                      {statusInfo.label}
                    </span>

                    {permission && (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm text-yellow-800 shadow-sm min-w-[200px]">
                        <div className="font-bold flex items-center gap-1.5 mb-1">
                          <span>⏰</span> Permission
                        </div>
                        <div className="flex justify-between mb-1">
                          <span>{permission.permissionIn}</span>
                          <span className="text-yellow-400">→</span>
                          <span>{permission.permissionOut}</span>
                        </div>
                        <div className="text-xs italic text-yellow-600 border-t border-yellow-200 mt-1 pt-1">
                          {permission.reason}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default LeaveReport;
