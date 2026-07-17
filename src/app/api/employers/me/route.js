import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getDb } from "@/lib/mongodb";
import { getCurrentEmployerId, serializeEmployer } from "@/lib/employer";

// GET /api/employers/me -> the currently signed-in employer profile
export async function GET() {
  try {
    const id = await getCurrentEmployerId();
    if (!id || !ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Not signed in." }, { status: 401 });
    }
    const db = await getDb();
    const emp = await db.collection("employers").findOne({ _id: new ObjectId(id) });
    if (!emp) {
      return NextResponse.json({ error: "Employer not found." }, { status: 404 });
    }
    return NextResponse.json({ employer: serializeEmployer(emp) });
  } catch (err) {
    console.error("Employer me GET error:", err);
    return NextResponse.json({ error: "Failed to load profile." }, { status: 500 });
  }
}

// PATCH /api/employers/me -> update the signed-in employer's own profile
export async function PATCH(request) {
  try {
    const id = await getCurrentEmployerId();
    if (!id || !ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Not signed in." }, { status: 401 });
    }
    const body = await request.json();
    const update = {};
    for (const key of ["name", "company", "industry", "location", "description"]) {
      if (body[key] !== undefined) update[key] = body[key];
    }
    if (Object.keys(update).length === 0) {
      return NextResponse.json({ error: "No fields to update." }, { status: 400 });
    }
    update.updatedAt = new Date();

    const db = await getDb();
    const res = await db
      .collection("employers")
      .findOneAndUpdate({ _id: new ObjectId(id) }, { $set: update }, { returnDocument: "after" });
    const doc = res && "value" in res ? res.value : res;
    return NextResponse.json({ success: true, employer: serializeEmployer(doc) });
  } catch (err) {
    console.error("Employer me PATCH error:", err);
    return NextResponse.json({ error: "Failed to update profile." }, { status: 500 });
  }
}
