import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { CANDIDATE_COOKIE } from "@/lib/candidate";

// POST /api/candidates/login -> validate against the candidates collection
export async function POST(request) {
  try {
    const body = await request.json();
    const email = (body.email || "").trim().toLowerCase();
    const password = (body.password || "").toString();
    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
    }

    const db = await getDb();
    const c = await db.collection("candidates").findOne({ email });
    // Plain-text password to match the project's current no-hash auth.
    if (!c || c.password !== password) {
      return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
    }

    const res = NextResponse.json({
      success: true,
      candidate: {
        id: c._id.toString(),
        candidateId: c.candidateId,
        name: c.name,
        email: c.email,
      },
    });
    res.cookies.set(CANDIDATE_COOKIE, c._id.toString(), {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });
    return res;
  } catch (err) {
    console.error("Candidate login error:", err);
    return NextResponse.json({ error: "Login failed. Please try again." }, { status: 500 });
  }
}

// DELETE /api/candidates/login -> sign out
export async function DELETE() {
  const res = NextResponse.json({ success: true });
  res.cookies.set(CANDIDATE_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return res;
}
