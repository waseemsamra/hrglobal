import Link from "next/link";
import { redirect } from "next/navigation";
import EmployerSideNav from "@/components/EmployerSideNav";
import EmployerTopNav from "@/components/EmployerTopNav";
import { getDb } from "@/lib/mongodb";
import { getOrgName } from "@/lib/settings";
import { getCurrentEmployer } from "@/lib/employer";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  const org = await getOrgName();
  return { title: `Employer Dashboard — ${org}` };
}

async function getDashboardData(employerId) {
  try {
    const db = await getDb();
    const jobs = db.collection("jobs");
    const scope = { source: "employer", employerId };
    const [activeJobs, topJobsRaw] = await Promise.all([
      jobs.countDocuments({ ...scope, status: "Active" }),
      jobs
        .find(scope)
        .sort({ applicants: -1 })
        .limit(5)
        .toArray(),
    ]);

    const totalApplicants = topJobsRaw.reduce((s, j) => s + (j.applicants || 0), 0);
    const maxApplicants = Math.max(1, ...topJobsRaw.map((j) => j.applicants || 0));

    return {
      activeJobs,
      totalApplicants,
      topJobs: topJobsRaw.map((j) => ({
        title: j.title,
        applicants: j.applicants || 0,
        pct: Math.round(((j.applicants || 0) / maxApplicants) * 100),
      })),
    };
  } catch (err) {
    console.error("Employer dashboard load error:", err);
    return { activeJobs: 0, totalApplicants: 0, topJobs: [] };
  }
}

const ACTIVITY = [
  { icon: "mail", tint: "surface", title: "New application for", strong: "Senior Designer", meta: "Sarah Jenkins • 15m ago" },
  { icon: "check_circle", tint: "secondary", title: "Interview scheduled with", strong: "David Chen", meta: "Today, 2:30 PM • 2h ago" },
  { icon: "edit", tint: "tertiary", title: "Job post updated:", strong: "QA Engineer", meta: "System • 5h ago" },
  { icon: "person", tint: "surface", title: "New candidate profile created", strong: "", meta: "External Source • Yesterday" },
];

const TASKS = [
  "Review 12 new Engineering applicants",
  "Approve salary range for VP Product",
  "Send interview feedback for Maria G.",
];

const SCHEDULE = [
  { time: "10", ampm: "AM", name: "Liam Wilson", detail: "Technical Round • Senior Frontend", icon: "video_call", active: true },
  { time: "14", ampm: "PM", name: "Elena Rodriguez", detail: "Culture Fit • Product Marketing", icon: "meeting_room", active: false },
];

function Metric({ label, value, sub, subIcon, subClass, icon, iconBg, iconColor }) {
  return (
    <div className="glass-card p-6 rounded-xl border border-outline-variant flex justify-between items-center shadow-sm">
      <div>
        <p className="text-label-md font-label-md text-on-surface-variant uppercase tracking-wider">
          {label}
        </p>
        <h3 className="text-[32px] font-bold text-primary mt-1">{value}</h3>
        <p className={`text-label-sm font-label-sm flex items-center gap-1 mt-1 ${subClass}`}>
          <span className="material-symbols-outlined text-[14px]">{subIcon}</span>
          {sub}
        </p>
      </div>
      <div className={`w-14 h-14 rounded-full flex items-center justify-center ${iconBg} ${iconColor}`}>
        <span className="material-symbols-outlined text-[28px]">{icon}</span>
      </div>
    </div>
  );
}

export default async function EmployerDashboardPage() {
  const employer = await getCurrentEmployer();
  if (!employer) redirect("/employer/login");
  const orgName = employer.company || (await getOrgName());
  const { activeJobs, totalApplicants, topJobs } = await getDashboardData(employer.id);

  return (
    <div className="bg-surface text-on-surface min-h-screen">
      <EmployerTopNav orgName={orgName} />
      <EmployerSideNav active="Dashboard" />

      <main className="ml-64 pt-16 min-h-screen">
        <div className="p-margin-desktop space-y-gutter max-w-container-max mx-auto">
          {/* Welcome Header */}
          <div className="flex justify-between items-end mb-4 flex-wrap gap-4">
            <div>
              <h2 className="font-headline-xl text-headline-xl text-primary leading-none">
                Dashboard Overview
              </h2>
              <p className="font-body-md text-body-md text-on-surface-variant mt-2">
                Welcome back. Here&apos;s what&apos;s happening with your recruitment pipeline today.
              </p>
            </div>
            <div className="flex gap-3">
              <button className="flex items-center gap-2 px-4 py-2 border border-outline text-on-surface rounded-lg font-label-md text-label-md hover:bg-surface-container-low transition-colors">
                <span className="material-symbols-outlined text-[18px]">calendar_today</span>
                This Week
                <span className="material-symbols-outlined text-[18px]">expand_more</span>
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg font-label-md text-label-md hover:opacity-90 transition-opacity">
                <span className="material-symbols-outlined text-[18px]">download</span>
                Export Report
              </button>
            </div>
          </div>

          {/* Metrics Bar */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
            <Metric
              label="Total Active Jobs"
              value={activeJobs}
              sub="Live employer postings"
              subIcon="trending_up"
              subClass="text-secondary"
              icon="work"
              iconBg="bg-primary-fixed"
              iconColor="text-primary"
            />
            <Metric
              label="New Applications"
              value={totalApplicants}
              sub="Across your top posts"
              subIcon="trending_up"
              subClass="text-secondary"
              icon="person_add"
              iconBg="bg-secondary-fixed"
              iconColor="text-on-secondary-container"
            />
            <Metric
              label="Upcoming Interviews"
              value={SCHEDULE.length}
              sub="Scheduled for today"
              subIcon="schedule"
              subClass="text-on-surface-variant"
              icon="event"
              iconBg="bg-tertiary-fixed"
              iconColor="text-on-tertiary-fixed-variant"
            />
          </div>

          {/* Bento Grid */}
          <div className="bento-grid">
            {/* Top Performing Job Posts */}
            <div className="col-span-12 lg:col-span-8 glass-card rounded-xl border border-outline-variant p-6 flex flex-col">
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h4 className="font-headline-md text-headline-md text-primary">
                    Top Performing Job Posts
                  </h4>
                  <p className="font-body-md text-body-md text-on-surface-variant">
                    Volume of applicants per position
                  </p>
                </div>
                <button className="text-on-surface-variant hover:text-primary transition-colors">
                  <span className="material-symbols-outlined">more_horiz</span>
                </button>
              </div>
              <div className="flex-1 flex items-end justify-between gap-4 h-64 pt-4">
                {topJobs.length === 0 ? (
                  <p className="text-on-surface-variant text-body-md w-full text-center self-center">
                    No employer job posts yet.{" "}
                    <Link href="/employer/jobs/manage" className="text-secondary font-bold hover:underline">
                      Post your first job
                    </Link>
                    .
                  </p>
                ) : (
                  topJobs.map((j) => (
                    <div key={j.title} className="flex-1 flex flex-col items-center gap-3">
                      <div
                        className="w-full bg-surface-container-highest rounded-t-lg relative group overflow-hidden"
                        style={{ height: `${Math.max(j.pct, 8)}%` }}
                      >
                        <div className="absolute inset-0 bg-secondary opacity-80 translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
                        <div className="absolute top-2 left-0 right-0 text-center text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                          {j.applicants} Apps
                        </div>
                      </div>
                      <span className="text-label-sm font-label-sm text-center line-clamp-1">
                        {j.title}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="col-span-12 lg:col-span-4 glass-card rounded-xl border border-outline-variant p-6 flex flex-col">
              <h4 className="font-headline-md text-headline-md text-primary mb-6">Recent Activity</h4>
              <div className="flex-1 space-y-6 overflow-y-auto custom-scrollbar pr-2 max-h-72">
                {ACTIVITY.map((a, i) => (
                  <div key={i} className={`flex gap-4 ${a.tint === "surface" && i === 3 ? "opacity-70" : ""}`}>
                    <div
                      className={`w-10 h-10 rounded-full flex-shrink-0 border flex items-center justify-center ${
                        a.tint === "secondary"
                          ? "bg-secondary-container/20 border-secondary-container"
                          : a.tint === "tertiary"
                          ? "bg-tertiary-container/10 border-tertiary-container/30"
                          : "bg-surface-container border-outline-variant"
                      }`}
                    >
                      <span
                        className={`material-symbols-outlined text-[20px] ${
                          a.tint === "secondary"
                            ? "text-secondary"
                            : a.tint === "tertiary"
                            ? "text-tertiary-container"
                            : "text-on-surface-variant"
                        }`}
                      >
                        {a.icon}
                      </span>
                    </div>
                    <div className="space-y-1">
                      <p className="text-body-md font-medium text-on-surface">
                        {a.title} {a.strong && <span className="font-bold">{a.strong}</span>}
                      </p>
                      <p className="text-label-sm text-on-surface-variant">{a.meta}</p>
                    </div>
                  </div>
                ))}
              </div>
              <button className="mt-6 w-full py-2 text-primary font-bold text-label-md border border-primary/20 rounded-lg hover:bg-surface-container transition-colors">
                View All Activity
              </button>
            </div>

            {/* Quick Actions & Pipeline */}
            <div className="col-span-12 grid grid-cols-1 md:grid-cols-2 gap-gutter">
              {/* Pending Tasks */}
              <div className="glass-card rounded-xl border border-outline-variant overflow-hidden">
                <div className="bg-surface-container px-6 py-4 border-b border-outline-variant">
                  <h5 className="font-headline-md text-headline-md text-primary">Pending Tasks</h5>
                </div>
                <div className="p-6 space-y-4">
                  {TASKS.map((t) => (
                    <div
                      key={t}
                      className="flex items-center justify-between p-4 bg-background border border-outline-variant rounded-lg hover:border-secondary transition-colors cursor-pointer group"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-8 h-8 rounded-full border-2 border-outline-variant flex items-center justify-center group-hover:border-secondary transition-colors">
                          <div className="w-4 h-4 bg-secondary rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        </div>
                        <p className="text-body-md font-medium">{t}</p>
                      </div>
                      <span className="material-symbols-outlined text-on-surface-variant">
                        chevron_right
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Today's Schedule */}
              <div className="glass-card rounded-xl border border-outline-variant p-6">
                <div className="flex justify-between items-center mb-6">
                  <h5 className="font-headline-md text-headline-md text-primary">Today&apos;s Schedule</h5>
                  <span className="px-3 py-1 bg-secondary-container text-on-secondary-container text-[11px] font-bold rounded-full">
                    {SCHEDULE.length} SESSIONS
                  </span>
                </div>
                <div className="space-y-4">
                  {SCHEDULE.map((s, i) => (
                    <div
                      key={s.name}
                      className={`flex items-start gap-4 p-4 rounded-xl border border-slate-100 ${
                        i === 0 ? "bg-white shadow-sm" : "bg-white/50"
                      }`}
                    >
                      <div className="text-center min-w-[50px]">
                        <p className="text-headline-md font-bold text-primary">{s.time}</p>
                        <p className="text-[10px] uppercase text-on-surface-variant">{s.ampm}</p>
                      </div>
                      <div className="flex-1 border-l border-outline-variant pl-4">
                        <p className="text-body-md font-bold">{s.name}</p>
                        <p className="text-label-sm text-on-surface-variant">{s.detail}</p>
                      </div>
                      <button
                        className={`p-2 rounded-lg transition-transform hover:scale-105 ${
                          s.active
                            ? "bg-secondary-container text-on-secondary-container"
                            : "bg-surface-container text-on-surface-variant"
                        }`}
                      >
                        <span className="material-symbols-outlined">{s.icon}</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Floating Post Job button */}
      <Link
        href="/employer/jobs/manage"
        className="fixed bottom-8 right-8 w-14 h-14 bg-secondary text-on-secondary rounded-full flex items-center justify-center shadow-xl hover:scale-110 active:scale-95 transition-all z-50 group"
      >
        <span className="material-symbols-outlined text-[32px]">add</span>
        <span className="absolute right-16 bg-primary text-white px-4 py-2 rounded-lg text-label-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-lg">
          Post a New Job
        </span>
      </Link>
    </div>
  );
}
