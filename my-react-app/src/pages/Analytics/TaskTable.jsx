import * as XLSX from "xlsx";
import { formatTime } from "./data";

/**
 * formatDuration — smart mins/hrs label
 */
function formatDuration(startIso, endIso) {
  if (!startIso || !endIso || endIso === "") return null;
  const diffMs = new Date(endIso) - new Date(startIso);
  if (diffMs <= 0) return null;
  const totalMins = Math.round(diffMs / 60000);
  const h = Math.floor(totalMins / 60);
  const m = totalMins % 60;

  if (totalMins < 60) return { value: `${totalMins}`, unit: "min" };
  if (m === 0) return { value: `${h}`, unit: "hr" };
  return { value: `${h} hr ${m}`, unit: "min" };  // ← "7 hr 59 min"
}

/**
 * exportToExcel — converts filteredTasks to .xlsx and triggers download
 */
function exportToExcel(filteredTasks) {
  const rows = filteredTasks.map((task, index) => {
    const startTime = task?.task?.timing;
    const endTime = task?.task?.endTiming;
    const duration = formatDuration(startTime, endTime);
    const done = !!(endTime && endTime !== "");

    return {
      "#": index + 1,
      Date: task?.date || "",
      "User Name": task?.user?.name || "",
      "User Email": task?.user?.email || "",
      Project: task?.project?.projectName || "",
      Task: (task?.task?.name || "No Task").replace(/\n/g, " | "),
      "Start Time": startTime
        ? new Date(startTime).toLocaleTimeString("en-IN", {
            hour: "2-digit",
            minute: "2-digit",
          })
        : "—",
      "End Time":
        endTime && endTime !== ""
          ? new Date(endTime).toLocaleTimeString("en-IN", {
              hour: "2-digit",
              minute: "2-digit",
            })
          : "—",
      Duration: duration ? `${duration.value} ${duration.unit}` : "—",
      // "Duration (hrs)": duration
      //   ? duration.unit === "min"
      //     ? +(duration.value / 60).toFixed(2)
      //     : duration.value
      //   : 0,
      Status: done ? "Completed" : "Pending",
      Issue: task?.task?.issue || "",
    };
  });

  const worksheet = XLSX.utils.json_to_sheet(rows);

  // Column widths
  worksheet["!cols"] = [
    { wch: 5 }, // #
    { wch: 12 }, // Date
    { wch: 16 }, // User Name
    { wch: 28 }, // User Email
    { wch: 18 }, // Project
    { wch: 50 }, // Task
    { wch: 12 }, // Start Time
    { wch: 12 }, // End Time
    { wch: 12 }, // Duration
    { wch: 14 }, // Duration (hrs)
    { wch: 12 }, // Status
    { wch: 40 }, // Issue
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Task Report");

  const today = new Date().toISOString().slice(0, 10);
  XLSX.writeFile(workbook, `task-report-${today}.xlsx`);
}

/**
 * TaskTable — detailed task list table with Excel export
 * Props:
 *   filteredTasks : Task[]
 */
export default function TaskTable({ filteredTasks }) {
  if (!filteredTasks.length) return null;

  const completedCount = filteredTasks.filter(
    (t) => t.task?.endTiming && t.task.endTiming !== "",
  ).length;
  const pendingCount = filteredTasks.length - completedCount;

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      {/* Card header */}
      <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-medium text-gray-900">
            Task details
          </span>
          <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
            {filteredTasks.length} tasks
          </span>
          <span className="flex items-center gap-1 text-xs text-gray-400">
            <span className="w-2 h-2 rounded-full bg-green-400 inline-block" />
            {completedCount} completed
          </span>
          <span className="flex items-center gap-1 text-xs text-gray-400">
            <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />
            {pendingCount} pending
          </span>
        </div>

        {/* Export button */}
        <button
          onClick={() => exportToExcel(filteredTasks)}
          className="flex items-center gap-1.5 text-xs font-medium text-green-700 bg-green-50 hover:bg-green-100 active:bg-green-200 border border-green-200 px-3 py-1.5 rounded-lg transition-colors"
        >
          <svg
            className="w-3.5 h-3.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
            />
          </svg>
          Export Excel
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm" style={{ tableLayout: "fixed" }}>
          <colgroup>
            <col style={{ width: 52 }} />
            <col style={{ width: 96 }} />
            <col />
            <col style={{ width: 80 }} />
            <col style={{ width: 80 }} />
            <col style={{ width: 80 }} />
            <col style={{ width: 84 }} />
          </colgroup>
          <thead>
            <tr className="bg-gray-50">
              {["#", "Date", "Task", "Duration", "Start", "End", "Status"].map(
                (h) => (
                  <th
                    key={h}
                    className="px-3 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wide border-b border-gray-100"
                  >
                    {h}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody>
            {filteredTasks.map((task, index) => {
              const taskName = task?.task?.name || "No Task";
              const startTime = task?.task?.timing;
              const endTime = task?.task?.endTiming;
              const done = !!(endTime && endTime !== "");
              const duration = formatDuration(startTime, endTime);
              const lines = taskName.trim().split("\n");

              return (
                <tr
                  key={`${task?.groupId}-${task?.task?.id || index}`}
                  className="hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0"
                >
                  {/* # */}
                  <td className="px-3 py-3">
                    <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded font-mono">
                      #{index + 1}
                    </span>
                  </td>

                  {/* Date */}
                  <td className="px-3 py-3 text-xs text-gray-500 whitespace-nowrap">
                    {task?.date || "—"}
                  </td>

                  {/* Task */}
                  <td className="px-3 py-3">
                    <div className="text-sm text-gray-800 leading-snug">
                      {lines[0]}
                    </div>
                    {lines.slice(1).map((l, i) => (
                      <div
                        key={i}
                        className="text-xs text-gray-400 mt-0.5 leading-snug"
                      >
                        {l}
                      </div>
                    ))}
                  </td>

                  {/* Duration */}
                  <td className="px-3 py-3 whitespace-nowrap">
                    {duration ? (
                      <span className="text-sm font-medium text-gray-800">
                        {duration.value}
                        <span className="text-xs text-gray-400 font-normal">
                          {" "}
                          {duration.unit}
                        </span>
                      </span>
                    ) : (
                      <span className="text-gray-300 text-sm">—</span>
                    )}
                  </td>

                  {/* Start */}
                  <td className="px-3 py-3 text-xs text-gray-500 whitespace-nowrap">
                    {formatTime(startTime)}
                  </td>

                  {/* End */}
                  <td className="px-3 py-3 text-xs text-gray-500 whitespace-nowrap">
                    {formatTime(endTime && endTime !== "" ? endTime : "")}
                  </td>

                  {/* Status */}
                  <td className="px-3 py-3">
                    {done ? (
                      <span className="inline-flex items-center gap-1 text-xs font-medium bg-green-50 text-green-700 px-2 py-0.5 rounded-full">
                        Done
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-medium bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full">
                        Pending
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
