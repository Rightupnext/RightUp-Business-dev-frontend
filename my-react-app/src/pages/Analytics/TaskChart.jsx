import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { shortTask } from "./data";

/**
 * formatDuration — smart mins/hrs label from decimal hours
 * e.g. 0.75 → "45 min", 7.5 → "7.5 hr", 1.0 → "1 hr"
 */
function formatDuration(decimalHrs) {
  if (!decimalHrs || decimalHrs <= 0) return "—";
  const totalMins = Math.round(decimalHrs * 60);
  if (totalMins < 60) return `${totalMins} min`;
  const h = Math.floor(totalMins / 60);
  const m = totalMins % 60;
  if (m === 0) return `${h} hr`;
  return `${h} hr ${m} min`;  // ← was using toFixed(2)
}

/**
 * formatAxisTick — short label for X axis ticks
 * e.g. 0.5 → "30m", 2 → "2h", 7.5 → "7.5h"
 */
function formatAxisTick(decimalHrs) {
  const totalMins = Math.round(decimalHrs * 60);
  if (totalMins < 60) return `${totalMins}m`;
  const h = +(totalMins / 60).toFixed(1);
  return `${h}h`;
}

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const hrs = payload[0].value;
    return (
      <div className="bg-white border border-gray-200 rounded-lg px-3 py-2 shadow-sm text-xs">
        <p className="font-medium text-gray-700 mb-1 max-w-[180px] leading-snug">{label}</p>
        <p className="text-blue-600 font-medium">{formatDuration(hrs)}</p>
        <p className="text-gray-400 mt-0.5">
          {payload[0].payload.done ? "✓ Completed" : "⏳ Pending"}
        </p>
      </div>
    );
  }
  return null;
};

/**
 * TaskChart — horizontal bar chart of working hours per task
 * Props:
 *   filteredTasks : Task[]
 */
export default function TaskChart({ filteredTasks }) {
  if (!filteredTasks.length) return null;

  // TaskChart.jsx (FULL FIX)

const chartData = filteredTasks.map((t) => ({
  name: shortTask(t?.task?.name || "No Task"),

  // USING EFFECTIVE HOURS
  hours: +(
    ((t.task?.effectiveDurationMinutes || 0) / 60).toFixed(4)
  ),

  done: !!(
    t.task?.endTiming &&
    t.task.endTiming !== ""
  ),
}));

  // Summary stats
  const validTasks = chartData.filter((d) => d.hours > 0);
  const totalHrs = validTasks.reduce((s, d) => s + d.hours, 0);
  const avgHrs = validTasks.length ? totalHrs / validTasks.length : 0;

  const chartHeight = Math.max(220, filteredTasks.length * 56 + 60);

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5">
      {/* Card header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="text-sm font-medium text-gray-900">Working hours per task</div>
          <div className="text-xs text-gray-400 mt-0.5">Breakdown by individual task</div>
        </div>
        <div className="flex items-center gap-4 text-xs text-gray-500">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-blue-500 inline-block" />
            Completed
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-gray-300 inline-block" />
            Pending
          </span>
        </div>
      </div>

      {/* Summary pills */}
      <div className="flex items-center gap-3 mb-5">
        {/* <div className="flex items-center gap-1.5 bg-blue-50 border border-blue-100 rounded-lg px-3 py-1.5">
          <svg className="w-3.5 h-3.5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-xs text-blue-500 font-medium">Total</span>
          <span className="text-xs font-semibold text-blue-700">{formatDuration(totalHrs)}</span>
        </div> */}
{/* 
        <div className="flex items-center gap-1.5 bg-violet-50 border border-violet-100 rounded-lg px-3 py-1.5">
          <svg className="w-3.5 h-3.5 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
          <span className="text-xs text-violet-500 font-medium">Avg / task</span>
          <span className="text-xs font-semibold text-violet-700">{formatDuration(avgHrs)}</span>
        </div> */}

        <div className="ml-auto text-xs text-gray-400">
          {validTasks.length} of {filteredTasks.length} timed
        </div>
      </div>

      <ResponsiveContainer width="100%" height={chartHeight}>
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{ top: 0, right: 20, left: 8, bottom: 0 }}
        >
          <CartesianGrid horizontal={false} stroke="#f3f4f6" />
          <XAxis
            type="number"
            tick={{ fontSize: 11, fill: "#9CA3AF" }}
            tickFormatter={formatAxisTick}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            type="category"
            dataKey="name"
            width={168}
            tick={{ fontSize: 12, fill: "#6B7280" }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: "#F9FAFB" }} />
          <Bar dataKey="hours" radius={[0, 4, 4, 0]} barSize={22}>
            {chartData.map((entry, i) => (
              <Cell key={i} fill={entry.done ? "#3B82F6" : "#D1D5DB"} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}