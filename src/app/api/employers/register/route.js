import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { serializeEmployer } from "@/lib/employer";

// POST /api/employers/register -> public employer self-signup.
// Always creates the account as "Pending" so an admin can approve it.
export async function POST(request) {
  try {
    const body = await request.json();
    const name = (body.name || "").trim();
    const email = (body.email || "").trim().toLowerCase();
    const password = (body.password || "").toString();

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Name, email and password are required." },
        { status: 400 }
      );
    }
    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters." },
        { status: 400 }
      );
    }

    const db = await getDb();
    const collection = db.collection("employers");
    await collection.createIndex({ email: 1 }, { unique: true });

    const existing = await collection.findOne({ email });
    if (existing) {
      return NextResponse.json(
        { error: "An account with this email already exists." },
        { status: 409 }
      );
    }

    const doc = {
      name,
      email,
      company: (body.company || name).trim(),
      industry: (body.industry || "").trim(),
      location: (body.location || "").trim(),
      description: (body.description || "").trim(),
      // Plain-text password to match the project's current no-hash auth.
      password,
      // Self-registrations always start as Pending, awaiting admin approval.
      status: "Pending",
      logoId: null,
      createdAt: new Date(),
    };

    const result = await collection.insertOne(doc);
    return NextResponse.json(
      { success: true, employer: serializeEmployer({ ...doc, _id: result.insertedId }) },
      { status: 201 }
    );
  } catch (err) {
    if (err && err.code === 11000) {
      return NextResponse.json(
        { error: "An account with this email already exists." },
        { status: 409 }
      );
    }
    console.error("Employer register error:", err);
    return NextResponse.json({ error: "Registration failed. Please try again." }, { status: 500 });
  }
}
