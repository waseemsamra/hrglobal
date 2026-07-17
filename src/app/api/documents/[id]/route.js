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
    const meta = await db.collection("document_meta").findOne({ _id: new ObjectId(id) });
    if (!meta) {
      return NextResponse.json({ error: "Document not found." }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    if (searchParams.get("meta")) {
      return NextResponse.json({
        document: {
          id: meta._id.toString(),
          name: meta.name,
          candidate: meta.candidate,
          type: meta.type,
          status: meta.status,
          size: meta.size,
          contentType: meta.contentType,
          uploadedAt: meta.uploadedAt,
        },
      });
    }

    const bucket = await getBucket("documents");
    const downloadStream = bucket.openDownloadStream(meta.fileId);

    // Convert the Node stream into a Web ReadableStream for the Response.
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
    const collection = db.collection("document_meta");
    const meta = await collection.findOne({ _id: new ObjectId(id) });
    if (!meta) {
      return NextResponse.json({ error: "Document not found." }, { status: 404 });
    }

    const bucket = await getBucket("documents");
    try {
      await bucket.delete(meta.fileId);
    } catch (e) {
      // File may already be gone; continue removing metadata.
      console.warn("GridFS delete warning:", e?.message);
    }
    await collection.deleteOne({ _id: new ObjectId(id) });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Document delete error:", err);
    return NextResponse.json({ error: "Failed to delete document." }, { status: 500 });
  }
}
