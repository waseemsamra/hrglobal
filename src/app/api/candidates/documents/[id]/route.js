import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getDb, getBucket } from "@/lib/mongodb";
import { getCurrentCandidateId } from "@/lib/candidate";

// GET /api/candidates/documents/[id]        -> download the file (owned by the candidate)
// GET /api/candidates/documents/[id]?meta=1 -> metadata JSON
export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const candidateId = await getCurrentCandidateId();
    if (!candidateId || !ObjectId.isValid(candidateId)) {
      return NextResponse.json({ error: "Not signed in." }, { status: 401 });
    }
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid document id." }, { status: 400 });
    }

    const db = await getDb();
    const meta = await db.collection("candidate_doc_meta").findOne({ _id: new ObjectId(id) });
    if (!meta || meta.candidateId !== candidateId) {
      return NextResponse.json({ error: "Document not found." }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    if (searchParams.get("meta")) {
      return NextResponse.json({
        document: {
          id: meta._id.toString(),
          name: meta.name,
          category: meta.category,
          status: meta.status || "Pending",
          size: meta.size || 0,
          contentType: meta.contentType || "application/octet-stream",
          uploadedAt: meta.uploadedAt,
          isPrimary: !!meta.isPrimary,
        },
      });
    }

    const bucket = await getBucket("candidate_docs");
    const fileId = typeof meta.fileId === "string" ? new ObjectId(meta.fileId) : meta.fileId;
    if (!fileId) {
      return NextResponse.json({ error: "This document has no file attached." }, { status: 422 });
    }

    // Stream the file through a buffer so we can validate size and detect
    // empty/corrupt uploads before sending bytes to the browser PDF viewer.
    const chunks = [];
    const downloadStream = bucket.openDownloadStream(fileId);
    const buffer = await new Promise((resolve, reject) => {
      downloadStream.on("data", (c) => chunks.push(c));
      downloadStream.on("end", () => resolve(Buffer.concat(chunks)));
      downloadStream.on("error", reject);
    });

    if (buffer.length === 0) {
      return NextResponse.json({ error: "This document is empty and cannot be previewed." }, { status: 422 });
    }

    return new Response(buffer, {
      headers: {
        "Content-Type": meta.contentType || "application/octet-stream",
        "Content-Length": String(buffer.length),
        "Content-Disposition": `inline; filename="${encodeURIComponent(meta.name)}"`,
      },
    });
  } catch (err) {
    console.error("Candidate document GET error:", err);
    return NextResponse.json({ error: "Failed to retrieve document." }, { status: 500 });
  }
}

// DELETE /api/candidates/documents/[id] -> remove a candidate's document + file
export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    const candidateId = await getCurrentCandidateId();
    if (!candidateId || !ObjectId.isValid(candidateId)) {
      return NextResponse.json({ error: "Not signed in." }, { status: 401 });
    }
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid document id." }, { status: 400 });
    }

    const db = await getDb();
    const collection = db.collection("candidate_doc_meta");
    const meta = await collection.findOne({ _id: new ObjectId(id) });
    if (!meta || meta.candidateId !== candidateId) {
      return NextResponse.json({ error: "Document not found." }, { status: 404 });
    }

    const bucket = await getBucket("candidate_docs");
    try {
      await bucket.delete(typeof meta.fileId === "string" ? new ObjectId(meta.fileId) : meta.fileId);
    } catch (e) {
      console.warn("Candidate doc GridFS delete warning:", e?.message);
    }
    await collection.deleteOne({ _id: new ObjectId(id) });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Candidate document DELETE error:", err);
    return NextResponse.json({ error: "Failed to delete document." }, { status: 500 });
  }
}
