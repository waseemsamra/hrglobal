import { cookies } from "next/headers";
import { ObjectId } from "mongodb";
import { getDb } from "@/lib/mongodb";

export const ADMIN_COOKIE = "adminId";

// Returns the current admin user document (or null) based on the session cookie.
export async function getCurrentAdmin() {
  try {
    const store = await cookies();
    const id = store.get(ADMIN_COOKIE)?.value || null;
    if (!id || !ObjectId.isValid(id)) return null;
    const db = await getDb();
    const admin = await db
      .collection("admins")
      .findOne(
        { _id: new ObjectId(id) },
        { projection: { password: 0 } }
      );
    return admin || null;
  } catch {
    return null;
  }
}

// Returns the current admin id from the session cookie, or null.
export async function getCurrentAdminId() {
  try {
    const store = await cookies();
    return store.get(ADMIN_COOKIE)?.value || null;
  } catch {
    return null;
  }
}

export function serializeAdmin(admin) {
  return {
    id: admin._id.toString(),
    email: admin.email,
    name: admin.name || "",
    role: admin.role || "Admin",
  };
}
