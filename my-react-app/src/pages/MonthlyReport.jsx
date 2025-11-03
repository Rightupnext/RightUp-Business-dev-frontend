import React, { useState, useEffect } from "react";
import axios from "axios";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const API_BASE = import.meta.env.VITE_BASE; // ✅ Make sure this is set in .env

// ✅ Utility: Get all past days of a month up to today
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

  // ✅ Fetch all project users
  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const token =
          sessionStorage.getItem("token") || localStorage.getItem("token");

        if (!token) {
          console.error("⚠️ No token found. Please log in again.");
          alert("Session expired. Please log in again.");
          window.location.href = "/login";
          return;
        }

        if (!API_BASE) {
          console.error("❌ Missing VITE_BASE in environment.");
          return;
        }

        console.log("🌐 Fetching from:", `${API_BASE}/profile/all-project-users`);

        const response = await fetch(`${API_BASE}/profile/all-project-users`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          console.error("❌ Fetch failed:", response.status);
          throw new Error("Failed to fetch members");
        }

        let data;
        try {
          data = await response.json();
        } catch (err) {
          const text = await response.text();
          console.error("❌ Invalid JSON response:", text);
          return;
        }

        console.log("✅ Project Users:", data);
        setMembers(data);
      } catch (error) {
        console.error("❌ Error fetching project users:", error);
      }
    };

    fetchMembers();
  }, []);

  // ✅ Fetch monthly report data when member/date changes
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
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        console.log("✅ Monthly Report:", res.data);
        setReportData(res.data || []);
      })
      .catch((err) => {
        console.error("❌ Error fetching monthly report:", err);
        if (err.response && err.response.status === 401) {
          alert("Session expired. Please log in again.");
          localStorage.removeItem("token");
          window.location.href = "/login";
        }
      });
  }, [selectedMember, selectedDate]);

  // ✅ Determine attendance status
  const checkStatus = (day) => {
    const found = reportData.find((r) => r.date === day);
    return found && found.timeIn ? "Present" : "Leave";
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
          className="border rounded-md p-2 bg-white text-black  transition w-full sm:w-auto focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          <option value="">Select Member</option>
          {members.map((m) => (
            <option key={m._id} value={m._id}>
              {m.name}
            </option>
          ))}
        </select>

        <div className="relative w-full sm:w-auto">
          <DatePicker
            selected={selectedDate}
            onChange={(date) => setSelectedDate(date)}
            dateFormat="MM/yyyy"
            showMonthYearPicker
            className="border p-2 rounded-md w-full sm:w-auto bg-blue-500 text-white hover:bg-blue-600 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>
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
            const formatted = new Date(day).toLocaleDateString("en-GB");

            return (
              <div
                key={i}
                className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b last:border-b-0 p-4 hover:bg-gray-50 transition"
              >
                <span className="text-gray-700 font-medium">{formatted}</span>
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
