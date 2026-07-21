import AdminShell from "@/components/AdminShell";
import CandidateList from "@/components/CandidateList";
import { getDb } from "@/lib/mongodb";
import { getCurrentAdmin } from "@/lib/admin";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Candidate Management | CareerHub",
};

export const dynamic = "force-dynamic";

// Normalize a string into a set of significant lowercase words for loose matching.
const STOP = new Set(["and", "of", "the", "dept", "department", "team", "senior", "junior", "lead"]);
function words(str = "") {
  return (str || "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w && w.length > 2 && !STOP.has(w));
}

// A candidate is "related" to a job if their role/department shares significant
// words with the job's title/department, or matches by explicit jobId if present.
function isRelated(candidate, job) {
  if (candidate.jobId && job.jobId && candidate.jobId === job.jobId) return true;
  const jobWords = new Set([...words(job.title), ...words(job.department)]);
  if (jobWords.size === 0) return false;
  const candWords = [...words(candidate.role), ...words(candidate.department)];
  return candWords.some((w) => jobWords.has(w));
}

async function getCandidates(jobId) {
  try {
    const db = await getDb();
    const collection = db.collection("candidates");

    let job = null;
    if (jobId) {
      job = await db.collection("jobs").findOne({ jobId });
    }

    const [docs, total] = await Promise.all([
      collection
        .find(
          {},
          {
            projection: {
              _id: 1,
              candidateId: 1,
              name: 1,
              email: 1,
              role: 1,
              department: 1,
              location: 1,
              experience: 1,
              listStatus: 1,
              status: 1,
              blocked: 1,
              avatar: 1,
              appliedAt: 1,
              jobId: 1,
            },
          }
        )
        .sort({ appliedAt: -1 })
        .toArray(),
      collection.countDocuments(),
    ]);

    let filtered = docs;
    if (job) {
      filtered = docs.filter((d) => isRelated(d, job));
    }

    const candidates = filtered.map((d) => ({
      candidateId: d.candidateId || d._id?.toString() || "",
      name: d.name,
      email: d.email || "",
      role: d.role || "—",
      department: d.department || "",
      location: d.location || "",
      experience: d.experience || "",
      listStatus: d.listStatus || "Applied",
      status: d.status || "Active Hiring",
      blocked: !!d.blocked,
      avatar: d.avatar || "",
    }));

    return {
      candidates,
      total: job ? candidates.length : total,
      overallTotal: total,
      job: job ? { jobId: job.jobId, title: job.title, department: job.department } : null,
    };
  } catch (err) {
    console.error("Failed to load candidates:", err);
    return { candidates: [], total: 0, overallTotal: 0, job: null };
  }
}

export default async function AdminCandidatesPage({ searchParams }) {
  const admin = await getCurrentAdmin();
  if (!admin) redirect("/admin/login");

  const sp = await searchParams;
  const jobId = sp?.jobId || null;
  const { candidates, total, job } = await getCandidates(jobId);

  return (
    <AdminShell active="Candidate Management" title="Candidates">
      <CandidateList candidates={candidates} total={total} job={job} />
    </AdminShell>
  );
}
