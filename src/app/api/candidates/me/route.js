import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { cookies } from "next/headers";
import { CANDIDATE_COOKIE } from "@/lib/candidate";

export async function GET() {
  try {
    const store = await cookies();
    const candidateId = store.get(CANDIDATE_COOKIE)?.value;
    if (!candidateId) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

    const db = await getDb();
    const candidate = await db
      .collection("candidates")
      .findOne({ _id: new (await import("mongodb")).ObjectId(candidateId) });

    if (!candidate) return NextResponse.json({ error: "Candidate not found" }, { status: 404 });

    const { password: _p, ...safe } = candidate;
    return NextResponse.json({ candidate: safe });
  } catch (err) {
    console.error("Get candidate error:", err);
    return NextResponse.json({ error: "Failed to load profile." }, { status: 500 });
  }
}

export async function PATCH(request) {
  try {
    const store = await cookies();
    const candidateId = store.get(CANDIDATE_COOKIE)?.value;
    if (!candidateId) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

    const body = await request.json();
    const db = await getDb();

    const update = {};
    const allowed = [
      "name",
      "phone",
      "currentRole",
      "experience",
      "skills",
      "location",
      "summary",
      "avatar",
      "role",
      "department",
      "listStatus",
    ];
    allowed.forEach((field) => {
      if (field in body) update[field] = body[field];
    });

    update.updatedAt = new Date();

    const result = await db
      .collection("candidates")
      .updateOne({ _id: new (await import("mongodb")).ObjectId(candidateId) }, { $set: update });

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Candidate not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Update candidate error:", err);
    return NextResponse.json({ error: "Failed to update profile." }, { status: 500 });
  }
}
