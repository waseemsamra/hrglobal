import { redirect } from "next/navigation";
import EmployerSideNav from "@/components/EmployerSideNav";
import EmployerTopNav from "@/components/EmployerTopNav";
import EmployerCandidateList from "@/components/EmployerCandidateList";
import { getOrgName } from "@/lib/settings";
import { getCurrentEmployer } from "@/lib/employer";
import { getDb } from "@/lib/mongodb";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  const org = await getOrgName();
  return { title: `Applicants — ${org}` };
}

// Normalize a string into significant lowercase words for loose matching.
const STOP = new Set(["and", "of", "the", "dept", "department", "team", "senior", "junior", "lead"]);
function words(str = "") {
  return (str || "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w && w.length > 2 && !STOP.has(w));
}

// A candidate relates to an employer if their linked jobId belongs to the
// employer, or their role/department loosely matches one of the employer's jobs.
function buildMatcher(jobId, employerJobWords, employerJobIds) {
  return (c) => {
    if (jobId && c.jobId && c.jobId === jobId) return true;
    if (employerJobIds.has(c.jobId)) return true;
    if (employerJobWords.size === 0) return false;
    const candWords = [...words(c.role), ...words(c.department)];
    return candWords.some((w) => employerJobWords.has(w));
  };
}

async function getEmployerCandidates(employerId, jobId) {
  try {
    const db = await getDb();
    const jobsCol = db.collection("jobs");
    const jobs = await jobsCol.find({ source: "employer", employerId }).toArray();

    const employerJobIds = new Set(jobs.map((j) => j.jobId));
    const employerJobWords = new Set();
    jobs.forEach((j) => {
      words(j.title).forEach((w) => employerJobWords.add(w));
      words(j.department).forEach((w) => employerJobWords.add(w));
    });

    let focusJob = null;
    if (jobId) focusJob = jobs.find((j) => j.jobId === jobId) || null;

    const match = buildMatcher(jobId, employerJobWords, employerJobIds);

    const docs = await db
      .collection("candidates")
      .find(
        {},
        {
          projection: {
            candidateId: 1,
            name: 1,
            email: 1,
            role: 1,
            department: 1,
            location: 1,
            experience: 1,
            listStatus: 1,
            avatar: 1,
            appliedAt: 1,
            jobId: 1,
          },
        }
      )
      .sort({ appliedAt: -1 })
      .toArray();

    const related = docs.filter(match);

    const candidates = related.map((d) => ({
      candidateId: d.candidateId,
      name: d.name,
      email: d.email || "",
      role: d.role || "—",
      location: d.location || "",
      experience: d.experience || "",
      listStatus: d.listStatus || "Applied",
      avatar: d.avatar || "",
      jobId: d.jobId || null,
    }));

    return {
      candidates,
      total: candidates.length,
      job: focusJob ? { jobId: focusJob.jobId, title: focusJob.title, department: focusJob.department } : null,
    };
  } catch (err) {
    console.error("Employer candidates load error:", err);
    return { candidates: [], total: 0, job: null };
  }
}

export default async function EmployerCandidatesPage({ searchParams }) {
  const employer = await getCurrentEmployer();
  if (!employer) redirect("/employer/login");
  const orgName = employer.company || (await getOrgName());
  const sp = await searchParams;
  const jobId = sp?.jobId || null;

  const { candidates, total, job } = await getEmployerCandidates(employer.id, jobId);

  return (
    <div className="bg-surface text-on-surface min-h-screen">
      <EmployerTopNav orgName={orgName} />
      <EmployerSideNav active="Candidates" />
      <main className="ml-64 pt-16 min-h-screen">
        <EmployerCandidateList candidates={candidates} total={total} job={job} />
      </main>
    </div>
  );
}
