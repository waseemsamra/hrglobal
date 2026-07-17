import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getDb, getBucket } from "@/lib/mongodb";
import { getCurrentEmployerId } from "@/lib/employer";

const MAX_LOGO_SIZE = 4 * 1024 * 1024; // 4 MB
const SETTINGS_ID = "global";

// Resolve where the logo id should be read from / written to:
// - a signed-in employer stores it on their own document
// - otherwise fall back to global organization settings (admin)
async function resolveTarget(db) {
  const employerId = await getCurrentEmployerId();
  if (employerId && ObjectId.isValid(employerId)) {
    const emp = await db.collection("employers").findOne({ _id: new ObjectId(employerId) });
    if (emp) {
      return {
        kind: "employer",
        id: employerId,
        logoId: emp.logoId || null,
      };
    }
  }
  const doc = await db.collection("settings").findOne({ _id: SETTINGS_ID });
  return { kind: "settings", id: SETTINGS_ID, logoId: doc?.data?.organization?.logoId || null };
}

async function setLogoId(db, target, fileId) {
  const value = fileId ? fileId.toString() : null;
  if (target.kind === "employer") {
    await db.collection("employers").updateOne(
      { _id: new ObjectId(target.id) },
      value === null
        ? { $unset: { logoId: "" }, $set: { updatedAt: new Date() } }
        : { $set: { logoId: value, updatedAt: new Date() } }
    );
  } else {
    await db.collection("settings").updateOne(
      { _id: SETTINGS_ID },
      value === null
        ? { $unset: { "data.organization.logoId": "" }, $set: { updatedAt: new Date() } }
        : { $set: { "data.organization.logoId": value, updatedAt: new Date() } },
      { upsert: true }
    );
  }
}

// GET /api/settings/logo -> stream the current logo image (employer or org)
export async function GET() {
  try {
    const db = await getDb();
    const target = await resolveTarget(db);
    if (!target.logoId) {
      return NextResponse.json({ error: "No logo set." }, { status: 404 });
    }
    const fileId = typeof target.logoId === "string" ? new ObjectId(target.logoId) : target.logoId;
    const file = await db.collection("logos.files").findOne({ _id: fileId });
    if (!file) {
      return NextResponse.json({ error: "Logo file not found." }, { status: 404 });
    }

    const bucket = await getBucket("logos");
    const downloadStream = bucket.openDownloadStream(fileId);
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

    return new Response(webStream, {
      headers: {
        "Content-Type": file.contentType || file.metadata?.contentType || "image/png",
        "Cache-Control": "no-cache",
      },
    });
  } catch (err) {
    console.error("Logo GET error:", err);
    return NextResponse.json({ error: "Failed to load logo." }, { status: 500 });
  }
}

// POST /api/settings/logo -> multipart upload of a single image; stores in GridFS
export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get("logo");

    if (!file || typeof file === "string") {
      return NextResponse.json({ error: "No image provided." }, { status: 400 });
    }
    const contentType = file.type || "application/octet-stream";
    if (!contentType.startsWith("image/")) {
      return NextResponse.json({ error: "File must be an image." }, { status: 400 });
    }
    if (file.size > MAX_LOGO_SIZE) {
      return NextResponse.json({ error: "Image exceeds the 4MB limit." }, { status: 413 });
    }

    const db = await getDb();
    const bucket = await getBucket("logos");
    const target = await resolveTarget(db);

    // Remove any previous logo file to avoid orphans.
    if (target.logoId) {
      try {
        await bucket.delete(
          typeof target.logoId === "string" ? new ObjectId(target.logoId) : target.logoId
        );
      } catch (e) {
        console.warn("Old logo delete warning:", e?.message);
      }
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const fileId = await new Promise((resolve, reject) => {
      const uploadStream = bucket.openUploadStream(file.name || "logo", {
        contentType,
        metadata: { contentType },
      });
      uploadStream.on("error", reject);
      uploadStream.on("finish", () => resolve(uploadStream.id));
      uploadStream.end(buffer);
    });

    await setLogoId(db, target, fileId);

    return NextResponse.json({ success: true, logoId: fileId.toString() }, { status: 201 });
  } catch (err) {
    console.error("Logo POST error:", err);
    return NextResponse.json({ error: "Upload failed. Please try again." }, { status: 500 });
  }
}

// DELETE /api/settings/logo -> remove the current logo
export async function DELETE() {
  try {
    const db = await getDb();
    const target = await resolveTarget(db);
    if (target.logoId) {
      try {
        const bucket = await getBucket("logos");
        await bucket.delete(
          typeof target.logoId === "string" ? new ObjectId(target.logoId) : target.logoId
        );
      } catch (e) {
        console.warn("Logo delete warning:", e?.message);
      }
    }
    await setLogoId(db, target, null);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Logo DELETE error:", err);
    return NextResponse.json({ error: "Failed to delete logo." }, { status: 500 });
  }
}
