import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getDb, getBucket } from "@/lib/mongodb";

// GET /api/documents/[id]        -> download the file bytes
// GET /api/documents/[id]?meta=1 -> return metadata only (JSON)
export async function GET(request, { params }) {
  try {
    const { id } = await params;
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid document id." }, { status: 400 });
    }

    const db = await getDb();
    let meta = await db.collection("document_meta").findOne({ _id: new ObjectId(id) });
    let bucketName = "documents";

    if (!meta) {
      meta = await db.collection("candidate_doc_meta").findOne({ _id: new ObjectId(id) });
      bucketName = "candidate_docs";
    }

    if (!meta) {
      return NextResponse.json({ error: "Document not found." }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    if (searchParams.get("meta")) {
      return NextResponse.json({
        document: {
          id: meta._id.toString(),
          name: meta.name,
          candidate: meta.candidate || meta.candidateId?.toString() || "Unassigned",
          type: meta.type || meta.category || "Other",
          status: meta.status || "Pending",
          size: meta.size || 0,
          contentType: meta.contentType || "application/octet-stream",
          uploadedAt: meta.uploadedAt,
        },
      });
    }

    const bucket = await getBucket(bucketName);
    const downloadStream = bucket.openDownloadStream(meta.fileId);

    const webStream = new ReadableStream({
      start(controller) {
        downloadStream.on("data", (chunk) => controller.enqueue(chunk));
        downloadStream.on("end", () => controller.close());
        downloadStream.on("error", (err) => controller.error(err));
      },
      cancel() {
        downloadStream.destroy();
      },
    });

    const disposition = searchParams.get("download")
      ? `attachment; filename="${encodeURIComponent(meta.name)}"`
      : `inline; filename="${encodeURIComponent(meta.name)}"`;

    return new Response(webStream, {
      headers: {
        "Content-Type": meta.contentType || "application/octet-stream",
        "Content-Length": String(meta.size || ""),
        "Content-Disposition": disposition,
      },
    });
  } catch (err) {
    console.error("Document download error:", err);
    return NextResponse.json({ error: "Failed to retrieve document." }, { status: 500 });
  }
}

// DELETE /api/documents/[id] -> remove metadata + GridFS file
export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid document id." }, { status: 400 });
    }

    const db = await getDb();
    const adminCollection = db.collection("document_meta");
    const candidateCollection = db.collection("candidate_doc_meta");

    let meta = await adminCollection.findOne({ _id: new ObjectId(id) });
    let collection = adminCollection;
    let bucketName = "documents";

    if (!meta) {
      meta = await candidateCollection.findOne({ _id: new ObjectId(id) });
      collection = candidateCollection;
      bucketName = "candidate_docs";
    }

    if (!meta) {
      return NextResponse.json({ error: "Document not found." }, { status: 404 });
    }

    const bucket = await getBucket(bucketName);
    try {
      await bucket.delete(meta.fileId);
    } catch (e) {
      console.warn("GridFS delete warning:", e?.message);
    }
    await collection.deleteOne({ _id: new ObjectId(id) });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Document delete error:", err);
    return NextResponse.json({ error: "Failed to delete document." }, { status: 500 });
  }
}
