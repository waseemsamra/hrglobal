import { cookies } from "next/headers";
import { ObjectId } from "mongodb";
import { getDb } from "@/lib/mongodb";

export const CANDIDATE_COOKIE = "candidateId";

export async function getCurrentCandidateId() {
  try {
    const store = await cookies();
    return store.get(CANDIDATE_COOKIE)?.value || null;
  } catch {
    return null;
  }
}

export async function getCurrentCandidate() {
  const id = await getCurrentCandidateId();
  if (!id || !ObjectId.isValid(id)) return null;
  try {
    const db = await getDb();
    const c = await db.collection("candidates").findOne({ _id: new ObjectId(id) });
    if (!c) return null;
    return {
      id: c._id.toString(),
      candidateId: c.candidateId,
      name: c.name || "",
      email: c.email || "",
      role: c.role || "",
      department: c.department || "",
      location: c.location || "",
      experience: c.experience || "",
      avatar: c.avatar || "",
      listStatus: c.listStatus || "Applied",
    };
  } catch {
    return null;
  }
}
