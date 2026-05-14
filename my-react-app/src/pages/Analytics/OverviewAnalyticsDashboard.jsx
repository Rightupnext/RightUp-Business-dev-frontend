import { useState } from "react";
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from "recharts";

// ─── Mock API Data ─────────────────────────────────────────────────────────────
const data = {
  summary: {
    totalUsers: 12, activeUsers: 9,
    totalProjects: 18, activeProjects: 11, completedProjects: 7,
    totalTasks: 582, completedTasks: 491, runningTasks: 23, pendingTasks: 68,
    totalWorkingHours: "582h 42m", productiveHours: "491h 10m",
    totalBreakHours: "48h 21m", totalIdleHours: "22h 18m",
    overallProductivity: 84, manualTasks: 102, linkedTasks: 480,
  },
  cards: [
    { title: "Working Hours", value: "582h 42m", change: "+12%", trend: "up" },
    { title: "Productivity",  value: "84%",       change: "+6%",  trend: "up" },
    { title: "Break Hours",   value: "48h 21m",   change: "-8%",  trend: "down" },
  ],
  charts: {
    workingHoursTrend: [
      { date: "May 1", hours: 42 }, { date: "May 2", hours: 38 },
      { date: "May 3", hours: 51 }, { date: "May 4", hours: 45 },
      { date: "May 5", hours: 39 }, { date: "May 6", hours: 58 },
      { date: "May 7", hours: 47 },
    ],
    productivityWave: [
      { date: "May 1", score: 82 }, { date: "May 2", score: 88 },
      { date: "May 3", score: 79 }, { date: "May 4", score: 91 },
      { date: "May 5", score: 85 }, { date: "May 6", score: 93 },
      { date: "May 7", score: 87 },
    ],
    taskCompletionChart: [
      { date: "May 1", completed: 28, running: 4, pending: 6 },
      { date: "May 2", completed: 32, running: 3, pending: 8 },
      { date: "May 3", completed: 25, running: 6, pending: 5 },
      { date: "May 4", completed: 40, running: 2, pending: 4 },
      { date: "May 5", completed: 35, running: 5, pending: 7 },
    ],
    breakAnalysisChart: [
      { date: "May 1", mgBreak: 52, lunchBreak: 78, eveBreak: 22 },
      { date: "May 2", mgBreak: 48, lunchBreak: 82, eveBreak: 18 },
      { date: "May 3", mgBreak: 55, lunchBreak: 75, eveBreak: 25 },
      { date: "May 4", mgBreak: 42, lunchBreak: 80, eveBreak: 20 },
    ],
    projectPerformanceChart: [
      { project: "Billing",      tasks: 122, hours: 92 },
      { project: "Tapio",        tasks: 98,  hours: 76 },
      { project: "RightUp",      tasks: 86,  hours: 64 },
      { project: "ClickHarvest", tasks: 74,  hours: 58 },
    ],
  },
  pieCharts: {
    taskStatus:    [{ name: "Completed", value: 491 }, { name: "Running", value: 23 }, { name: "Pending", value: 68 }],
    taskType:      [{ name: "Linked", value: 480 }, { name: "Manual", value: 102 }],
    projectStatus: [{ name: "Completed", value: 7 }, { name: "Inprogress", value: 11 }],
  },
  employeeAnalytics: [
    { userId:"1", name:"Jeeva", workingHours:"8h 24m", productiveHours:"7h 02m", breakHours:"52m", idleHours:"30m", productivity:88, completedTasks:18, runningTasks:1, linkedTasks:16, avgTaskCompletionTime:"24m", mostWorkedProject:"RightUp", lastActive:"2026-05-13T14:22:00Z", status:"active" },
    { userId:"2", name:"Kumar", workingHours:"8h 44m", productiveHours:"7h 30m", breakHours:"48m", idleHours:"26m", productivity:88, completedTasks:22, runningTasks:0, linkedTasks:18, avgTaskCompletionTime:"31m", mostWorkedProject:"Billing", lastActive:"2026-05-13T13:10:00Z", status:"active" },
    { userId:"3", name:"John", workingHours:"7h 50m", productiveHours:"6h 45m", breakHours:"55m", idleHours:"10m", productivity:86, completedTasks:15, runningTasks:2, linkedTasks:14, avgTaskCompletionTime:"28m", mostWorkedProject:"Tapio",   lastActive:"2026-05-13T14:05:00Z", status:"break"  },
  ],
  projectAnalytics: [
    { projectId:"1", projectName:"Billing Software", projectType:"Web App",         status:"Inprogress", totalTasks:122, completedTasks:98, runningTasks:4, contributors:6, totalHours:"92h", avgCompletionTime:"38m", productivity:86 },
    { projectId:"2", projectName:"Tapio NFC",        projectType:"NFC E-Commerce",  status:"Inprogress", totalTasks:98,  completedTasks:75, runningTasks:8, contributors:4, totalHours:"76h", avgCompletionTime:"42m", productivity:82 },
    { projectId:"3", projectName:"RightUp TMS",      projectType:"Task Management", status:"Completed",  totalTasks:86,  completedTasks:86, runningTasks:0, contributors:5, totalHours:"64h", avgCompletionTime:"30m", productivity:91 },
  ],
  recentActivities: [
    { type:"task_completed", user:"Jeeva", project:"RightUp", task:"deployment completed",  time:"5 mins ago"  },
    { type:"task_started",   user:"Kumar", project:"Billing", task:"invoice module setup",  time:"18 mins ago" },
    { type:"task_completed", user:"John", project:"Tapio",   task:"NFC card UI fix",       time:"34 mins ago" },
    { type:"break",          user:"John", project:"—",       task:"Lunch break started",   time:"1 hr ago"    },
  ],
  leaderboard: [
    { rank:1, name:"Jeeva", productivity:92, hours:"9h 12m" },
    { rank:2, name:"Kumar", productivity:88, hours:"8h 44m" },
    { rank:3, name:"John", productivity:86, hours:"7h 50m" },
    { rank:4, name:"Ravi",  productivity:81, hours:"7h 20m" },
  ],
  liveStatus: {
    currentlyWorking: 5, onBreak: 2, offline: 3,
    activeTasks: [
      { user:"Jeeva", project:"RightUp", task:"hrs issue fixing", startedAt:"2026-05-13T07:34:29Z" },
      { user:"Kumar", project:"Billing", task:"invoice module",   startedAt:"2026-05-13T08:10:00Z" },
    ],
  },
};

const PIE_COLORS = {
  taskStatus:    ["#22c55e","#f59e0b","#f43f5e"],
  taskType:      ["#6366f1","#94a3b8"],
  projectStatus: ["#22c55e","#3b82f6"],
};

const initials   = (n) => n.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0,2);
const statusDot  = (s) => ({ active:"bg-green-400", break:"bg-amber-400", offline:"bg-gray-300" }[s] || "bg-gray-300");
const actIcon    = (t) => {
  if (t === "task_completed") return { bg:"bg-green-100", color:"text-green-600",  icon:"✓" };
  if (t === "task_started")   return { bg:"bg-blue-100",  color:"text-blue-600",   icon:"▶" };
  return                             { bg:"bg-amber-100", color:"text-amber-600",  icon:"☕" };
};

// ─── Shared UI ─────────────────────────────────────────────────────────────────
const Card = ({ children, className = "" }) => (
  <div className={`bg-white border border-gray-200 rounded-2xl shadow-sm ${className}`}>{children}</div>
);

const CTip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs shadow-lg">
      <p className="text-gray-400 mb-1 font-medium">{label}</p>
      {payload.map((p,i) => (
        <p key={i} style={{ color: p.color }} className="font-semibold">
          {p.name}: {p.value}{p.name?.toLowerCase().includes("score") ? "%" : ""}
        </p>
      ))}
    </div>
  );
};

const PTip = ({ active, payload }) =>
  active && payload?.length ? (
    <div className="bg-white border border-gray-200 rounded-lg px-2 py-1 text-xs shadow">
      {payload[0].name}: <b>{payload[0].value}</b>
    </div>
  ) : null;

const Title = ({ children, sub }) => (
  <div className="mb-4">
    <h2 className="text-xs font-bold text-gray-500 uppercase tracking-widest">{children}</h2>
    {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
  </div>
);

const AX = { axisLine: false, tickLine: false };
const TX = { fontSize: 11, fill: "#94a3b8" };
const GRID = "#f1f5f9";

// ─── Sub-components ────────────────────────────────────────────────────────────
function KpiCard({ card }) {
  const up = card.trend === "up";
  return (
    <Card className="p-5 flex flex-col gap-2 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest">{card.title}</span>
        <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${up ? "bg-green-50 text-green-700 border-green-200" : "bg-rose-50 text-rose-600 border-rose-200"}`}>
          {card.change}
        </span>
      </div>
      <div className="text-3xl font-bold text-gray-900 tracking-tight">{card.value}</div>
      <div className={`text-xs ${up ? "text-green-600" : "text-rose-500"}`}>{up ? "↑" : "↓"} vs last period</div>
    </Card>
  );
}

function Pill({ label, value, bg, text }) {
  return (
    <div className={`flex flex-col items-center justify-center rounded-xl px-4 py-3 border ${bg}`}>
      <span className={`text-lg font-bold ${text}`}>{value}</span>
      <span className="text-xs text-gray-400 mt-0.5">{label}</span>
    </div>
  );
}

function DonutPie({ data: d, colors, label }) {
  return (
    <Card className="p-4 flex flex-col items-center">
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">{label}</p>
      <ResponsiveContainer width="100%" height={130}>
        <PieChart>
          <Pie data={d} cx="50%" cy="50%" innerRadius={36} outerRadius={54} dataKey="value" paddingAngle={3}>
            {d.map((_,i) => <Cell key={i} fill={colors[i % colors.length]} />)}
          </Pie>
          <Tooltip content={<PTip />} />
        </PieChart>
      </ResponsiveContainer>
      <div className="flex flex-wrap justify-center gap-2 mt-1">
        {d.map((item,i) => (
          <span key={i} className="flex items-center gap-1 text-xs text-gray-500">
            <span className="w-2 h-2 rounded-full inline-block" style={{ background: colors[i % colors.length] }} />
            {item.name} <span className="font-semibold text-gray-700">{item.value}</span>
          </span>
        ))}
      </div>
    </Card>
  );
}

// ─── Dashboard ─────────────────────────────────────────────────────────────────
export default function OverviewAnalyticsDashboard() {
  const [tab, setTab] = useState("overview");
  const { summary, cards, charts, pieCharts, employeeAnalytics, projectAnalytics, recentActivities, leaderboard, liveStatus } = data;
  const tabs = ["overview","employees","projects","live"];

  return (
    <div className="min-h-screen bg-slate-50 mt-10" style={{ fontFamily:"'DM Sans',system-ui,sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700;800&display=swap');*{box-sizing:border-box}`}</style>

      {/* Nav */}
      <nav className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-xs font-bold text-white">A</div>
          <span className="text-sm font-bold text-gray-800">Analytics</span>
          <span className="text-xs bg-green-50 text-green-600 px-2 py-0.5 rounded-full border border-green-200 font-semibold">● Live</span>
        </div>

        <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
          {tabs.map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all
                ${tab === t ? "bg-white text-indigo-600 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>
              {t}
            </button>
          ))}
        </div>

        <div className="flex gap-4 text-xs text-gray-500">
          {[["bg-green-400", `${liveStatus.currentlyWorking} working`],
            ["bg-amber-400", `${liveStatus.onBreak} break`],
            ["bg-gray-300",  `${liveStatus.offline} offline`]].map(([dot, lbl]) => (
            <span key={lbl} className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${dot}`} />{lbl}
            </span>
          ))}
        </div>
      </nav>

      <div className="px-6 py-6 max-w-screen-2xl mx-auto">

        {/* ── OVERVIEW ── */}
        {tab === "overview" && (
          <div className="space-y-5">

            {/* KPIs */}
            <div className="grid grid-cols-3 gap-4">
              {cards.map((c) => <KpiCard key={c.title} card={c} />)}
            </div>

            {/* Pills */}
            <div className="grid grid-cols-6 gap-3">
              <Pill label="Total Users"  value={summary.totalUsers}    bg="bg-indigo-50 border-indigo-100" text="text-indigo-700" />
              <Pill label="Active Users" value={summary.activeUsers}   bg="bg-green-50 border-green-100"   text="text-green-700"  />
              <Pill label="Projects"     value={summary.totalProjects}  bg="bg-blue-50 border-blue-100"     text="text-blue-700"   />
              <Pill label="Total Tasks"  value={summary.totalTasks}     bg="bg-violet-50 border-violet-100" text="text-violet-700" />
              <Pill label="Running"      value={summary.runningTasks}   bg="bg-amber-50 border-amber-100"   text="text-amber-700"  />
              <Pill label="Pending"      value={summary.pendingTasks}   bg="bg-rose-50 border-rose-100"     text="text-rose-700"   />
            </div>

            {/* Productivity ring + hours trend */}
            <div className="grid grid-cols-3 gap-4">
              <Card className="p-5 flex flex-col items-center justify-center">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">Overall Productivity</p>
                <div className="relative flex items-center justify-center" style={{ width:140, height:140 }}>
                  <svg width="140" height="140" viewBox="0 0 140 140">
                    <circle cx="70" cy="70" r="56" fill="none" stroke="#e2e8f0" strokeWidth="14" />
                    <circle cx="70" cy="70" r="56" fill="none" stroke="#6366f1" strokeWidth="14"
                      strokeDasharray={`${2*Math.PI*56*summary.overallProductivity/100} ${2*Math.PI*56}`}
                      strokeLinecap="round" transform="rotate(-90 70 70)" />
                  </svg>
                  <div className="absolute flex flex-col items-center">
                    <span className="text-3xl font-bold text-gray-900">{summary.overallProductivity}%</span>
                    <span className="text-xs text-gray-400 mt-0.5">productive</span>
                  </div>
                </div>
                <div className="mt-4 w-full space-y-2">
                  {[
                    { label:"Productive", val:summary.productiveHours, dot:"bg-indigo-500" },
                    { label:"Break",      val:summary.totalBreakHours, dot:"bg-amber-400"  },
                    { label:"Idle",       val:summary.totalIdleHours,  dot:"bg-gray-300"   },
                  ].map((r) => (
                    <div key={r.label} className="flex items-center justify-between text-xs">
                      <span className="flex items-center gap-1.5 text-gray-500">
                        <span className={`w-2 h-2 rounded-full ${r.dot}`} />{r.label}
                      </span>
                      <span className="font-semibold text-gray-700">{r.val}</span>
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="col-span-2 p-5">
                <Title sub="Daily working hours this week">Working Hours Trend</Title>
                <ResponsiveContainer width="100%" height={180}>
                  <AreaChart data={charts.workingHoursTrend}>
                    <defs>
                      <linearGradient id="hg" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor="#6366f1" stopOpacity={0.15} />
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0}    />
                      </linearGradient>
                    </defs>
                    <CartesianGrid stroke={GRID} vertical={false} />
                    <XAxis dataKey="date" tick={TX} {...AX} />
                    <YAxis tick={TX} {...AX} tickFormatter={(v) => `${v}h`} />
                    <Tooltip content={<CTip />} />
                    <Area type="monotone" dataKey="hours" stroke="#6366f1" strokeWidth={2.5} fill="url(#hg)" dot={{ r:3, fill:"#6366f1" }} />
                  </AreaChart>
                </ResponsiveContainer>
              </Card>
            </div>

            {/* Productivity + Task completion */}
            <div className="grid grid-cols-2 gap-4">
              <Card className="p-5">
                <Title sub="Daily productivity score">Productivity Wave</Title>
                <ResponsiveContainer width="100%" height={180}>
                  <LineChart data={charts.productivityWave}>
                    <CartesianGrid stroke={GRID} vertical={false} />
                    <XAxis dataKey="date" tick={TX} {...AX} />
                    <YAxis tick={TX} {...AX} domain={[70,100]} tickFormatter={(v) => `${v}%`} />
                    <Tooltip content={<CTip />} />
                    <Line type="monotone" dataKey="score" name="Score" stroke="#22c55e" strokeWidth={2.5}
                      dot={{ r:4, fill:"#22c55e", strokeWidth:0 }} activeDot={{ r:6 }} />
                  </LineChart>
                </ResponsiveContainer>
              </Card>

              <Card className="p-5">
                <Title sub="Completed, running, pending per day">Task Completion</Title>
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={charts.taskCompletionChart} barSize={14}>
                    <CartesianGrid stroke={GRID} vertical={false} />
                    <XAxis dataKey="date" tick={TX} {...AX} />
                    <YAxis tick={TX} {...AX} />
                    <Tooltip content={<CTip />} />
                    <Bar dataKey="completed" name="Completed" fill="#22c55e" radius={[3,3,0,0]} />
                    <Bar dataKey="running"   name="Running"   fill="#f59e0b" radius={[3,3,0,0]} />
                    <Bar dataKey="pending"   name="Pending"   fill="#f43f5e" radius={[3,3,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
                <div className="flex gap-4 mt-2 justify-end">
                  {[["#22c55e","Completed"],["#f59e0b","Running"],["#f43f5e","Pending"]].map(([c,l]) => (
                    <span key={l} className="flex items-center gap-1 text-xs text-gray-400">
                      <span className="w-2 h-2 rounded-sm inline-block" style={{ background:c }} />{l}
                    </span>
                  ))}
                </div>
              </Card>
            </div>

            {/* Pie charts */}
            <div className="grid grid-cols-3 gap-4">
              <DonutPie data={pieCharts.taskStatus}    colors={PIE_COLORS.taskStatus}    label="Task Status"    />
              <DonutPie data={pieCharts.taskType}      colors={PIE_COLORS.taskType}      label="Task Type"      />
              <DonutPie data={pieCharts.projectStatus} colors={PIE_COLORS.projectStatus} label="Project Status" />
            </div>

            {/* Break analysis + Project performance */}
            <div className="grid grid-cols-2 gap-4">
              <Card className="p-5">
                <Title sub="Morning / Lunch / Evening (mins)">Break Analysis</Title>
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={charts.breakAnalysisChart} barSize={12}>
                    <CartesianGrid stroke={GRID} vertical={false} />
                    <XAxis dataKey="date" tick={TX} {...AX} />
                    <YAxis tick={TX} {...AX} tickFormatter={(v) => `${v}m`} />
                    <Tooltip content={<CTip />} />
                    <Bar dataKey="mgBreak"    name="Morning" fill="#818cf8" radius={[3,3,0,0]} />
                    <Bar dataKey="lunchBreak" name="Lunch"   fill="#fb923c" radius={[3,3,0,0]} />
                    <Bar dataKey="eveBreak"   name="Evening" fill="#34d399" radius={[3,3,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
              </Card>

              <Card className="p-5">
                <Title sub="Tasks and hours per project">Project Performance</Title>
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={charts.projectPerformanceChart} layout="vertical" barSize={10}>
                    <CartesianGrid stroke={GRID} horizontal={false} />
                    <XAxis type="number" tick={TX} {...AX} />
                    <YAxis type="category" dataKey="project" width={80} tick={TX} {...AX} />
                    <Tooltip content={<CTip />} />
                    <Bar dataKey="tasks" name="Tasks" fill="#6366f1" radius={[0,3,3,0]} />
                    <Bar dataKey="hours" name="Hours" fill="#22c55e" radius={[0,3,3,0]} />
                  </BarChart>
                </ResponsiveContainer>
              </Card>
            </div>

            {/* Leaderboard + Recent activity */}
            <div className="grid grid-cols-2 gap-4">
              <Card className="p-5">
                <Title sub="Top performers today">Leaderboard</Title>
                <div className="space-y-3">
                  {leaderboard.map((l) => (
                    <div key={l.rank} className="flex items-center gap-3">
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0
                        ${l.rank===1 ? "bg-amber-400 text-white" : l.rank===2 ? "bg-gray-200 text-gray-600" : "bg-gray-100 text-gray-400"}`}>
                        {l.rank}
                      </span>
                      <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold shrink-0">
                        {initials(l.name)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-semibold text-gray-800">{l.name}</span>
                          <span className="text-xs text-gray-400">{l.hours}</span>
                        </div>
                        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full rounded-full bg-indigo-500 transition-all" style={{ width:`${l.productivity}%` }} />
                        </div>
                      </div>
                      <span className="text-xs font-bold text-indigo-600 w-10 text-right">{l.productivity}%</span>
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="p-5">
                <Title sub="Latest team activity">Recent Activity</Title>
                <div className="space-y-3">
                  {recentActivities.map((a,i) => {
                    const ic = actIcon(a.type);
                    return (
                      <div key={i} className="flex items-start gap-3">
                        <div className={`w-7 h-7 rounded-lg ${ic.bg} flex items-center justify-center text-sm ${ic.color} shrink-0 mt-0.5`}>
                          {ic.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-gray-800 font-medium leading-snug">
                            <span className="text-indigo-600">{a.user}</span> · {a.task}
                          </p>
                          <p className="text-xs text-gray-400 mt-0.5">{a.project} · {a.time}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* ── EMPLOYEES ── */}
        {tab === "employees" && (
          <div className="space-y-4">
            <Title sub={`${summary.activeUsers} active of ${summary.totalUsers} total`}>Employee Analytics</Title>
            {employeeAnalytics.map((emp) => (
              <Card key={emp.userId} className="p-5">
                <div className="flex items-start gap-4">
                  <div className="relative shrink-0">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center text-lg font-bold">
                      {initials(emp.name)}
                    </div>
                    <span className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white ${statusDot(emp.status)}`} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-base font-bold text-gray-900">{emp.name}</p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          Last active: {new Date(emp.lastActive).toLocaleTimeString("en-IN",{hour:"2-digit",minute:"2-digit"})} · {emp.mostWorkedProject}
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5 bg-indigo-50 border border-indigo-100 rounded-xl px-3 py-1.5">
                        <span className="text-indigo-500 text-xs font-semibold">Productivity</span>
                        <span className="text-indigo-700 font-bold text-sm">{emp.productivity}%</span>
                      </div>
                    </div>

                    <div className="mt-3 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full bg-indigo-500" style={{ width:`${emp.productivity}%` }} />
                    </div>

                    <div className="grid grid-cols-4 gap-3 mt-4">
                      {[
                        { label:"Working",    val:emp.workingHours,    bg:"bg-slate-50"  },
                        { label:"Productive", val:emp.productiveHours, bg:"bg-green-50"  },
                        { label:"Break",      val:emp.breakHours,      bg:"bg-amber-50"  },
                        { label:"Idle",       val:emp.idleHours,       bg:"bg-gray-50"   },
                      ].map((s) => (
                        <div key={s.label} className={`${s.bg} border border-gray-100 rounded-xl px-3 py-2 text-center`}>
                          <p className="text-sm font-bold text-gray-800">{s.val}</p>
                          <p className="text-xs text-gray-400 mt-0.5">{s.label}</p>
                        </div>
                      ))}
                    </div>

                    <div className="grid grid-cols-4 gap-3 mt-3">
                      {[
                        { label:"Completed", val:emp.completedTasks,       color:"text-green-600"  },
                        { label:"Running",   val:emp.runningTasks,          color:"text-amber-600"  },
                        { label:"Linked",    val:emp.linkedTasks,           color:"text-indigo-600" },
                        { label:"Avg Time",  val:emp.avgTaskCompletionTime, color:"text-blue-600"   },
                      ].map((s) => (
                        <div key={s.label} className="bg-gray-50 border border-gray-100 rounded-xl px-3 py-2 text-center">
                          <p className={`text-sm font-bold ${s.color}`}>{s.val}</p>
                          <p className="text-xs text-gray-400 mt-0.5">{s.label}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* ── PROJECTS ── */}
        {tab === "projects" && (
          <div className="space-y-4">
            <Title sub={`${summary.activeProjects} active · ${summary.completedProjects} completed`}>Project Analytics</Title>
            {projectAnalytics.map((proj) => {
              const pct = Math.round((proj.completedTasks / proj.totalTasks) * 100);
              return (
                <Card key={proj.projectId} className="p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-base font-bold text-gray-900">{proj.projectName}</p>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-semibold border
                          ${proj.status==="Completed"
                            ? "bg-green-50 text-green-700 border-green-200"
                            : "bg-blue-50 text-blue-700 border-blue-200"}`}>
                          {proj.status}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">{proj.projectType} · {proj.contributors} contributors</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-gray-900">{proj.productivity}%</p>
                      <p className="text-xs text-gray-400">productivity</p>
                    </div>
                  </div>

                  <div className="flex justify-between text-xs text-gray-400 mb-1">
                    <span>Completion</span><span>{pct}%</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden mb-4">
                    <div className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-green-500" style={{ width:`${pct}%` }} />
                  </div>

                  <div className="grid grid-cols-5 gap-3">
                    {[
                      { label:"Total Tasks", val:proj.totalTasks,        color:"text-gray-800"   },
                      { label:"Completed",   val:proj.completedTasks,    color:"text-green-600"  },
                      { label:"Running",     val:proj.runningTasks,      color:"text-amber-600"  },
                      { label:"Total Hours", val:proj.totalHours,        color:"text-indigo-600" },
                      { label:"Avg Time",    val:proj.avgCompletionTime, color:"text-blue-600"   },
                    ].map((s) => (
                      <div key={s.label} className="bg-gray-50 border border-gray-100 rounded-xl px-3 py-2.5 text-center">
                        <p className={`text-sm font-bold ${s.color}`}>{s.val}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{s.label}</p>
                      </div>
                    ))}
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        {/* ── LIVE ── */}
        {tab === "live" && (
          <div className="space-y-5">
            <Title sub="Real-time team activity">Live Status</Title>

            <div className="grid grid-cols-3 gap-4">
              {[
                { label:"Currently Working", val:liveStatus.currentlyWorking, bg:"bg-green-50 border-green-200", text:"text-green-700", dot:"bg-green-400" },
                { label:"On Break",          val:liveStatus.onBreak,          bg:"bg-amber-50 border-amber-200", text:"text-amber-700", dot:"bg-amber-400" },
                { label:"Offline",           val:liveStatus.offline,          bg:"bg-gray-50 border-gray-200",   text:"text-gray-600",  dot:"bg-gray-300"  },
              ].map((s) => (
                <div key={s.label} className={`rounded-2xl border ${s.bg} p-6 flex flex-col items-center gap-2`}>
                  <span className={`w-3 h-3 rounded-full ${s.dot} animate-pulse`} />
                  <span className={`text-4xl font-bold ${s.text}`}>{s.val}</span>
                  <span className="text-xs text-gray-500 font-semibold uppercase tracking-widest">{s.label}</span>
                </div>
              ))}
            </div>

            <Card className="p-5">
              <Title sub="Tasks currently in progress">Active Tasks</Title>
              <div className="space-y-3">
                {liveStatus.activeTasks.map((t,i) => {
                  const elapsed = Math.round((Date.now() - new Date(t.startedAt)) / 60000);
                  return (
                    <div key={i} className="flex items-center gap-3 bg-gray-50 border border-gray-100 rounded-xl px-4 py-3">
                      <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold shrink-0">
                        {initials(t.user)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-800">
                          {t.user} <span className="text-gray-400 font-normal">· {t.project}</span>
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5 truncate">{t.task}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-xs font-bold text-green-600">
                          {elapsed >= 60 ? `${Math.floor(elapsed/60)}h ${elapsed%60}m` : `${elapsed}m`}
                        </p>
                        <p className="text-xs text-gray-400">elapsed</p>
                      </div>
                      <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse shrink-0" />
                    </div>
                  );
                })}
              </div>
            </Card>

            <Card className="p-5">
              <Title sub="Latest events">Activity Feed</Title>
              <div className="space-y-3">
                {recentActivities.map((a,i) => {
                  const ic = actIcon(a.type);
                  return (
                    <div key={i} className="flex items-start gap-3 border-b border-gray-100 pb-3 last:border-0 last:pb-0">
                      <div className={`w-8 h-8 rounded-xl ${ic.bg} flex items-center justify-center text-sm ${ic.color} shrink-0`}>{ic.icon}</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-800 font-medium">
                          <span className="text-indigo-600">{a.user}</span> — {a.task}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">{a.project} · {a.time}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
