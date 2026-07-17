import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getDb } from "@/lib/mongodb";

// Routes operate on a candidate identified by their candidateId (slug).
//   PUT    /api/admin/candidates/[id] -> update candidate fields
//   DELETE /api/admin/candidates/[id] -> remove the candidate
//   PATCH  /api/admin/candidates/[id] -> toggle block (body: { blocked: bool })

// Fields an admin is allowed to edit through the management UI.
const EDITABLE = [
  "name",
  "email",
  "role",
  "department",
  "location",
  "experience",
  "listStatus",
  "status",
  "avatar",
  "recruiter",
  "stage",
];

export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    if (!body || Object.keys(body).length === 0) {
      return NextResponse.json({ error: "No fields provided." }, { status: 400 });
    }

    const db = await getDb();
    const collection = db.collection("candidates");

    const update = {};
    for (const key of EDITABLE) {
      if (key in body) update[key] = body[key];
    }
    update.updatedAt = new Date();

    const result = await collection.updateOne({ candidateId: id }, { $set: update });
    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Candidate not found." }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Admin candidate PUT error:", err);
    return NextResponse.json({ error: "Failed to update candidate." }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    const db = await getDb();
    const collection = db.collection("candidates");

    const result = await collection.deleteOne({ candidateId: id });
    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Candidate not found." }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Admin candidate DELETE error:", err);
    return NextResponse.json({ error: "Failed to delete candidate." }, { status: 500 });
  }
}

export async function PATCH(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    if (typeof body.blocked !== "boolean") {
      return NextResponse.json({ error: "Invalid request." }, { status: 400 });
    }

    const db = await getDb();
    const collection = db.collection("candidates");

    const result = await collection.updateOne(
      { candidateId: id },
      { $set: { blocked: body.blocked, updatedAt: new Date() } }
    );
    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Candidate not found." }, { status: 404 });
    }
    return NextResponse.json({ success: true, blocked: body.blocked });
  } catch (err) {
    console.error("Admin candidate PATCH error:", err);
    return NextResponse.json({ error: "Failed to update candidate." }, { status: 500 });
  }
}
