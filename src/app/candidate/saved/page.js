import Link from "next/link";
import { redirect } from "next/navigation";
import { ObjectId } from "mongodb";
import { getDb } from "@/lib/mongodb";
import { getCurrentCandidate } from "@/lib/candidate";
import CandidateSideNav from "@/components/CandidateSideNav";
import CandidateTopNav from "@/components/CandidateTopNav";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  return { title: "Saved Jobs | CareerHub" };
}

function formatSalary(job) {
  if (job.minSalary == null && job.maxSalary == null) return null;
  const cur = (job.currency || "").replace(/\s*\(.*\)/, "") || "€";
  const fmt = (n) => (typeof n === "number" ? n.toLocaleString() : n);
  if (job.minSalary != null && job.maxSalary != null)
    return `${cur}${fmt(job.minSalary)} - ${cur}${fmt(job.maxSalary)}`;
  return `${cur}${fmt(job.minSalary ?? job.maxSalary)}`;
}

async function getSavedJobs(candidateId) {
  try {
    const db = await getDb();
    const c = await db
      .collection("candidates")
      .findOne({ _id: new ObjectId(candidateId) }, { projection: { wishlist: 1 } });
    const jobIds = (c?.wishlist || []).map((id) => (ObjectId.isValid(id) ? new ObjectId(id) : id));
    if (jobIds.length === 0) return [];

    const jobs = await db
      .collection("jobs")
      .find({ _id: { $in: jobIds } })
      .toArray();

    // Preserve wishlist order.
    const order = jobIds.map((id) => id.toString());
    jobs.sort((a, b) => order.indexOf(a._id.toString()) - order.indexOf(b._id.toString()));

    return jobs.map((j) => ({
      id: j._id.toString(),
      title: j.title,
      department: j.department,
      location: j.location,
      type: j.type,
      salary: formatSalary(j),
      postedAt: j.postedAt,
    }));
  } catch (err) {
    console.error("Saved jobs load error:", err);
    return [];
  }
}

export default async function CandidateSavedPage() {
  const candidate = await getCurrentCandidate();
  if (!candidate) redirect("/candidate/login");

  const saved = await getSavedJobs(candidate.id);

  return (
    <div className="flex min-h-screen bg-background text-on-surface font-body-md">
      <CandidateSideNav candidate={candidate} />

      <main className="flex-1 flex flex-col">
        <CandidateTopNav active="My Applications" />

        <div className="flex-1 px-margin-desktop max-w-container-max mx-auto w-full py-8 space-y-8">
          <div>
            <h1 className="font-headline-xl text-headline-xl text-primary">Saved Jobs</h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant mt-2">
              Manage your bookmarked opportunities. Apply when you&apos;re ready.
            </p>
          </div>

          {/* Summary */}
          <div className="grid grid-cols-2 gap-4 max-w-md">
            <div className="bg-surface-container-lowest border border-outline-variant p-5 rounded-xl shadow-sm">
              <p className="font-headline-lg text-headline-lg text-secondary">{saved.length}</p>
              <p className="font-label-md text-label-md text-on-surface-variant uppercase mt-1">Total Saved</p>
            </div>
          </div>

          {saved.length === 0 ? (
            <section className="flex flex-col items-center justify-center py-20 bg-surface-container-lowest border border-dashed border-outline-variant rounded-3xl text-center">
              <div className="w-16 h-16 mb-6 rounded-2xl bg-surface-container-high flex items-center justify-center">
                <span className="material-symbols-outlined text-[36px] text-on-surface-variant">
                  bookmark
                </span>
              </div>
              <h2 className="font-headline-lg text-headline-lg text-primary mb-2">No saved jobs yet</h2>
              <p className="font-body-lg text-body-lg text-on-surface-variant max-w-sm mb-8">
                Start your search and bookmark opportunities that align with your career goals.
              </p>
              <Link
                href="/jobs"
                className="px-8 py-3 bg-secondary text-on-secondary rounded-lg font-headline-md text-headline-md hover:opacity-90 transition-all shadow-md"
              >
                Explore New Jobs
              </Link>
            </section>
          ) : (
            <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {saved.map((job) => (
                <div
                  key={job.id}
                  className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 hover:shadow-lg transition-all group flex flex-col"
                >
                  <div className="flex justify-between items-start mb-6">
                    <div className="w-12 h-12 bg-surface-container-low rounded-lg flex items-center justify-center border border-outline-variant">
                      <span className="material-symbols-outlined text-secondary">work</span>
                    </div>
                    <span className="material-symbols-outlined text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>
                      bookmark
                    </span>
                  </div>
                  <div className="mb-auto">
                    <h3 className="font-headline-md text-headline-md text-primary group-hover:text-secondary transition-colors">
                      {job.title}
                    </h3>
                    <p className="font-body-md text-body-md text-on-surface-variant">{job.department}</p>
                    <div className="mt-4 space-y-2">
                      <div className="flex items-center gap-2 text-on-surface-variant">
                        <span className="material-symbols-outlined text-[18px]">location_on</span>
                        <span className="font-body-md text-body-md">{job.location}</span>
                      </div>
                      {job.salary && (
                        <div className="flex items-center gap-2 text-on-surface-variant">
                          <span className="material-symbols-outlined text-[18px]">payments</span>
                          <span className="font-body-md text-body-md">{job.salary}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="mt-8 pt-6 border-t border-outline-variant flex items-center justify-between">
                    <span className="font-label-sm text-label-sm text-on-surface-variant">{job.type}</span>
                    <div className="flex gap-2">
                      <Link
                        href={`/jobs?jobId=${job.id}`}
                        className="px-4 py-2 font-label-md text-label-md text-secondary border border-secondary rounded-lg hover:bg-secondary-container transition-all"
                      >
                        Details
                      </Link>
                      <button className="px-4 py-2 font-label-md text-label-md bg-secondary text-on-secondary rounded-lg hover:opacity-90 transition-all shadow-sm">
                        Apply Now
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </section>
          )}
        </div>

        <footer className="h-20" />
      </main>
    </div>
  );
}
