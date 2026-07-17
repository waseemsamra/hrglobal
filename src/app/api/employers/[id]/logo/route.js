import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getDb, getBucket } from "@/lib/mongodb";

// GET /api/employers/[id]/logo -> stream a specific employer's logo
export async function GET(request, { params }) {
  try {
    const { id } = await params;
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid employer id." }, { status: 400 });
    }
    const db = await getDb();
    const emp = await db.collection("employers").findOne({ _id: new ObjectId(id) });
    if (!emp?.logoId) {
      return NextResponse.json({ error: "No logo set." }, { status: 404 });
    }
    const fileId = typeof emp.logoId === "string" ? new ObjectId(emp.logoId) : emp.logoId;
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
    console.error("Employer logo GET error:", err);
    return NextResponse.json({ error: "Failed to load logo." }, { status: 500 });
  }
}
