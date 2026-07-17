import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getDb } from "@/lib/mongodb";

// Collection: roles
// Shape: { _id, name, category, createdAt, updatedAt }

function serialize(doc) {
  return {
    id: doc._id.toString(),
    name: doc.name,
    category: doc.category || "",
  };
}

// GET /api/roles -> list of roles
export async function GET() {
  try {
    const db = await getDb();
    const roles = await db.collection("roles").find({}).sort({ name: 1 }).toArray();
    return NextResponse.json({ roles: roles.map(serialize) });
  } catch (err) {
    console.error("Roles GET error:", err);
    return NextResponse.json({ error: "Failed to load roles." }, { status: 500 });
  }
}

// POST /api/roles -> { name, category }
export async function POST(request) {
  try {
    const body = await request.json();
    const name = (body.name || "").trim();
    if (!name) {
      return NextResponse.json({ error: "Role name is required." }, { status: 400 });
    }

    const db = await getDb();
    const col = db.collection("roles");

    const existing = await col.findOne({
      name: { $regex: `^${name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, $options: "i" },
    });
    if (existing) {
      return NextResponse.json({ error: "Role already exists." }, { status: 409 });
    }

    const doc = {
      name,
      category: (body.category || "").trim(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const result = await col.insertOne(doc);
    return NextResponse.json(
      { success: true, role: serialize({ ...doc, _id: result.insertedId }) },
      { status: 201 }
    );
  } catch (err) {
    console.error("Roles POST error:", err);
    return NextResponse.json({ error: "Failed to create role." }, { status: 500 });
  }
}

// PUT /api/roles -> { id, name, category }
export async function PUT(request) {
  try {
    const body = await request.json();
    const name = (body.name || "").trim();
    if (!body.id || !name) {
      return NextResponse.json({ error: "id and name are required." }, { status: 400 });
    }

    const db = await getDb();
    await db.collection("roles").updateOne(
      { _id: new ObjectId(body.id) },
      { $set: { name, category: (body.category || "").trim(), updatedAt: new Date() } }
    );
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Roles PUT error:", err);
    return NextResponse.json({ error: "Failed to update role." }, { status: 500 });
  }
}

// DELETE /api/roles?id=...
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "id is required." }, { status: 400 });
    }
    const db = await getDb();
    await db.collection("roles").deleteOne({ _id: new ObjectId(id) });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Roles DELETE error:", err);
    return NextResponse.json({ error: "Failed to delete role." }, { status: 500 });
  }
}
