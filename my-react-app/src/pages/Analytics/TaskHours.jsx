/**
 * formatDuration — smart mins/hrs label from decimal hours
 * e.g. 0.75 → "45 min", 7.5 → "7.5 hr", 90.5 → "90 hr 30 min"
 */
function formatDuration(decimalHrs) {
  if (!decimalHrs || decimalHrs <= 0) return "0 min";
  const totalMins = Math.round(decimalHrs * 60);
  if (totalMins < 60) return `${totalMins} min`;
  const h = Math.floor(totalMins / 60);
  const m = totalMins % 60;
  if (m === 0) return `${h} hr`;
  return `${h} hr ${m} min`;
}

/**
 * formatDurationSub — compact sub-label version
 * e.g. 7.5 → "7.5 hr logged", 45 mins → "45 min logged"
 */
function formatDurationSub(decimalHrs) {
  if (!decimalHrs || decimalHrs <= 0) return "0 min";
  const totalMins = Math.round(decimalHrs * 60);
  if (totalMins < 60) return `${totalMins} min`;
  const h = +(totalMins / 60).toFixed(2);
  return `${h} hr`;
}

/**
 * TaskHours — summary metric cards
 * Props:
 *   filteredTasks : Task[]
 */
export default function TaskHours({ filteredTasks }) {
  if (!filteredTasks.length) return null;

  const totalHours = filteredTasks.reduce((s, t) => {
    if (!t.task?.timing || !t.task?.endTiming || t.task.endTiming === "")
      return s;
    return s + (new Date(t.task.endTiming) - new Date(t.task.timing)) / 3600000;
  }, 0);

  const completedCount = filteredTasks.filter(
    (t) => t.task?.endTiming && t.task.endTiming !== "",
  ).length;
  const pendingCount = filteredTasks.length - completedCount;

  // avg over timed tasks only (exclude tasks with no endTiming)
  const timedCount = filteredTasks.filter(
    (t) => t.task?.timing && t.task?.endTiming && t.task.endTiming !== "",
  ).length;
  const avgHours = timedCount ? totalHours / timedCount : 0;

  const completionPct = Math.round(
    (completedCount / filteredTasks.length) * 100,
  );
  const WORKING_HOURS_PER_DAY = 8.5;

  const workingDaysFromHours = totalHours / WORKING_HOURS_PER_DAY;

  const fullDays = Math.floor(workingDaysFromHours);
  const remainingHours =
    (workingDaysFromHours - fullDays) * WORKING_HOURS_PER_DAY;

  const workingDayLabel =
    remainingHours > 0
      ? `${fullDays} day ${formatDuration(remainingHours)}`
      : `${fullDays} day`;
  const metrics = [
    {
      label: "Total tasks",
      value: filteredTasks.length,
      sub: "assigned",
      icon: (
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
          />
        </svg>
      ),
      color: "text-blue-500",
    },
    {
      label: "Total hours",
      value: formatDuration(totalHours),
      sub: `${formatDurationSub(totalHours)} logged`,
      icon: (
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
      color: "text-violet-500",
    },
    {
      label: "Avg / task",
      value: formatDuration(avgHours),
      sub: `${formatDurationSub(avgHours)} per task`,
      icon: (
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
          />
        </svg>
      ),
      color: "text-amber-500",
    },
    {
      label: "Completion",
      value: `${completionPct}%`,
      sub: `${completedCount} done · ${pendingCount} pending`,
      icon: (
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
      color: "text-green-500",
    },
    {
      label: "Working days",
      value: `${workingDaysFromHours.toFixed(1)} Days`,
      sub: `${workingDayLabel} worked`,
      icon: (
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M8 7V3m8 4V3m-9 8h10m-11 9h12a2 2 0 002-2V7a2 2 0 00-2-2H6a2 2 0 00-2 2v11a2 2 0 002 2z"
          />
        </svg>
      ),
      color: "text-indigo-500",
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {metrics.map((m) => (
        <div
          key={m.label}
          className="bg-white border border-gray-200 rounded-xl p-4"
        >
          <div className={`flex items-center gap-1.5 mb-2 ${m.color}`}>
            {m.icon}
            <span className="text-xs font-medium text-gray-500">{m.label}</span>
          </div>

          <div className="text-xl font-medium text-gray-900 leading-tight break-words">
            {m.value}
          </div>
          <div className="text-xs text-gray-400 mt-0.5">{m.sub}</div>

          {/* Progress bar for completion only */}
          {m.label === "Completion" && (
            <div className="mt-2 h-1 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-green-400 rounded-full transition-all duration-500"
                style={{ width: `${completionPct}%` }}
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
