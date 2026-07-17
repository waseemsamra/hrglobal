import { NextResponse } from "next/server";
import { getDb, getBucket } from "@/lib/mongodb";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

function docTypeFromMime(mime = "", name = "") {
  const lower = (name || "").toLowerCase();
  if (mime.startsWith("image/") || /\.(png|jpe?g|gif|webp)$/.test(lower)) return "Identification";
  if (/\.pdf$/.test(lower) || mime === "application/pdf") return "PDF Document";
  if (/\.docx?$/.test(lower)) return "Word Document";
  return "Other";
}

// GET /api/documents -> list document metadata (newest first)
export async function GET() {
  try {
    const db = await getDb();
    const docs = await db
      .collection("document_meta")
      .find({})
      .sort({ uploadedAt: -1 })
      .toArray();

    const documents = docs.map((d) => ({
      id: d._id.toString(),
      fileId: d.fileId ? d.fileId.toString() : null,
      name: d.name,
      candidate: d.candidate || "Unassigned",
      type: d.type || "Other",
      status: d.status || "Pending",
      size: d.size || 0,
      contentType: d.contentType || "application/octet-stream",
      uploadedAt: d.uploadedAt,
    }));

    return NextResponse.json({ documents });
  } catch (err) {
    console.error("Documents GET error:", err);
    return NextResponse.json({ error: "Failed to load documents." }, { status: 500 });
  }
}

// POST /api/documents -> multipart upload; stores file bytes in GridFS + metadata
export async function POST(request) {
  try {
    const formData = await request.formData();
    const files = formData.getAll("files");
    const candidate = (formData.get("candidate") || "").toString().trim() || "Unassigned";
    const status = (formData.get("status") || "Pending").toString().trim();

    if (!files || files.length === 0) {
      return NextResponse.json({ error: "No files provided." }, { status: 400 });
    }

    const db = await getDb();
    const bucket = await getBucket("documents");
    const metaCollection = db.collection("document_meta");

    const saved = [];

    for (const file of files) {
      if (typeof file === "string") continue; // skip non-file fields
      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          { error: `"${file.name}" exceeds the 10MB limit.` },
          { status: 413 }
        );
      }

      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const contentType = file.type || "application/octet-stream";

      // Write bytes into GridFS.
      const fileId = await new Promise((resolve, reject) => {
        const uploadStream = bucket.openUploadStream(file.name, {
          contentType,
          metadata: { candidate },
        });
        uploadStream.on("error", reject);
        uploadStream.on("finish", () => resolve(uploadStream.id));
        uploadStream.end(buffer);
      });

      const metaDoc = {
        fileId,
        name: file.name,
        candidate,
        type: docTypeFromMime(contentType, file.name),
        status: status || "Pending",
        size: file.size,
        contentType,
        uploadedAt: new Date(),
      };

      const result = await metaCollection.insertOne(metaDoc);
      saved.push({
        id: result.insertedId.toString(),
        fileId: fileId.toString(),
        name: metaDoc.name,
        candidate: metaDoc.candidate,
        type: metaDoc.type,
        status: metaDoc.status,
        size: metaDoc.size,
        contentType: metaDoc.contentType,
        uploadedAt: metaDoc.uploadedAt,
      });
    }

    if (saved.length === 0) {
      return NextResponse.json({ error: "No valid files uploaded." }, { status: 400 });
    }

    return NextResponse.json({ success: true, documents: saved }, { status: 201 });
  } catch (err) {
    console.error("Documents POST error:", err);
    return NextResponse.json({ error: "Upload failed. Please try again." }, { status: 500 });
  }
}
