// TaskHours.jsx

/**
 * FORMAT DURATION
 * decimal hours -> smart readable format
 *
 * Examples:
 * 0.75 => 45 min
 * 7.5 => 7 hr 30 min
 * 12 => 12 hr
 */
function formatDuration(decimalHrs) {
  if (!decimalHrs || decimalHrs <= 0) return "—";

  const totalMins = Math.round(decimalHrs * 60);

  if (totalMins < 60) {
    return `${totalMins} min`;
  }

  const h = Math.floor(totalMins / 60);
  const m = totalMins % 60;

  if (m === 0) {
    return `${h} hr`;
  }

  return `${h} hr ${m} min`;
}

/**
 * SHORT FORMAT
 * 7.5 => 7.5 hr
 */
function formatDurationSub(decimalHrs) {
  if (!decimalHrs || decimalHrs <= 0) return "0 min";

  const totalMins = Math.round(decimalHrs * 60);

  if (totalMins < 60) {
    return `${totalMins} min`;
  }

  const hrs = +(totalMins / 60).toFixed(1);

  return `${hrs} hr`;
}

/**
 * TASK HOURS
 */
export default function TaskHours({ filteredTasks }) {
  if (!filteredTasks?.length) return null;

  /**
   * TOTAL EFFECTIVE HOURS
   */
  const totalEffectiveHours = filteredTasks.reduce((sum, t) => {
    const mins = t?.task?.effectiveDurationMinutes || 0;
    return sum + mins / 60;
  }, 0);

  /**
   * TOTAL BREAK HOURS
   */
  const totalBreakHours = filteredTasks.reduce((sum, t) => {
    const mins = t?.task?.breakDurationMinutes || 0;
    return sum + mins / 60;
  }, 0);

  /**
   * TOTAL TASK HOURS
   */
  const totalTaskHours = filteredTasks.reduce((sum, t) => {
    const mins = t?.task?.totalDurationMinutes || 0;
    return sum + mins / 60;
  }, 0);

  /**
   * COMPLETED / PENDING
   */
  const completedCount = filteredTasks.filter(
    (t) => t.task?.endTiming && t.task.endTiming !== "",
  ).length;

  const pendingCount =
    filteredTasks.length - completedCount;

  /**
   * AVG HOURS
   */
  const timedTasks = filteredTasks.filter(
    (t) => (t?.task?.effectiveDurationMinutes || 0) > 0,
  );

  const avgHours =
    timedTasks.length > 0
      ? totalEffectiveHours / timedTasks.length
      : 0;

  /**
   * PRODUCTIVITY %
   */
  const productivityPct =
    totalTaskHours > 0
      ? Math.round(
          (totalEffectiveHours / totalTaskHours) * 100,
        )
      : 0;

  /**
   * COMPLETION %
   */
  const completionPct = Math.round(
    (completedCount / filteredTasks.length) * 100,
  );

  /**
   * WORKING DAYS
   */
  const WORKING_HOURS_PER_DAY = 8.5;

  const workingDays =
    totalEffectiveHours / WORKING_HOURS_PER_DAY;

  const fullDays = Math.floor(workingDays);

  const remainingHours =
    (workingDays - fullDays) *
    WORKING_HOURS_PER_DAY;

  const workingDayLabel =
    remainingHours > 0
      ? `${fullDays} day ${formatDuration(
          remainingHours,
        )}`
      : `${fullDays} day`;

  /**
   * LONGEST TASK
   */
  const longestTask =
    filteredTasks.reduce((max, t) => {
      const mins =
        t?.task?.effectiveDurationMinutes || 0;

      if (
        !max ||
        mins >
          (max?.task?.effectiveDurationMinutes || 0)
      ) {
        return t;
      }

      return max;
    }, null) || null;

  /**
   * ANALYTICS
   */
  const analytics = [
    {
      label: "Total Tasks",
      value: filteredTasks.length,
      sub: "assigned tasks",
      color: "text-blue-500",
      bg: "bg-blue-50",
      border: "border-blue-100",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.8}
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"
          />
        </svg>
      ),
    },

    {
      label: "Effective Work",
      value: formatDuration(totalEffectiveHours),
      sub: "productive work",
      color: "text-violet-500",
      bg: "bg-violet-50",
      border: "border-violet-100",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.8}
            d="M12 8v4l3 3"
          />
        </svg>
      ),
    },

    {
      label: "Break Time",
      value: formatDuration(totalBreakHours),
      sub: "non-working time",
      color: "text-red-500",
      bg: "bg-red-50",
      border: "border-red-100",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.8}
            d="M8 13v-1a4 4 0 118 0v1"
          />
        </svg>
      ),
    },

    {
      label: "Avg / Task",
      value: formatDuration(avgHours),
      sub: `${formatDurationSub(avgHours)} average`,
      color: "text-amber-500",
      bg: "bg-amber-50",
      border: "border-amber-100",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.8}
            d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
          />
        </svg>
      ),
    },

    {
      label: "Working Days",
      value: `${workingDays.toFixed(1)} Days`,
      sub: `${workingDayLabel} worked`,
      color: "text-indigo-500",
      bg: "bg-indigo-50",
      border: "border-indigo-100",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.8}
            d="M8 7V3m8 4V3"
          />
        </svg>
      ),
    },

    {
      label: "Productivity",
      value: `${productivityPct}%`,
      sub: `${formatDuration(
        totalTaskHours,
      )} total tracked`,
      color: "text-emerald-500",
      bg: "bg-emerald-50",
      border: "border-emerald-100",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.8}
            d="M9 12l2 2 4-4"
          />
        </svg>
      ),
    },

    {
      label: "Completion",
      value: `${completionPct}%`,
      sub: `${completedCount} done · ${pendingCount} pending`,
      color: "text-green-500",
      bg: "bg-green-50",
      border: "border-green-100",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.8}
            d="M9 12l2 2 4-4"
          />
        </svg>
      ),
    },

    {
      label: "Longest Task",
      value: longestTask
        ? formatDuration(
            (longestTask.task
              ?.effectiveDurationMinutes || 0) / 60,
          )
        : "—",

      sub: longestTask?.task?.name || "No task",
      color: "text-pink-500",
      bg: "bg-pink-50",
      border: "border-pink-100",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.8}
            d="M12 8c-1.657 0-3 1.343-3 3"
          />
        </svg>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      {/* TOP SUMMARY */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-5 text-white">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="text-sm opacity-80">
              Task Analytics Overview
            </div>

            <div className="text-3xl font-bold mt-1">
              {formatDuration(totalEffectiveHours)}
            </div>

            <div className="text-sm opacity-80 mt-1">
              productive hours logged
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold">
                {filteredTasks.length}
              </div>
              <div className="text-xs opacity-80">
                Tasks
              </div>
            </div>

            <div>
              <div className="text-2xl font-bold">
                {completedCount}
              </div>
              <div className="text-xs opacity-80">
                Completed
              </div>
            </div>

            <div>
              <div className="text-2xl font-bold">
                {productivityPct}%
              </div>
              <div className="text-xs opacity-80">
                Productivity
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ANALYTICS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {analytics.map((item) => (
          <div
            key={item.label}
            className={`bg-white border ${item.border} rounded-2xl p-4 hover:shadow-sm transition-all`}
          >
            <div
              className={`w-10 h-10 rounded-xl ${item.bg} ${item.color} flex items-center justify-center mb-3`}
            >
              {item.icon}
            </div>

            <div className="text-xs text-gray-500 font-medium uppercase tracking-wide">
              {item.label}
            </div>

            <div className="text-2xl font-bold text-gray-900 mt-1 break-words">
              {item.value}
            </div>

            <div className="text-xs text-gray-400 mt-1 line-clamp-2">
              {item.sub}
            </div>

            {/* COMPLETION BAR */}
            {item.label === "Completion" && (
              <div className="mt-3 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-green-500 rounded-full transition-all duration-700"
                  style={{
                    width: `${completionPct}%`,
                  }}
                />
              </div>
            )}

            {/* PRODUCTIVITY BAR */}
            {item.label === "Productivity" && (
              <div className="mt-3 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all duration-700"
                  style={{
                    width: `${productivityPct}%`,
                  }}
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}