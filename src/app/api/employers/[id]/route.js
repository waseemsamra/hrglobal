import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getDb } from "@/lib/mongodb";
import { serializeEmployer } from "@/lib/employer";

const EDITABLE = ["name", "company", "industry", "location", "description", "password"];
const STATUSES = ["Active", "Pending", "Suspended"];

// GET /api/employers/[id] -> employer detail + their jobs + aggregate stats
export async function GET(request, { params }) {
  try {
    const { id } = await params;
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid employer id." }, { status: 400 });
    }
    const db = await getDb();
    const emp = await db.collection("employers").findOne({ _id: new ObjectId(id) });
    if (!emp) {
      return NextResponse.json({ error: "Employer not found." }, { status: 404 });
    }

    const jobs = await db
      .collection("jobs")
      .find({ source: "employer", employerId: id })
      .sort({ createdAt: -1 })
      .toArray();

    const activeJobs = jobs.filter((j) => j.status === "Active").length;
    const applicants = jobs.reduce((sum, j) => sum + (j.applicants || 0), 0);

    return NextResponse.json({
      employer: serializeEmployer(emp),
      stats: { jobs: jobs.length, activeJobs, applicants },
      jobs: jobs.map((j) => ({
        id: j._id.toString(),
        jobId: j.jobId,
        title: j.title,
        department: j.department,
        location: j.location,
        status: j.status,
        applicants: j.applicants || 0,
        postedAt: j.postedAt,
      })),
    });
  } catch (err) {
    console.error("Employer GET error:", err);
    return NextResponse.json({ error: "Failed to load employer." }, { status: 500 });
  }
}

// PATCH /api/employers/[id] -> update profile fields and/or status
export async function PATCH(request, { params }) {
  try {
    const { id } = await params;
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid employer id." }, { status: 400 });
    }
    const body = await request.json();
    const update = {};
    for (const key of EDITABLE) {
      if (body[key] !== undefined) update[key] = body[key];
    }
    if (body.status !== undefined) {
      if (!STATUSES.includes(body.status)) {
        return NextResponse.json({ error: "Invalid status." }, { status: 400 });
      }
      update.status = body.status;
    }
    if (Object.keys(update).length === 0) {
      return NextResponse.json({ error: "No fields to update." }, { status: 400 });
    }
    update.updatedAt = new Date();

    const db = await getDb();
    const res = await db
      .collection("employers")
      .findOneAndUpdate(
        { _id: new ObjectId(id) },
        { $set: update },
        { returnDocument: "after" }
      );
    const doc = res && "value" in res ? res.value : res;
    if (!doc) {
      return NextResponse.json({ error: "Employer not found." }, { status: 404 });
    }
    return NextResponse.json({ success: true, employer: serializeEmployer(doc) });
  } catch (err) {
    console.error("Employer PATCH error:", err);
    return NextResponse.json({ error: "Failed to update employer." }, { status: 500 });
  }
}

// DELETE /api/employers/[id] -> remove employer (their jobs are kept but unlinked)
export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid employer id." }, { status: 400 });
    }
    const db = await getDb();
    const res = await db.collection("employers").deleteOne({ _id: new ObjectId(id) });
    if (res.deletedCount === 0) {
      return NextResponse.json({ error: "Employer not found." }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Employer DELETE error:", err);
    return NextResponse.json({ error: "Failed to delete employer." }, { status: 500 });
  }
}
