import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getDb } from "@/lib/mongodb";

function serialize(doc) {
  return { id: doc._id.toString(), name: doc.name, description: doc.description || "" };
}

export async function GET() {
  try {
    const db = await getDb();
    const items = await db.collection("experience").find({}).sort({ name: 1 }).toArray();
    return NextResponse.json({ items: items.map(serialize) });
  } catch (err) {
    console.error("Experience GET error:", err);
    return NextResponse.json({ error: "Failed to load experience." }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const name = (body.name || "").trim();
    if (!name) return NextResponse.json({ error: "Name is required." }, { status: 400 });

    const db = await getDb();
    const existing = await db.collection("experience").findOne({ name: { $regex: `^${name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, $options: "i" } });
    if (existing) return NextResponse.json({ error: "Item already exists." }, { status: 409 });

    const doc = { name, description: (body.description || "").trim(), createdAt: new Date(), updatedAt: new Date() };
    const result = await db.collection("experience").insertOne(doc);
    return NextResponse.json({ success: true, item: serialize({ ...doc, _id: result.insertedId }) }, { status: 201 });
  } catch (err) {
    console.error("Experience POST error:", err);
    return NextResponse.json({ error: "Failed to create item." }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const body = await request.json();
    const name = (body.name || "").trim();
    if (!body.id || !name) return NextResponse.json({ error: "id and name are required." }, { status: 400 });

    const db = await getDb();
    await db.collection("experience").updateOne({ _id: new ObjectId(body.id) }, { $set: { name, description: (body.description || "").trim(), updatedAt: new Date() } });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Experience PUT error:", err);
    return NextResponse.json({ error: "Failed to update item." }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "id is required." }, { status: 400 });

    const db = await getDb();
    await db.collection("experience").deleteOne({ _id: new ObjectId(id) });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Experience DELETE error:", err);
    return NextResponse.json({ error: "Failed to delete item." }, { status: 500 });
  }
}
