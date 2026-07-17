import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { serializeEmployer } from "@/lib/employer";

// GET /api/employers -> list employers with live job/applicant counts
export async function GET() {
  try {
    const db = await getDb();
    const employers = await db
      .collection("employers")
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    // Aggregate job + applicant counts per employer in one pass.
    const jobStats = await db
      .collection("jobs")
      .aggregate([
        { $match: { source: "employer" } },
        {
          $group: {
            _id: "$employerId",
            jobs: { $sum: 1 },
            activeJobs: {
              $sum: { $cond: [{ $eq: ["$status", "Active"] }, 1, 0] },
            },
            applicants: { $sum: { $ifNull: ["$applicants", 0] } },
          },
        },
      ])
      .toArray();

    const statMap = new Map(jobStats.map((s) => [String(s._id), s]));

    const list = employers.map((e) => {
      const s = statMap.get(String(e._id)) || {};
      return {
        ...serializeEmployer(e),
        jobs: s.jobs || 0,
        activeJobs: s.activeJobs || 0,
        applicants: s.applicants || 0,
      };
    });

    return NextResponse.json({ employers: list });
  } catch (err) {
    console.error("Employers GET error:", err);
    return NextResponse.json({ error: "Failed to load employers." }, { status: 500 });
  }
}

// POST /api/employers -> create a new employer (admin)
export async function POST(request) {
  try {
    const body = await request.json();
    const name = (body.name || "").trim();
    const email = (body.email || "").trim().toLowerCase();
    if (!name || !email) {
      return NextResponse.json({ error: "Name and email are required." }, { status: 400 });
    }

    const db = await getDb();
    const collection = db.collection("employers");
    await collection.createIndex({ email: 1 }, { unique: true });

    const existing = await collection.findOne({ email });
    if (existing) {
      return NextResponse.json({ error: "An employer with this email already exists." }, { status: 409 });
    }

    const doc = {
      name,
      email,
      company: (body.company || name).trim(),
      industry: (body.industry || "").trim(),
      location: (body.location || "").trim(),
      description: (body.description || "").trim(),
      // Plain-text password for the no-frills auth requested (no hashing yet).
      password: body.password || "password123",
      status: body.status || "Active",
      logoId: null,
      createdAt: new Date(),
    };

    const result = await collection.insertOne(doc);
    return NextResponse.json(
      { success: true, employer: serializeEmployer({ ...doc, _id: result.insertedId }) },
      { status: 201 }
    );
  } catch (err) {
    if (err && err.code === 11000) {
      return NextResponse.json({ error: "An employer with this email already exists." }, { status: 409 });
    }
    console.error("Employers POST error:", err);
    return NextResponse.json({ error: "Failed to create employer." }, { status: 500 });
  }
}
