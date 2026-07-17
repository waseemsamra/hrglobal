import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getDb } from "@/lib/mongodb";

// Collection: categories
// Shape: { _id, name, description, createdAt, updatedAt }

function serialize(doc) {
  return {
    id: doc._id.toString(),
    name: doc.name,
    description: doc.description || "",
  };
}

// GET /api/categories -> list of categories
export async function GET() {
  try {
    const db = await getDb();
    const categories = await db
      .collection("categories")
      .find({})
      .sort({ name: 1 })
      .toArray();
    return NextResponse.json({ categories: categories.map(serialize) });
  } catch (err) {
    console.error("Categories GET error:", err);
    return NextResponse.json({ error: "Failed to load categories." }, { status: 500 });
  }
}

// POST /api/categories -> { name, description }
export async function POST(request) {
  try {
    const body = await request.json();
    const name = (body.name || "").trim();
    if (!name) {
      return NextResponse.json({ error: "Category name is required." }, { status: 400 });
    }

    const db = await getDb();
    const col = db.collection("categories");

    const existing = await col.findOne({
      name: { $regex: `^${name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, $options: "i" },
    });
    if (existing) {
      return NextResponse.json({ error: "Category already exists." }, { status: 409 });
    }

    const doc = {
      name,
      description: (body.description || "").trim(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const result = await col.insertOne(doc);
    return NextResponse.json(
      { success: true, category: serialize({ ...doc, _id: result.insertedId }) },
      { status: 201 }
    );
  } catch (err) {
    console.error("Categories POST error:", err);
    return NextResponse.json({ error: "Failed to create category." }, { status: 500 });
  }
}

// PUT /api/categories -> { id, name, description }
export async function PUT(request) {
  try {
    const body = await request.json();
    const name = (body.name || "").trim();
    if (!body.id || !name) {
      return NextResponse.json({ error: "id and name are required." }, { status: 400 });
    }

    const db = await getDb();
    await db.collection("categories").updateOne(
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
    console.error("Categories PUT error:", err);
    return NextResponse.json({ error: "Failed to update category." }, { status: 500 });
  }
}

// DELETE /api/categories?id=...
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "id is required." }, { status: 400 });
    }
    const db = await getDb();
    await db.collection("categories").deleteOne({ _id: new ObjectId(id) });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Categories DELETE error:", err);
    return NextResponse.json({ error: "Failed to delete category." }, { status: 500 });
  }
}
