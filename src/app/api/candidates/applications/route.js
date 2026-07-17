import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getDb } from "@/lib/mongodb";
import { getCurrentCandidateId } from "@/lib/candidate";

// Pipeline stages used to render the progress stepper.
const STAGES = ["Applied", "Screen", "Interview", "Offer"];

function words(str = "") {
  const STOP = new Set(["and", "of", "the", "dept", "department", "team", "senior", "junior", "lead"]);
  return (str || "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w && w.length > 2 && !STOP.has(w));
}

// Map a stored listStatus/stage to a pipeline stage index (0-3), or -1 if closed/declined.
function stageIndex(status = "Applied", stage = "") {
  const s = `${status} ${stage}`.toLowerCase();
  if (/declin|closed|reject|withdrawn/.test(s)) return -1;
  if (/offer/.test(s)) return 3;
  if (/interview/.test(s)) return 2;
  if (/screen/.test(s)) return 1;
  return 0;
}

// GET /api/candidates/applications -> jobs this candidate applied to
export async function GET() {
  try {
    const candidateId = await getCurrentCandidateId();
    if (!candidateId || !ObjectId.isValid(candidateId)) {
      return NextResponse.json({ error: "Not signed in." }, { status: 401 });
    }

    const db = await getDb();
    const c = await db.collection("candidates").findOne(
      { _id: new ObjectId(candidateId) },
      { projection: { candidateId: 1, name: 1, role: 1, department: 1, listStatus: 1, stage: 1, applications: 1 } }
    );
    if (!c) return NextResponse.json({ error: "Candidate not found." }, { status: 404 });

    const status = c.listStatus || "Applied";
    const idx = stageIndex(status, c.stage);
    const closed = idx === -1;

    // Build the set of application job references.
    // Prefer an explicit `applications` array; otherwise derive from loose
    // role/department overlap with real jobs (like the employer→applicant view).
    let jobIds = [];
    if (Array.isArray(c.applications) && c.applications.length) {
      jobIds = c.applications.map((a) => a.jobId).filter(Boolean);
    }

    const jobsCol = db.collection("jobs");
    let jobs;
    if (jobIds.length) {
      jobs = await jobsCol.find({ jobId: { $in: jobIds } }).toArray();
    } else {
      const candWords = new Set([...words(c.role), ...words(c.department)]);
      const all = await jobsCol.find({}).toArray();
      jobs = all.filter((j) => {
        if (candWords.size === 0) return false;
        const jWords = new Set([...words(j.title), ...words(j.department)]);
        return [...jWords].some((w) => candWords.has(w));
      });
    }

    const applications = jobs.map((j) => ({
      jobId: j.jobId,
      title: j.title,
      company: j.company || j.department || "Company",
      department: j.department,
      location: j.location,
      type: j.type,
      status, // overall candidate status shared across applications (single pipeline)
      stageIndex: closed ? -1 : idx,
      closed,
      appliedAt: j.postedAt || j.createdAt || null,
    }));

    return NextResponse.json({ applications, stages: STAGES, total: applications.length });
  } catch (err) {
    console.error("Candidate applications GET error:", err);
    return NextResponse.json({ error: "Failed to load applications." }, { status: 500 });
  }
}
