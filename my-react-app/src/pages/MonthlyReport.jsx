import React, { useState, useEffect } from "react";
import axios from "axios";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const API_BASE = import.meta.env.VITE_BASE;

// Utility: Get all past days of a month up to today
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

  // Fetch all project users
  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const token =
          sessionStorage.getItem("token") || localStorage.getItem("token");

        if (!token) {
          alert("Session expired. Please log in again.");
          window.location.href = "/login";
          return;
        }

        const response = await fetch(`${API_BASE}/profile/all-project-users`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) throw new Error("Failed to fetch members");

        const data = await response.json();
        setMembers(data);
      } catch (error) {
        console.error("Error fetching project users:", error);
      }
    };

    fetchMembers();
  }, []);

  // Fetch monthly report when member/date changes
  useEffect(() => {
    if (!selectedMember) return;

    const token =
      sessionStorage.getItem("token") || localStorage.getItem("token");
    if (!token) return;

    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth() + 1;

    setDays(getDaysInMonth(year, month));

    axios
      .get(`${API_BASE}/reports/monthly/${selectedMember}/${month}/${year}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setReportData(res.data || []))
      .catch((err) => {
        if (err.response?.status === 401) {
          alert("Session expired. Please log in again.");
          localStorage.removeItem("token");
          window.location.href = "/login";
        }
      });
  }, [selectedMember, selectedDate]);

  // Determine attendance status
  const checkStatus = (day) => {
    const found = reportData.find((r) => r.date === day);
    return found && found.timeIn ? "Present" : "Leave";
  };

const getDayName = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-IN", { weekday: "long", timeZone: "Asia/Kolkata" });
};
  return (
    <div className="max-w-3xl mt-20 mx-auto p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4 sm:mb-0">
          Monthly Report
        </h2>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-8">
        <select
          value={selectedMember}
          onChange={(e) => setSelectedMember(e.target.value)}
          className="border rounded-md p-2 bg-white text-black w-full sm:w-auto focus:ring-2 focus:ring-blue-400"
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
          className="border p-2 rounded-md bg-blue-500 text-white cursor-pointer focus:ring-2 focus:ring-blue-400"
        />
      </div>

      {/* Monthly Table */}
      <div className="border rounded-lg overflow-hidden shadow-sm bg-white">
        {days.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            No past days to show
          </div>
        ) : (
          days.map((day, i) => {
            const status = checkStatus(day);
            const dateObj = new Date(day);
            const formatted = dateObj.toLocaleDateString("en-GB");
            const dayName = getDayName(day); // <-- Day name here

            return (
              <div
                key={i}
                className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b last:border-b-0 p-4 hover:bg-gray-50"
              >
                <div className="text-gray-700 font-medium">
                  {formatted} — <span className="text-sm text-gray-500">{dayName}</span>
                </div>

                {status === "Present" ? (
                  <span className="bg-green-500 text-white px-4 py-1 rounded-md mt-2 sm:mt-0">
                    Present
                  </span>
                ) : (
                  <span className="bg-red-500 text-white px-4 py-1 rounded-md mt-2 sm:mt-0">
                    Leave
                  </span>
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
