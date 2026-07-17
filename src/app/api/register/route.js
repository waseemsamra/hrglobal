import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";

const ALLOWED_SIZES = [
  "1-50 employees",
  "51-200 employees",
  "201-1000 employees",
  "1000+ employees",
];

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(request) {
  try {
    const body = await request.json();
    const email = (body.email || "").trim().toLowerCase();
    const firstName = (body.firstName || "").trim();
    const lastName = (body.lastName || "").trim();
    const orgSize = (body.orgSize || "").trim();

    // Validation
    if (!email || !isValidEmail(email)) {
      return NextResponse.json(
        { error: "A valid work email is required." },
        { status: 400 }
      );
    }
    if (!firstName) {
      return NextResponse.json(
        { error: "First name is required." },
        { status: 400 }
      );
    }
    if (!lastName) {
      return NextResponse.json(
        { error: "Last name is required." },
        { status: 400 }
      );
    }
    if (orgSize && !ALLOWED_SIZES.includes(orgSize)) {
      return NextResponse.json(
        { error: "Invalid organization size." },
        { status: 400 }
      );
    }

    const db = await getDb();
    const collection = db.collection("registrations");

    // Ensure a unique index on email so we don't store duplicates.
    await collection.createIndex({ email: 1 }, { unique: true });

    const doc = {
      email,
      firstName,
      lastName,
      orgSize: orgSize || ALLOWED_SIZES[0],
      createdAt: new Date(),
    };

    const result = await collection.insertOne(doc);

    return NextResponse.json(
      { success: true, id: result.insertedId },
      { status: 201 }
    );
  } catch (err) {
    // Duplicate key error from MongoDB
    if (err && err.code === 11000) {
      return NextResponse.json(
        { error: "An account with this email already exists." },
        { status: 409 }
      );
    }
    console.error("Registration error:", err);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const db = await getDb();
    const collection = db.collection("registrations");
    const count = await collection.countDocuments();
    return NextResponse.json({ count });
  } catch (err) {
    console.error("Registration GET error:", err);
    return NextResponse.json(
      { error: "Something went wrong." },
      { status: 500 }
    );
  }
}
