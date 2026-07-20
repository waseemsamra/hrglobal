import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";

// GET /api/jobs
// Query params (all optional):
//   status, q, location, country, city, industry, types (csv), levels (csv),
//   remote (csv), minSalary, datePosted (24h|7d|30d|all),
//   sort (relevance|newest|salary), page (1-based), pageSize
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const db = await getDb();
    const collection = db.collection("jobs");

    const status = searchParams.get("status");
    const q = (searchParams.get("q") || "").trim();    const location = (searchParams.get("location") || "").trim();
    const country = (searchParams.get("country") || "").trim();
    const city = (searchParams.get("city") || "").trim();
    const industry = (searchParams.get("industry") || "").trim();
    const types = csv(searchParams.get("types"));
    const levels = csv(searchParams.get("levels"));
    const remote = csv(searchParams.get("remote"));
    const minSalary = parseNum(searchParams.get("minSalary"));
    const datePosted = searchParams.get("datePosted") || "all";
    const sort = searchParams.get("sort") || "relevance";
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10) || 1);
    const pageSize = Math.min(50, Math.max(1, parseInt(searchParams.get("pageSize") || "10", 10) || 10));

    const query = {};
    if (status) query.status = status;

    // Optional ownership filters (used by the employer job list).
    const employerId = (searchParams.get("employerId") || "").trim();
    if (employerId) query.employerId = employerId;
    const source = (searchParams.get("source") || "").trim();
    if (source) query.source = source;

    const and = [];

    if (q) {
      const rx = new RegExp(escapeRegex(q), "i");
      and.push({ $or: [{ title: rx }, { department: rx }, { skills: rx }] });
    }
    if (location) and.push({ location: new RegExp(escapeRegex(location), "i") });
    if (country) and.push({ location: new RegExp(escapeRegex(country), "i") });
    if (city) and.push({ location: new RegExp(escapeRegex(city), "i") });
    if (industry) {
      const rx = new RegExp(escapeRegex(industry), "i");
      and.push({ $or: [{ department: rx }, { category: rx }, { skills: rx }, { title: rx }] });
    }
    if (types.length) query.type = { $in: types };
    if (levels.length) query.experience = { $in: levels };
    if (remote.length) {
      const remoteOr = [];
      for (const r of remote) {
        const rx = new RegExp(escapeRegex(r), "i");
        remoteOr.push({ location: rx }, { type: rx }, { remotePolicy: rx });
      }
      and.push({ $or: remoteOr });
    }
    if (minSalary != null) {
      and.push({ $or: [{ maxSalary: { $gte: minSalary } }, { minSalary: { $gte: minSalary } }] });
    }

    if (datePosted && datePosted !== "all") {
      const now = Date.now();
      const spanMs =
        datePosted === "24h" ? 864e5 : datePosted === "7d" ? 7 * 864e5 : datePosted === "30d" ? 30 * 864e5 : null;
      if (spanMs) query.postedAt = { $gte: new Date(now - spanMs) };
    }

    if (and.length) query.$and = and;

    let sortSpec = { postedAt: -1 };
    if (sort === "newest") sortSpec = { postedAt: -1 };
    else if (sort === "salary") sortSpec = { maxSalary: -1, minSalary: -1 };

    const total = await collection.countDocuments(query);
    const jobs = await collection
      .find(query)
      .sort(sortSpec)
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .toArray();

    const result = jobs.map((j) => ({
      id: j._id.toString(),
      jobId: j.jobId,
      title: j.title,
      department: j.department,
      location: j.location,
      type: j.type,
      experience: j.experience || null,
      minSalary: j.minSalary ?? null,
      maxSalary: j.maxSalary ?? null,
      currency: j.currency || null,
      badge: j.badge || null,
      applicants: j.applicants || 0,
      postedAt: j.postedAt,
      status: j.status || "Active",
      source: j.source || "admin",
      employerId: j.employerId ? String(j.employerId) : null,
    }));

    return NextResponse.json({
      jobs: result,
      total,
      page,
      pageSize,
      totalPages: Math.max(1, Math.ceil(total / pageSize)),
    });
  } catch (err) {
    console.error("Jobs GET error:", err);
    return NextResponse.json({ error: "Failed to load jobs." }, { status: 500 });
  }
}

function csv(v) {
  return (v || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}
function parseNum(v) {
  if (v == null || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}
function escapeRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// Map a creation source to its Job ID prefix and counter key.
const SOURCE_CONFIG = {
  admin: { prefix: "ADM", counter: "jobId_admin" },
  employer: { prefix: "EMP", counter: "jobId_employer" },
};

// Atomically increment and return the next sequence number for a counter key.
async function nextSequence(db, key) {
  const res = await db
    .collection("counters")
    .findOneAndUpdate(
      { _id: key },
      { $inc: { seq: 1 } },
      { upsert: true, returnDocument: "after" }
    );
  // Support both driver return shapes.
  const doc = res && "value" in res ? res.value : res;
  return doc?.seq ?? 1;
}

// Generate a human-readable, source-prefixed Job ID, e.g. ADM-000123 / EMP-000123.
async function generateJobId(db, source) {
  const cfg = SOURCE_CONFIG[source] || SOURCE_CONFIG.admin;
  const seq = await nextSequence(db, cfg.counter);
  return `${cfg.prefix}-${String(seq).padStart(6, "0")}`;
}

// POST /api/jobs -> create a job post
export async function POST(request) {
  try {
    const body = await request.json();
    if (!body.title || !body.department) {
      return NextResponse.json(
        { error: "Title and department are required." },
        { status: 400 }
      );
    }

    const db = await getDb();
    const collection = db.collection("jobs");
    await collection.createIndex({ jobId: 1 }, { unique: true });

    // Determine creation source (admin or employer). The same POST endpoint is
    // shared by the admin Post Management form and the future employer flow.
    const source = body.source === "employer" ? "employer" : "admin";

    // Auto-generate a source-prefixed Job ID (ADM-000123 / EMP-000123) unless
    // an explicit jobId is provided (e.g. for imports/seeding).
    const jobId = body.jobId || (await generateJobId(db, source));

    const doc = {
      jobId,
      source,
      createdBy: body.createdBy || null,
      employerId: body.employerId || null,
      title: body.title,
      department: body.department,
      location: body.location || "Remote",
      type: body.type || "Full-time",
      badge: body.badge || null,
      applicants: body.applicants || 0,
      postedAt: body.postedAt ? new Date(body.postedAt) : new Date(),
      status: body.status || "Active",
      minSalary: body.minSalary ?? null,
      maxSalary: body.maxSalary ?? null,
      currency: body.currency || null,
      experience: body.experience || null,
      education: body.education || null,
      skills: Array.isArray(body.skills) ? body.skills : [],
      perks: Array.isArray(body.perks) ? body.perks : [],
      description: body.description || "",
      keyResponsibilities: body.keyResponsibilities || "",
      additionalRequirements: body.additionalRequirements || "",
      createdAt: new Date(),
    };

    const result = await collection.insertOne(doc);
    return NextResponse.json(
      { success: true, id: result.insertedId, jobId: doc.jobId, source: doc.source },
      { status: 201 }
    );
  } catch (err) {
    if (err && err.code === 11000) {
      return NextResponse.json({ error: "Job already exists." }, { status: 409 });
    }
    console.error("Jobs POST error:", err);
    return NextResponse.json({ error: "Failed to create job." }, { status: 500 });
  }
}
