import { cookies } from "next/headers";
import { ObjectId } from "mongodb";
import { getDb } from "@/lib/mongodb";

export const EMPLOYER_COOKIE = "employerId";

// Read the currently signed-in employer id from cookies (server components).
export async function getCurrentEmployerId() {
  try {
    const store = await cookies();
    return store.get(EMPLOYER_COOKIE)?.value || null;
  } catch {
    return null;
  }
}

// Load the current employer document, or null if not signed in / not found.
export async function getCurrentEmployer() {
  const id = await getCurrentEmployerId();
  if (!id || !ObjectId.isValid(id)) return null;
  try {
    const db = await getDb();
    const emp = await db.collection("employers").findOne({ _id: new ObjectId(id) });
    return emp ? serializeEmployer(emp) : null;
  } catch {
    return null;
  }
}

// Convert a raw employer document into a plain, serializable object.
export function serializeEmployer(doc) {
  if (!doc) return null;
  return {
    id: doc._id.toString(),
    name: doc.name || "",
    email: doc.email || "",
    company: doc.company || doc.name || "",
    industry: doc.industry || "",
    location: doc.location || "",
    description: doc.description || "",
    status: doc.status || "Pending",
    logoId: doc.logoId || null,
    createdAt: doc.createdAt || null,
  };
}
