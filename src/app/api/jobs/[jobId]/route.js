import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

// Resolve a job by jobId, or by Mongo _id as a fallback.
function matchQuery(id) {
  const or = [{ jobId: id }];
  if (ObjectId.isValid(id)) or.push({ _id: new ObjectId(id) });
  return { $or: or };
}

const EDITABLE_FIELDS = [
  "title",
  "department",
  "category",
  "location",
  "type",
  "badge",
  "minSalary",
  "maxSalary",
  "currency",
  "experience",
  "education",
  "skills",
  "perks",
  "description",
  "remotePolicy",
];

const VALID_STATUSES = ["Active", "Draft", "Archived"];

// GET /api/jobs/[jobId] -> single job (for editing)
export async function GET(_request, { params }) {
  try {
    const { jobId } = await params;
    const db = await getDb();
    const job = await db.collection("jobs").findOne(matchQuery(jobId));
    if (!job) return NextResponse.json({ error: "Job not found." }, { status: 404 });

    return NextResponse.json({
      job: {
        ...job,
        _id: job._id.toString(),
        postedAt: job.postedAt ? job.postedAt.toISOString() : null,
        createdAt: job.createdAt ? job.createdAt.toISOString() : null,
        updatedAt: job.updatedAt ? job.updatedAt.toISOString() : null,
      },
    });
  } catch (err) {
    console.error("Job GET error:", err);
    return NextResponse.json({ error: "Failed to load job." }, { status: 500 });
  }
}

// PATCH /api/jobs/[jobId] -> update fields and/or status (enable/disable)
export async function PATCH(request, { params }) {
  try {
    const { jobId } = await params;
    const body = await request.json();

    const update = {};
    for (const key of EDITABLE_FIELDS) {
      if (key in body) update[key] = body[key];
    }
    if ("status" in body) {
      if (!VALID_STATUSES.includes(body.status)) {
        return NextResponse.json({ error: "Invalid status." }, { status: 400 });
      }
      update.status = body.status;
    }

    if (Object.keys(update).length === 0) {
      return NextResponse.json({ error: "No valid fields to update." }, { status: 400 });
    }
    update.updatedAt = new Date();

    const db = await getDb();
    const result = await db
      .collection("jobs")
      .updateOne(matchQuery(jobId), { $set: update });

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Job not found." }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Job PATCH error:", err);
    return NextResponse.json({ error: "Failed to update job." }, { status: 500 });
  }
}

// DELETE /api/jobs/[jobId] -> permanently remove a job
export async function DELETE(_request, { params }) {
  try {
    const { jobId } = await params;
    const db = await getDb();
    const result = await db.collection("jobs").deleteOne(matchQuery(jobId));
    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Job not found." }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Job DELETE error:", err);
    return NextResponse.json({ error: "Failed to delete job." }, { status: 500 });
  }
}
