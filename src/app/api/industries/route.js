import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getDb } from "@/lib/mongodb";

// Collection: industries
// Shape: { _id, name, description, createdAt, updatedAt }

function serialize(doc) {
  return {
    id: doc._id.toString(),
    name: doc.name,
    description: doc.description || "",
  };
}

// GET /api/industries -> list of industries
export async function GET() {
  try {
    const db = await getDb();
    const industries = await db
      .collection("industries")
      .find({})
      .sort({ name: 1 })
      .toArray();
    return NextResponse.json({ industries: industries.map(serialize) });
  } catch (err) {
    console.error("Industries GET error:", err);
    return NextResponse.json({ error: "Failed to load industries." }, { status: 500 });
  }
}

// POST /api/industries -> { name, description }
export async function POST(request) {
  try {
    const body = await request.json();
    const name = (body.name || "").trim();
    if (!name) {
      return NextResponse.json({ error: "Industry name is required." }, { status: 400 });
    }

    const db = await getDb();
    const col = db.collection("industries");

    const existing = await col.findOne({
      name: { $regex: `^${name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, $options: "i" },
    });
    if (existing) {
      return NextResponse.json({ error: "Industry already exists." }, { status: 409 });
    }

    const doc = {
      name,
      description: (body.description || "").trim(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const result = await col.insertOne(doc);
    return NextResponse.json(
      { success: true, industry: serialize({ ...doc, _id: result.insertedId }) },
      { status: 201 }
    );
  } catch (err) {
    console.error("Industries POST error:", err);
    return NextResponse.json({ error: "Failed to create industry." }, { status: 500 });
  }
}

// PUT /api/industries -> { id, name, description }
export async function PUT(request) {
  try {
    const body = await request.json();
    const name = (body.name || "").trim();
    if (!body.id || !name) {
      return NextResponse.json({ error: "id and name are required." }, { status: 400 });
    }

    const db = await getDb();
    await db.collection("industries").updateOne(
      { _id: new ObjectId(body.id) },
      {
        $set: {
          name,
          description: (body.description || "").trim(),
          updatedAt: new Date(),
        },
      }
    );
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Industries PUT error:", err);
    return NextResponse.json({ error: "Failed to update industry." }, { status: 500 });
  }
}

// DELETE /api/industries?id=...
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "id is required." }, { status: 400 });
    }
    const db = await getDb();
    await db.collection("industries").deleteOne({ _id: new ObjectId(id) });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Industries DELETE error:", err);
    return NextResponse.json({ error: "Failed to delete industry." }, { status: 500 });
  }
}
