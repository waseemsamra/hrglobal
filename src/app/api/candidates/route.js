import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";

// GET /api/candidates            -> list of candidates (summary)
// GET /api/candidates?id=<id>    -> single candidate (full document)
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const db = await getDb();
    const collection = db.collection("candidates");

    if (id) {
      const candidate = await collection.findOne({ candidateId: id });
      if (!candidate) {
        return NextResponse.json({ error: "Candidate not found." }, { status: 404 });
      }
      return NextResponse.json({ candidate });
    }

    const candidates = await collection
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
            stage: 1,
            status: 1,
            score: 1,
            avatar: 1,
          },
        }
      )
      .sort({ appliedAt: -1 })
      .toArray();

    return NextResponse.json({ candidates });
  } catch (err) {
    console.error("Candidates GET error:", err);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}

// POST /api/candidates -> create a new candidate
export async function POST(request) {
  try {
    const body = await request.json();
    if (!body.name || !body.role) {
      return NextResponse.json(
        { error: "Name and role are required." },
        { status: 400 }
      );
    }

    const db = await getDb();
    const collection = db.collection("candidates");
    await collection.createIndex({ candidateId: 1 }, { unique: true });

    const doc = {
      candidateId: body.candidateId || `cand_${Date.now()}`,
      name: body.name,
      role: body.role,
      department: body.department || "",
      appliedAt: body.appliedAt ? new Date(body.appliedAt) : new Date(),
      stage: body.stage || "Applied",
      status: body.status || "Active Hiring",
      recruiter: body.recruiter || "",
      avatar: body.avatar || "",
      score: body.score || { overall: 0, culturalFit: 0, technical: 0, experience: 0 },
      timeline: body.timeline || [],
      documents: body.documents || [],
      feedback: body.feedback || [],
      createdAt: new Date(),
    };

    const result = await collection.insertOne(doc);
    return NextResponse.json({ success: true, id: result.insertedId }, { status: 201 });
  } catch (err) {
    if (err && err.code === 11000) {
      return NextResponse.json({ error: "Candidate already exists." }, { status: 409 });
    }
    console.error("Candidates POST error:", err);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}
