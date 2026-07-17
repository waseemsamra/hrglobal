import { notFound } from "next/navigation";
import Link from "next/link";
import EmployerSideNav from "@/components/EmployerSideNav";
import EmployerTopNav from "@/components/EmployerTopNav";
import { getOrgName } from "@/lib/settings";
import { getCurrentEmployer } from "@/lib/employer";
import { getDb } from "@/lib/mongodb";

export const dynamic = "force-dynamic";

const STATUS_STYLES = {
  Applied: "bg-surface-container-high text-on-surface-variant",
  Screening: "bg-secondary/10 text-secondary",
  Interviewing: "bg-tertiary/10 text-on-tertiary-container",
  Offered: "bg-tertiary-fixed/40 text-on-tertiary-fixed",
  Declined: "bg-error-container text-on-error-container",
};

const STOP = new Set(["and", "of", "the", "dept", "department", "team", "senior", "junior", "lead"]);
function words(str = "") {
  return (str || "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w && w.length > 2 && !STOP.has(w));
}

async function getEmployerCandidate(employerId, candidateId) {
  try {
    const db = await getDb();

    const c = await db.collection("candidates").findOne({ candidateId });
    if (!c) return null;

    // Scope: only show this candidate if they relate to the employer's jobs.
    const jobs = await db.collection("jobs").find({ source: "employer", employerId }).toArray();
    const employerJobIds = new Set(jobs.map((j) => j.jobId));
    const employerJobWords = new Set();
    jobs.forEach((j) => {
      words(j.title).forEach((w) => employerJobWords.add(w));
      words(j.department).forEach((w) => employerJobWords.add(w));
    });

    const related =
      (c.jobId && employerJobIds.has(c.jobId)) ||
      [...words(c.role), ...words(c.department)].some((w) => employerJobWords.has(w));

    if (!related) return "forbidden";

    const score = c.score || {};
    return {
      candidateId: c.candidateId,
      name: c.name,
      email: c.email || "",
      role: c.role || "—",
      department: c.department || "—",
      location: c.location || "—",
      experience: c.experience || "—",
      listStatus: c.listStatus || "Applied",
      stage: c.stage || "—",
      recruiter: c.recruiter || "—",
      avatar: c.avatar || "",
      appliedAt: c.appliedAt || null,
      timeline: c.timeline || [],
      documents: c.documents || [],
      score: {
        overall: score.overall ?? 0,
        culturalFit: score.culturalFit ?? 0,
        technical: score.technical ?? 0,
        experience: score.experience ?? 0,
      },
    };
  } catch (err) {
    console.error("Employer candidate load error:", err);
    return null;
  }
}

function initials(name = "") {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default async function EmployerCandidateDetailPage({ params }) {
  const employer = await getCurrentEmployer();
  if (!employer) {
    const { redirect } = await import("next/navigation");
    redirect("/employer/login");
  }
  const orgName = employer.company || (await getOrgName());
  const { id } = await params;
  const result = await getEmployerCandidate(employer.id, id);
  if (!result) notFound();
  if (result === "forbidden") notFound();

  const c = result;
  const statusCls = STATUS_STYLES[c.listStatus] || STATUS_STYLES.Applied;

  return (
    <div className="bg-surface text-on-surface min-h-screen">
      <EmployerTopNav orgName={orgName} />
      <EmployerSideNav active="Applicants" />
      <main className="ml-64 pt-16 min-h-screen">
        <div className="p-gutter max-w-container-max mx-auto w-full">
          <Link
            href="/employer/candidates"
            className="inline-flex items-center gap-1 text-on-surface-variant hover:text-primary mb-6 text-label-md"
          >
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            Back to Applicants
          </Link>

          {/* Header card */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 mb-6 flex flex-wrap items-center gap-4">
            <div className="w-20 h-20 rounded-full overflow-hidden bg-surface-container-highest flex items-center justify-center font-bold text-secondary text-headline-md">
              {c.avatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={c.avatar} alt={c.name} className="w-full h-full object-cover" />
              ) : (
                initials(c.name)
              )}
            </div>
            <div className="flex-1 min-w-[200px]">
              <div className="flex items-center gap-3 flex-wrap">
                <h2 className="font-headline-lg text-headline-lg text-on-surface">{c.name}</h2>
                <span className={`px-3 py-1 rounded-full text-label-sm font-bold ${statusCls}`}>
                  {c.listStatus}
                </span>
              </div>
              <p className="text-on-surface-variant mt-1">{c.role}</p>
              <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-label-md text-on-surface-variant">
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px]">mail</span>
                  {c.email}
                </span>
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px]">location_on</span>
                  {c.location}
                </span>
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px]">work_history</span>
                  {c.experience}
                </span>
              </div>
            </div>
            <div className="flex gap-2">
              <button className="flex items-center gap-2 px-4 py-2 bg-secondary text-on-secondary rounded-lg font-bold hover:opacity-90 transition-opacity">
                <span className="material-symbols-outlined text-[18px]">mail</span>
                Contact
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: timeline + documents */}
            <div className="lg:col-span-2 space-y-6">
              {/* Score */}
              <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6">
                <h3 className="font-headline-md text-headline-md text-on-surface mb-4">Match Score</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: "Overall", v: c.score.overall },
                    { label: "Cultural Fit", v: c.score.culturalFit },
                    { label: "Technical", v: c.score.technical },
                    { label: "Experience", v: c.score.experience },
                  ].map((s) => (
                    <div key={s.label} className="text-center">
                      <div className="relative w-16 h-16 mx-auto">
                        <svg className="w-16 h-16 -rotate-90" viewBox="0 0 36 36">
                          <circle cx="18" cy="18" r="15.9" fill="none" className="stroke-surface-container-high" strokeWidth="3" />
                          <circle
                            cx="18"
                            cy="18"
                            r="15.9"
                            fill="none"
                            className="stroke-secondary"
                            strokeWidth="3"
                            strokeDasharray="100"
                            strokeDashoffset={100 - s.v}
                          />
                        </svg>
                        <span className="absolute inset-0 flex items-center justify-center font-bold text-on-surface">
                          {s.v}
                        </span>
                      </div>
                      <p className="text-label-sm text-on-surface-variant mt-2">{s.label}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Timeline */}
              <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6">
                <h3 className="font-headline-md text-headline-md text-on-surface mb-4">Application Timeline</h3>
                <ol className="relative border-l border-outline-variant ml-3 space-y-6">
                  {c.timeline.length === 0 ? (
                    <li className="text-on-surface-variant text-body-md">No timeline data.</li>
                  ) : (
                    c.timeline.map((t, i) => (
                      <li key={i} className="ml-6">
                        <span
                          className={`absolute -left-[9px] w-4 h-4 rounded-full border-2 ${
                            t.state === "done"
                              ? "bg-secondary border-secondary"
                              : t.state === "current"
                              ? "bg-tertiary-fixed border-on-tertiary-fixed"
                              : "bg-surface border-outline-variant"
                          }`}
                        ></span>
                        <div className="flex items-center justify-between">
                          <p className="font-bold text-on-surface">{t.title}</p>
                          <span className="text-label-sm text-on-surface-variant">{t.date}</span>
                        </div>
                        {t.detail && <p className="text-body-md text-on-surface-variant mt-1">{t.detail}</p>}
                      </li>
                    ))
                  )}
                </ol>
              </div>

              {/* Documents */}
              <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6">
                <h3 className="font-headline-md text-headline-md text-on-surface mb-4">Documents</h3>
                {c.documents.length === 0 ? (
                  <p className="text-on-surface-variant text-body-md">No documents uploaded.</p>
                ) : (
                  <div className="space-y-3">
                    {c.documents.map((d, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-3 border border-outline-variant rounded-lg p-3"
                      >
                        <span className="material-symbols-outlined text-on-surface-variant">description</span>
                        <div className="flex-1">
                          <p className="font-bold text-on-surface">{d.name}</p>
                          <p className="text-label-sm text-on-surface-variant">{d.meta}</p>
                        </div>
                        {d.verified ? (
                          <span className="material-symbols-outlined text-secondary">verified</span>
                        ) : (
                          <span className="text-label-sm text-on-surface-variant">Unverified</span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right: quick facts */}
            <div className="space-y-6">
              <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6">
                <h3 className="font-headline-md text-headline-md text-on-surface mb-4">Details</h3>
                <dl className="space-y-3 text-body-md">
                  <div className="flex justify-between">
                    <dt className="text-on-surface-variant">Current Role</dt>
                    <dd className="font-semibold text-right">{c.role}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-on-surface-variant">Department</dt>
                    <dd className="font-semibold text-right">{c.department}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-on-surface-variant">Stage</dt>
                    <dd className="font-semibold text-right">{c.stage}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-on-surface-variant">Recruiter</dt>
                    <dd className="font-semibold text-right">{c.recruiter}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-on-surface-variant">Applied</dt>
                    <dd className="font-semibold text-right">
                      {c.appliedAt ? new Date(c.appliedAt).toLocaleDateString() : "—"}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
