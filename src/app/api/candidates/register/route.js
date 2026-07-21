import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";

export const dynamic = "force-dynamic";

export async function POST(request) {
  try {
    const formData = await request.formData();
    const name = (formData.get("name") || "").toString().trim();
    const email = (formData.get("email") || "").toString().trim().toLowerCase();
    const password = (formData.get("password") || "").toString();
    const phone = (formData.get("phone") || "").toString();
    const currentRole = (formData.get("currentRole") || "").toString();
    const experience = (formData.get("experience") || "").toString();
    const skills = JSON.parse(formData.get("skills") || "[]");
    const location = (formData.get("location") || "").toString();
    const summary = (formData.get("summary") || "").toString();
    const terms = formData.get("terms") === "true";

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
    const collection = db.collection("candidates");

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
      password,
      phone,
      currentRole,
      experience,
      skills,
      location,
      summary,
      terms,
      role: "candidate",
      department: "",
      listStatus: "Open",
      avatar: "",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await collection.insertOne(doc);
    const candidateId = result.insertedId.toString();

    await collection.updateOne(
      { _id: result.insertedId },
      { $set: { candidateId } }
    );
    return NextResponse.json(
      {
        success: true,
        candidateId: result.insertedId.toString(),
        message: "Registration successful.",
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("Candidate registration error:", err);
    return NextResponse.json(
      { error: "Registration failed. Please try again." },
      { status: 500 }
    );
  }
}
