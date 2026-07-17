import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { EMPLOYER_COOKIE, serializeEmployer } from "@/lib/employer";

// POST /api/employers/login -> validate credentials and set the employer cookie
export async function POST(request) {
  try {
    const body = await request.json();
    const email = (body.email || "").trim().toLowerCase();
    const password = (body.password || "").toString();
    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
    }

    const db = await getDb();
    const emp = await db.collection("employers").findOne({ email });
    if (!emp || emp.password !== password) {
      return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
    }
    if (emp.status === "Suspended") {
      return NextResponse.json(
        { error: "This account has been suspended. Contact your administrator." },
        { status: 403 }
      );
    }
    if (emp.status === "Pending") {
      return NextResponse.json(
        { error: "Your account is awaiting admin approval. You'll be able to sign in once approved." },
        { status: 403 }
      );
    }

    const res = NextResponse.json({ success: true, employer: serializeEmployer(emp) });
    res.cookies.set(EMPLOYER_COOKIE, emp._id.toString(), {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });
    return res;
  } catch (err) {
    console.error("Employer login error:", err);
    return NextResponse.json({ error: "Login failed. Please try again." }, { status: 500 });
  }
}

// DELETE /api/employers/login -> sign out (clear cookie)
export async function DELETE() {
  const res = NextResponse.json({ success: true });
  res.cookies.set(EMPLOYER_COOKIE, "", { path: "/", maxAge: 0 });
  return res;
}
