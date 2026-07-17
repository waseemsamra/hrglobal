import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { ADMIN_COOKIE, serializeAdmin } from "@/lib/admin";

// POST /api/admin/login -> validate admin credentials and set the session cookie
export async function POST(request) {
  try {
    const body = await request.json();
    const email = (body.email || "").trim().toLowerCase();
    const password = (body.password || "").toString();
    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
    }

    const db = await getDb();
    // Match by email OR username so admins can sign in with either.
    const admin = await db.collection("admins").findOne({
      $or: [{ email }, { username: body.username || email }],
    });
    // Plain-text password check, matching the project's existing no-hash auth.
    if (!admin || admin.password !== password) {
      return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
    }
    if (admin.status === "Suspended" || admin.blocked) {
      return NextResponse.json(
        { error: "This account has been suspended. Contact a super administrator." },
        { status: 403 }
      );
    }

    const res = NextResponse.json({ success: true, admin: serializeAdmin(admin) });
    res.cookies.set(ADMIN_COOKIE, admin._id.toString(), {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });
    return res;
  } catch (err) {
    console.error("Admin login error:", err);
    return NextResponse.json({ error: "Login failed. Please try again." }, { status: 500 });
  }
}

// DELETE /api/admin/login -> sign out (clear cookie)
export async function DELETE() {
  const res = NextResponse.json({ success: true });
  res.cookies.set(ADMIN_COOKIE, "", { path: "/", maxAge: 0 });
  return res;
}
