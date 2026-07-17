import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getDb, getBucket } from "@/lib/mongodb";
import { getCurrentCandidateId } from "@/lib/candidate";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

function ext(name = "") {
  const m = (name || "").toLowerCase().match(/\.([a-z0-9]+)$/);
  return m ? m[1] : "";
}

function categoryFor(name = "", mime = "") {
  const n = (name || "").toLowerCase();
  if (/resume|cv|curriculum/i.test(n)) return "Resume";
  if (/cover/i.test(n)) return "Cover Letter";
  if (/passport|id|license|identif|badge/i.test(n)) return "Identification";
  if (/degree|transcript|education|diploma|cert/i.test(n)) return "Education";
  if (/reference/i.test(n)) return "References";
  if (mime.startsWith("image/")) return "Identification";
  return "Other";
}

// GET /api/candidates/documents -> list current candidate's documents
export async function GET() {
  try {
    const candidateId = await getCurrentCandidateId();
    if (!candidateId || !ObjectId.isValid(candidateId)) {
      return NextResponse.json({ error: "Not signed in." }, { status: 401 });
    }
    const db = await getDb();
    const docs = await db
      .collection("candidate_doc_meta")
      .find({ candidateId })
      .sort({ uploadedAt: -1 })
      .toArray();

    const documents = docs.map((d) => ({
      id: d._id.toString(),
      name: d.name,
      category: d.category,
      status: d.status || "Pending",
      size: d.size || 0,
      contentType: d.contentType || "application/octet-stream",
      ext: d.ext || "",
      isPrimary: !!d.isPrimary,
      uploadedAt: d.uploadedAt,
    }));
    return NextResponse.json({ documents });
  } catch (err) {
    console.error("Candidate documents GET error:", err);
    return NextResponse.json({ error: "Failed to load documents." }, { status: 500 });
  }
}

// POST /api/candidates/documents -> upload files for the current candidate
export async function POST(request) {
  try {
    const candidateId = await getCurrentCandidateId();
    if (!candidateId || !ObjectId.isValid(candidateId)) {
      return NextResponse.json({ error: "Not signed in." }, { status: 401 });
    }

    const formData = await request.formData();
    const files = formData.getAll("files");
    if (!files || files.length === 0) {
      return NextResponse.json({ error: "No files provided." }, { status: 400 });
    }

    const db = await getDb();
    const bucket = await getBucket("candidate_docs");
    const meta = db.collection("candidate_doc_meta");

    const saved = [];
    const isFirst = (await meta.countDocuments({ candidateId })) === 0;

    for (const file of files) {
      if (typeof file === "string") continue;
      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          { error: `"${file.name}" exceeds the 10MB limit.` },
          { status: 413 }
        );
      }
      const contentType = file.type || "application/octet-stream";
      const buffer = Buffer.from(await file.arrayBuffer());
      const name = file.name || "document";

      const fileId = await new Promise((resolve, reject) => {
        const uploadStream = bucket.openUploadStream(name, {
          contentType,
          metadata: { candidateId },
        });
        uploadStream.on("error", reject);
        uploadStream.on("finish", () => resolve(uploadStream.id));
        uploadStream.end(buffer);
      });

      const doc = {
        candidateId,
        fileId,
        name,
        category: categoryFor(name, contentType),
        status: "Pending",
        size: file.size,
        contentType,
        ext: ext(name),
        isPrimary: false,
        uploadedAt: new Date(),
      };

      // First uploaded document becomes the primary resume.
      if (isFirst && /resume|cv|curriculum/i.test(name)) doc.isPrimary = true;

      const res = await meta.insertOne(doc);
      saved.push({ id: res.insertedId.toString(), name: doc.name });
    }

    if (saved.length === 0) {
      return NextResponse.json({ error: "No valid files uploaded." }, { status: 400 });
    }
    return NextResponse.json({ success: true, documents: saved }, { status: 201 });
  } catch (err) {
    console.error("Candidate documents POST error:", err);
    return NextResponse.json({ error: "Upload failed. Please try again." }, { status: 500 });
  }
}
