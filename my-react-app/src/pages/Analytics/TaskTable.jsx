import * as XLSX from "xlsx";
import { formatTime } from "./data";

/**
 * FORMAT EFFECTIVE DURATION
 * uses backend effectiveDurationMinutes
 */
function formatEffectiveDuration(minutes) {
  if (!minutes || minutes <= 0) return null;

  const totalMins = Math.round(minutes);

  const h = Math.floor(totalMins / 60);
  const m = totalMins % 60;

  if (totalMins < 60) {
    return {
      value: `${totalMins}`,
      unit: "min",
    };
  }

  if (m === 0) {
    return {
      value: `${h}`,
      unit: "hr",
    };
  }

  return {
    value: `${h} hr ${m}`,
    unit: "min",
  };
}

/**
 * EXPORT EXCEL
 */
function exportToExcel(filteredTasks) {
  /**
   * FORMAT MINUTES -> HUMAN READABLE
   */
  const formatMinutes = (mins = 0) => {
    if (!mins || mins <= 0) return "0 min";

    const h = Math.floor(mins / 60);
    const m = mins % 60;

    if (h === 0) return `${m} min`;
    if (m === 0) return `${h} hr`;

    return `${h} hr ${m} min`;
  };

  /**
   * TOTAL ANALYTICS
   */
  const totalEffectiveMins = filteredTasks.reduce(
    (sum, t) =>
      sum + (t?.task?.effectiveDurationMinutes || 0),
    0
  );

  const totalBreakMins = filteredTasks.reduce(
    (sum, t) =>
      sum + (t?.task?.breakDurationMinutes || 0),
    0
  );

  const totalTaskMins = filteredTasks.reduce(
    (sum, t) =>
      sum + (t?.task?.totalDurationMinutes || 0),
    0
  );

  const completedTasks = filteredTasks.filter(
    (t) =>
      t?.task?.endTiming &&
      t.task.endTiming !== ""
  ).length;

  const pendingTasks =
    filteredTasks.length - completedTasks;

  /**
   * WORKING DAYS
   * 1 Day = 8 hr 30 min = 510 mins
   */
  const WORKING_DAY_MINS = 510;

  const totalWorkingDays =
    totalEffectiveMins / WORKING_DAY_MINS;

  /**
   * TABLE ROWS
   */
  const rows = filteredTasks.map((task, index) => {
    const startTime = task?.task?.timing;
    const endTime = task?.task?.endTiming;

    const effectiveMins =
      task?.task?.effectiveDurationMinutes || 0;

    const breakMins =
      task?.task?.breakDurationMinutes || 0;

    const totalMins =
      task?.task?.totalDurationMinutes || 0;

    const done = !!(
      endTime && endTime !== ""
    );

    return {
      "S.No": index + 1,

      Date: task?.date || "",

      Employee: task?.user?.name || "",

      Email: task?.user?.email || "",

      Project:
        task?.project?.projectName || "",

      Task:
        (task?.task?.name || "No Task")
          .replace(/\n/g, " | ")
          .trim(),

      "Start Time": startTime
        ? new Date(startTime).toLocaleTimeString(
            "en-IN",
            {
              hour: "2-digit",
              minute: "2-digit",
            }
          )
        : "—",

      "End Time":
        endTime && endTime !== ""
          ? new Date(endTime).toLocaleTimeString(
              "en-IN",
              {
                hour: "2-digit",
                minute: "2-digit",
              }
            )
          : "—",

      "Productive Work":
        formatMinutes(effectiveMins),

      "Break Time":
        formatMinutes(breakMins),

      "Total Logged Time":
        formatMinutes(totalMins),

      Status: done
        ? "Completed"
        : "Pending",

      Issue:
        task?.task?.issue || "—",
    };
  });

  /**
   * CREATE WORKSHEET
   */
  const worksheet =
    XLSX.utils.json_to_sheet(rows);

  /**
   * COLUMN WIDTHS
   */
  worksheet["!cols"] = [
    { wch: 8 },
    { wch: 14 },
    { wch: 20 },
    { wch: 32 },
    { wch: 22 },
    { wch: 60 },
    { wch: 14 },
    { wch: 14 },
    { wch: 18 },
    { wch: 16 },
    { wch: 18 },
    { wch: 14 },
    { wch: 40 },
  ];

  /**
   * FIND FOOTER START ROW
   */
  const footerStartRow =
    rows.length + 4;

  /**
   * FOOTER ANALYTICS
   */
  XLSX.utils.sheet_add_aoa(
    worksheet,
    [
      [],

      ["TASK ANALYTICS SUMMARY"],

      [
        "Total Tasks",
        filteredTasks.length,
      ],

      [
        "Completed Tasks",
        completedTasks,
      ],

      [
        "Pending Tasks",
        pendingTasks,
      ],

      [
        "Total Productive Time",
        formatMinutes(totalEffectiveMins),
      ],

      [
        "Total Break Time",
        formatMinutes(totalBreakMins),
      ],

      [
        "Total Logged Time",
        formatMinutes(totalTaskMins),
      ],

      [
        "Working Day Standard",
        "1 Day = 8 hr 30 min",
      ],

      [
        "Total Working Days",
        `${totalWorkingDays.toFixed(2)} Days`,
      ],
    ],
    {
      origin: `A${footerStartRow}`,
    }
  );

  /**
   * WORKBOOK
   */
  const workbook =
    XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(
    workbook,
    worksheet,
    "Task Report"
  );

  /**
   * FILE NAME
   */
  const today = new Date()
    .toISOString()
    .slice(0, 10);

  XLSX.writeFile(
    workbook,
    `task-report-${today}.xlsx`
  );
}

/**
 * TASK TABLE
 */
export default function TaskTable({
  filteredTasks,
}) {
  if (!filteredTasks.length) return null;

  const completedCount = filteredTasks.filter(
    (t) =>
      t.task?.endTiming &&
      t.task.endTiming !== ""
  ).length;

  const pendingCount =
    filteredTasks.length - completedCount;

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      {/* HEADER */}
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

        {/* EXPORT */}
        <button
          onClick={() =>
            exportToExcel(filteredTasks)
          }
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

      {/* TABLE */}
      <div className="overflow-x-auto">
        <table
          className="w-full text-sm"
          style={{ tableLayout: "fixed" }}
        >
          <colgroup>
            <col style={{ width: 52 }} />
            <col style={{ width: 96 }} />
            <col />
            <col style={{ width: 120 }} />
            <col style={{ width: 80 }} />
            <col style={{ width: 80 }} />
            <col style={{ width: 84 }} />
          </colgroup>

          <thead>
            <tr className="bg-gray-50">
              {[
                "#",
                "Date",
                "Task",
                "Duration",
                "Start",
                "End",
                "Status",
              ].map((h) => (
                <th
                  key={h}
                  className="px-3 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wide border-b border-gray-100"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {filteredTasks.map((task, index) => {
              const taskName =
                task?.task?.name || "No Task";

              const startTime =
                task?.task?.timing;

              const endTime =
                task?.task?.endTiming;

              const done = !!(
                endTime && endTime !== ""
              );

              // EFFECTIVE DURATION
              const duration =
                formatEffectiveDuration(
                  task?.task
                    ?.effectiveDurationMinutes
                );

              const lines = taskName
                .trim()
                .split("\n");

              return (
                <tr
                  key={`${task?.groupId}-${task?.task?.id || index}`}
                  className="hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0"
                >
                  {/* INDEX */}
                  <td className="px-3 py-3">
                    <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded font-mono">
                      #{index + 1}
                    </span>
                  </td>

                  {/* DATE */}
                  <td className="px-3 py-3 text-xs text-gray-500 whitespace-nowrap">
                    {task?.date || "—"}
                  </td>

                  {/* TASK */}
                  <td className="px-3 py-3">
                    <div className="text-sm text-gray-800 leading-snug">
                      {lines[0]}
                    </div>

                    {lines
                      .slice(1)
                      .map((l, i) => (
                        <div
                          key={i}
                          className="text-xs text-gray-400 mt-0.5 leading-snug"
                        >
                          {l}
                        </div>
                      ))}
                  </td>

                  {/* DURATION */}
                  <td className="px-3 py-3 whitespace-nowrap">
                    {duration ? (
                      <div>
                        <span className="text-sm font-medium text-gray-800">
                          {duration.value}
                          <span className="text-xs text-gray-400 font-normal">
                            {" "}
                            {duration.unit}
                          </span>
                        </span>

                        {/* BREAK INFO */}
                        <div className="text-[10px] text-red-400 mt-0.5">
                          Break:{" "}
                          {task?.task
                            ?.breakDurationMinutes || 0}
                          m
                        </div>
                      </div>
                    ) : (
                      <span className="text-gray-300 text-sm">
                        —
                      </span>
                    )}
                  </td>

                  {/* START */}
                  <td className="px-3 py-3 text-xs text-gray-500 whitespace-nowrap">
                    {formatTime(startTime)}
                  </td>

                  {/* END */}
                  <td className="px-3 py-3 text-xs text-gray-500 whitespace-nowrap">
                    {formatTime(
                      endTime &&
                        endTime !== ""
                        ? endTime
                        : ""
                    )}
                  </td>

                  {/* STATUS */}
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