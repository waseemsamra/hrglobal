import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ObjectId } from "mongodb";
import AdminShell from "@/components/AdminShell";
import { getDb } from "@/lib/mongodb";
import { serializeEmployer } from "@/lib/employer";
import EmployerStatusControls from "@/components/EmployerStatusControls";
import { getCurrentAdmin } from "@/lib/admin";

export const dynamic = "force-dynamic";

const STATUS_STYLES = {
  Active: "bg-secondary/10 text-secondary",
  Pending: "bg-tertiary/10 text-on-tertiary-container",
  Suspended: "bg-error-container text-on-error-container",
};

const JOB_STATUS_STYLES = {
  Active: "bg-secondary/10 text-secondary",
  Draft: "bg-tertiary/10 text-on-tertiary-container",
  Archived: "bg-surface-container-high text-on-surface-variant",
};

async function getEmployer(id) {
  try {
    if (!ObjectId.isValid(id)) return null;
    const db = await getDb();
    const emp = await db.collection("employers").findOne({ _id: new ObjectId(id) });
    if (!emp) return null;
    const jobs = await db
      .collection("jobs")
      .find({ source: "employer", employerId: id })
      .sort({ createdAt: -1 })
      .toArray();
    const activeJobs = jobs.filter((j) => j.status === "Active").length;
    const applicants = jobs.reduce((s, j) => s + (j.applicants || 0), 0);
    return {
      employer: serializeEmployer(emp),
      stats: { jobs: jobs.length, activeJobs, applicants },
      jobs: jobs.map((j) => ({
        id: j._id.toString(),
        jobId: j.jobId,
        title: j.title,
        department: j.department,
        location: j.location,
        status: j.status,
        applicants: j.applicants || 0,
      })),
    };
  } catch (err) {
    console.error("Employer detail load error:", err);
    return null;
  }
}

export default async function AdminEmployerDetailPage({ params }) {
  const admin = await getCurrentAdmin();
  if (!admin) redirect("/admin/login");

  const { id } = await params;
  const data = await getEmployer(id);
  if (!data) notFound();
  const { employer, stats, jobs } = data;

  return (
    <AdminShell active="Employers" title="Employer Details">
      <div className="p-8 max-w-container-max mx-auto w-full">
        <Link href="/admin/employers" className="inline-flex items-center gap-1 text-on-surface-variant hover:text-primary mb-6 text-label-md">
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          Back to Employers
        </Link>

          {/* Header card */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 mb-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-xl bg-surface-container flex items-center justify-center overflow-hidden border border-outline-variant">
                  {employer.logoId ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={`/api/employers/${employer.id}/logo`} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <span className="material-symbols-outlined text-outline text-[32px]">corporate_fare</span>
                  )}
                </div>
                <div>
                  <h2 className="font-headline-lg text-headline-lg text-on-surface">{employer.company || employer.name}</h2>
                  <p className="text-on-surface-variant text-body-md">{employer.email}</p>
                  <div className="flex items-center gap-3 mt-2 text-label-sm text-on-surface-variant">
                    {employer.industry && <span>{employer.industry}</span>}
                    {employer.location && (
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-[16px]">location_on</span>
                        {employer.location}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-end gap-3">
                <span className={`px-3 py-1 rounded-full text-label-sm font-bold ${STATUS_STYLES[employer.status] || ""}`}>
                  {employer.status}
                </span>
                <EmployerStatusControls id={employer.id} status={employer.status} />
              </div>
            </div>
            {employer.description && (
              <p className="mt-4 text-body-md text-on-surface-variant border-t border-outline-variant pt-4">
                {employer.description}
              </p>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            {[
              { label: "Total Jobs", value: stats.jobs, icon: "work" },
              { label: "Active Jobs", value: stats.activeJobs, icon: "check_circle" },
              { label: "Total Applicants", value: stats.applicants, icon: "group" },
            ].map((s) => (
              <div key={s.label} className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5">
                <div className="flex items-center gap-2 text-on-surface-variant mb-2">
                  <span className="material-symbols-outlined text-[20px]">{s.icon}</span>
                  <span className="text-label-md">{s.label}</span>
                </div>
                <p className="font-headline-xl text-headline-xl text-on-surface">{s.value}</p>
              </div>
            ))}
          </div>

          {/* Jobs */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-outline-variant">
              <h3 className="font-headline-md text-headline-md text-on-surface">Job Posts</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-surface-container-low">
                  <tr>
                    <th className="px-6 py-3 text-label-md text-on-surface-variant">Job ID</th>
                    <th className="px-6 py-3 text-label-md text-on-surface-variant">Title</th>
                    <th className="px-6 py-3 text-label-md text-on-surface-variant">Location</th>
                    <th className="px-6 py-3 text-label-md text-on-surface-variant">Applicants</th>
                    <th className="px-6 py-3 text-label-md text-on-surface-variant">Status</th>
                    <th className="px-6 py-3 text-label-md text-on-surface-variant"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant">
                  {jobs.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-10 text-center text-on-surface-variant">
                        This employer has no job posts yet.
                      </td>
                    </tr>
                  ) : (
                    jobs.map((j) => (
                      <tr key={j.id} className="hover:bg-surface-container transition-colors">
                        <td className="px-6 py-4 text-label-sm font-mono text-on-surface-variant">{j.jobId}</td>
                        <td className="px-6 py-4 font-bold text-on-surface">{j.title}</td>
                        <td className="px-6 py-4 text-body-md text-on-surface-variant">{j.location}</td>
                        <td className="px-6 py-4 text-body-md">{j.applicants}</td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-label-sm font-bold ${JOB_STATUS_STYLES[j.status] || ""}`}>
                            {j.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Link href={`/admin/candidates?jobId=${j.jobId}`} className="text-primary hover:underline text-label-md">
                            View Applicants
                          </Link>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
    </AdminShell>
  );
}
