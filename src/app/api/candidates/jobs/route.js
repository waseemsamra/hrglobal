import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getDb } from "@/lib/mongodb";
import { getCurrentCandidateId } from "@/lib/candidate";

// GET /api/candidates/jobs -> { viewed: [...jobId], wishlist: [...jobId] }
export async function GET() {
  try {
    const candidateId = await getCurrentCandidateId();
    if (!candidateId || !ObjectId.isValid(candidateId)) {
      return NextResponse.json({ error: "Not signed in." }, { status: 401 });
    }
    const db = await getDb();
    const c = await db
      .collection("candidates")
      .findOne(
        { _id: new ObjectId(candidateId) },
        { projection: { viewedJobs: 1, wishlist: 1 } }
      );
    return NextResponse.json({
      viewed: c?.viewedJobs || [],
      wishlist: c?.wishlist || [],
    });
  } catch (err) {
    console.error("Candidate jobs GET error:", err);
    return NextResponse.json({ error: "Failed to load." }, { status: 500 });
  }
}

// POST /api/candidates/jobs -> { action: "view"|"wishlist", jobId, value }
export async function POST(request) {
  try {
    const candidateId = await getCurrentCandidateId();
    if (!candidateId || !ObjectId.isValid(candidateId)) {
      return NextResponse.json({ error: "Not signed in." }, { status: 401 });
    }
    const body = await request.json().catch(() => ({}));
    const { action, jobId, value } = body;
    if (!jobId || (action !== "view" && action !== "wishlist")) {
      return NextResponse.json({ error: "Invalid request." }, { status: 400 });
    }

    const db = await getDb();
    const field = action === "view" ? "viewedJobs" : "wishlist";
    const update =
      value === false
        ? { $pull: { [field]: jobId } }
        : { $addToSet: { [field]: jobId } };

    await db
      .collection("candidates")
      .updateOne({ _id: new ObjectId(candidateId) }, update);

    return NextResponse.json({ success: true, action, jobId, value: value !== false });
  } catch (err) {
    console.error("Candidate jobs POST error:", err);
    return NextResponse.json({ error: "Failed to update." }, { status: 500 });
  }
}
