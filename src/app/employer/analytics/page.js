import EmployerSideNav from "@/components/EmployerSideNav";
import EmployerTopNav from "@/components/EmployerTopNav";
import { getDb } from "@/lib/mongodb";
import { getOrgName } from "@/lib/settings";
import { getCurrentEmployer } from "@/lib/employer";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  const org = await getOrgName();
  return { title: `Hiring Stats — ${org}` };
}

async function getDepartmentStats(employerId) {
  try {
    const db = await getDb();
    const rows = await db
      .collection("jobs")
      .aggregate([
        { $match: { source: "employer", employerId, status: "Active" } },
        { $group: { _id: "$department", roles: { $sum: 1 } } },
        { $sort: { roles: -1 } },
        { $limit: 6 },
      ])
      .toArray();

    const maxRoles = Math.max(1, ...rows.map((r) => r.roles));
    // Illustrative "time to fill" values keyed off role count.
    return rows.map((r, i) => ({
      department: r._id || "Unassigned",
      roles: r.roles,
      timeToFill: [34, 21, 28, 30, 25, 19][i] || 26,
      velocity: Math.round((r.roles / maxRoles) * 100),
    }));
  } catch (err) {
    console.error("Hiring stats load error:", err);
    return [];
  }
}

const SOURCES = [
  { name: "LinkedIn", value: 1240, pct: 85, bar: "bg-primary-container" },
  { name: "Indeed", value: 920, pct: 65, bar: "bg-secondary" },
  { name: "Referrals", value: 450, pct: 45, bar: "bg-secondary-fixed-dim" },
  { name: "Direct", value: 280, pct: 30, bar: "bg-outline-variant" },
];

const FUNNEL = [
  { label: "Applied", value: "2,890", pad: "", bar: "bg-secondary", opacity: "" },
  { label: "Interviewed", value: "412", pad: "px-6", bar: "bg-secondary/60", opacity: "opacity-80" },
  { label: "Offered", value: "86", pad: "px-12", bar: "bg-secondary/40", opacity: "opacity-60" },
  {
    label: "Hired",
    value: "72",
    pad: "px-20",
    bar: "bg-secondary/20 border border-secondary/30",
    opacity: "opacity-40",
  },
];

export default async function EmployerAnalyticsPage() {
  const employer = await getCurrentEmployer();
  if (!employer) redirect("/employer/login");
  const orgName = employer.company || (await getOrgName());
  const departments = await getDepartmentStats(employer.id);

  return (
    <div className="bg-surface text-on-surface min-h-screen">
      <EmployerTopNav orgName={orgName} />
      <EmployerSideNav active="Hiring Stats" />

      <main className="ml-64 pt-24 p-8 min-h-screen">
        <div className="max-w-container-max mx-auto">
          {/* Header */}
          <div className="flex justify-between items-end mb-8 flex-wrap gap-4">
            <div>
              <nav className="flex items-center gap-2 text-on-surface-variant mb-2">
                <span className="font-label-md text-label-md">Analytics</span>
                <span className="material-symbols-outlined text-sm">chevron_right</span>
                <span className="font-label-md text-label-md text-primary">Hiring Statistics</span>
              </nav>
              <h2 className="font-headline-xl text-headline-xl text-primary">Hiring Performance</h2>
            </div>
            <div className="flex gap-3">
              <div className="flex bg-surface-container-low border border-outline-variant rounded-lg p-1">
                <button className="px-4 py-1.5 bg-surface-container-lowest shadow-sm rounded-md font-label-md text-label-md">
                  Last 30 Days
                </button>
                <button className="px-4 py-1.5 hover:bg-surface-container-high rounded-md font-label-md text-label-md text-on-surface-variant">
                  Quarterly
                </button>
              </div>
              <button className="flex items-center gap-2 border border-outline-variant px-4 py-2 rounded-lg font-label-md text-label-md hover:bg-surface-container-low transition-colors">
                <span className="material-symbols-outlined text-[18px]">download</span>
                Export Report
              </button>
            </div>
          </div>

          {/* Bento Grid */}
          <div className="grid grid-cols-12 gap-6 mb-8">
            {/* Key Metrics */}
            <div className="col-span-12 lg:col-span-3 space-y-6">
              <div className="bg-surface-container-lowest border border-outline-variant p-6 rounded-xl">
                <p className="font-label-md text-label-md text-on-surface-variant uppercase mb-4">
                  Avg. Time to Hire
                </p>
                <div className="flex items-baseline gap-2">
                  <span className="font-headline-xl text-headline-xl text-primary">24.5</span>
                  <span className="font-body-md text-body-md text-on-surface-variant">days</span>
                </div>
                <div className="mt-4 flex items-center gap-1 text-secondary text-sm font-semibold">
                  <span className="material-symbols-outlined text-[16px]">trending_down</span>
                  <span>4.2% from last month</span>
                </div>
              </div>
              <div className="bg-surface-container-lowest border border-outline-variant p-6 rounded-xl">
                <p className="font-label-md text-label-md text-on-surface-variant uppercase mb-4">
                  Cost Per Hire
                </p>
                <div className="flex items-baseline gap-2">
                  <span className="font-headline-xl text-headline-xl text-primary">$4,120</span>
                </div>
                <div className="mt-4 flex items-center gap-1 text-error text-sm font-semibold">
                  <span className="material-symbols-outlined text-[16px]">trending_up</span>
                  <span>1.8% from last month</span>
                </div>
              </div>
            </div>

            {/* Applications by Source */}
            <div className="col-span-12 lg:col-span-6 bg-surface-container-lowest border border-outline-variant p-6 rounded-xl relative overflow-hidden">
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h3 className="font-headline-md text-headline-md text-primary">
                    Applications by Source
                  </h3>
                  <p className="font-body-md text-body-md text-on-surface-variant">
                    Distribution of total candidate pool
                  </p>
                </div>
                <span className="material-symbols-outlined text-on-surface-variant">more_vert</span>
              </div>
              <div className="h-64 flex items-end justify-between gap-4 px-4">
                {SOURCES.map((s) => (
                  <div key={s.name} className="flex-1 flex flex-col items-center group">
                    <div
                      className={`w-full ${s.bar} rounded-t-lg transition-all duration-500 hover:opacity-90 relative`}
                      style={{ height: `${s.pct}%` }}
                    >
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-primary text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                        {s.value.toLocaleString()}
                      </div>
                    </div>
                    <span className="font-label-md text-label-md text-on-surface-variant mt-4">
                      {s.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recruitment Funnel */}
            <div className="col-span-12 lg:col-span-3 bg-primary-container text-white p-6 rounded-xl flex flex-col">
              <h3 className="font-headline-md text-headline-md mb-6">Recruitment Funnel</h3>
              <div className="flex-1 space-y-4">
                {FUNNEL.map((f) => (
                  <div key={f.label} className={f.pad}>
                    <div
                      className={`${f.bar} ${f.opacity} px-4 py-3 rounded-lg flex justify-between items-center`}
                    >
                      <span className="font-label-md text-label-md uppercase">{f.label}</span>
                      <span className="font-bold">{f.value}</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 pt-4 border-t border-white/10">
                <div className="flex justify-between items-center">
                  <span className="font-body-md text-body-md opacity-70">Overall Yield</span>
                  <span className="font-headline-md text-headline-md text-secondary-fixed">2.5%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Detailed Analysis */}
          <div className="grid grid-cols-12 gap-6">
            {/* Departmental Progress */}
            <div className="col-span-12 lg:col-span-8 bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden">
              <div className="p-6 border-b border-outline-variant flex justify-between items-center">
                <h3 className="font-headline-md text-headline-md text-primary">
                  Departmental Progress
                </h3>
                <button className="text-secondary font-label-md text-label-md hover:underline">
                  View All Departments
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-surface-container-low">
                      <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant">Department</th>
                      <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant">Active Roles</th>
                      <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant">Avg. Time to Fill</th>
                      <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant">Hiring Velocity</th>
                      <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant">
                    {departments.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-10 text-center text-on-surface-variant">
                          No active employer roles yet.
                        </td>
                      </tr>
                    ) : (
                      departments.map((d) => (
                        <tr key={d.department} className="hover:bg-surface-container transition-colors">
                          <td className="px-6 py-4 font-body-md text-body-md font-semibold">
                            {d.department}
                          </td>
                          <td className="px-6 py-4 font-body-md text-body-md">
                            {String(d.roles).padStart(2, "0")}
                          </td>
                          <td className="px-6 py-4 font-body-md text-body-md">{d.timeToFill} days</td>
                          <td className="px-6 py-4">
                            <div className="w-full bg-surface-container rounded-full h-1.5">
                              <div
                                className="bg-secondary h-1.5 rounded-full"
                                style={{ width: `${d.velocity}%` }}
                              ></div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-secondary">
                            <span className="material-symbols-outlined cursor-pointer">open_in_new</span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Candidate Quality */}
            <div className="col-span-12 lg:col-span-4 bg-surface-container-lowest border border-outline-variant p-6 rounded-xl">
              <h3 className="font-headline-md text-headline-md text-primary mb-6">Candidate Quality</h3>
              <div className="relative flex items-center justify-center py-8">
                <svg className="w-48 h-48 -rotate-90">
                  <circle
                    className="text-surface-container"
                    cx="96"
                    cy="96"
                    fill="transparent"
                    r="80"
                    stroke="currentColor"
                    strokeWidth="12"
                  ></circle>
                  <circle
                    className="text-secondary"
                    cx="96"
                    cy="96"
                    fill="transparent"
                    r="80"
                    stroke="currentColor"
                    strokeDasharray="502.4"
                    strokeDashoffset="125.6"
                    strokeWidth="12"
                  ></circle>
                </svg>
                <div className="absolute flex flex-col items-center">
                  <span className="font-headline-xl text-headline-xl text-primary">75%</span>
                  <span className="font-label-md text-label-md text-on-surface-variant">A-Grade</span>
                </div>
              </div>
              <div className="space-y-4 mt-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-secondary"></div>
                    <span className="font-body-md text-body-md">Highly Qualified</span>
                  </div>
                  <span className="font-body-md text-body-md font-bold">1,824</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-surface-container-high"></div>
                    <span className="font-body-md text-body-md">Meeting Requirements</span>
                  </div>
                  <span className="font-body-md text-body-md font-bold">608</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
