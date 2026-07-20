import { Suspense } from "react";
import AdminShell from "@/components/AdminShell";
import JobPostForm from "@/components/JobPostForm";
import { getCurrentAdmin } from "@/lib/admin";
import { getDb } from "@/lib/mongodb";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Post Management | CareerHub",
};

export const dynamic = "force-dynamic";

export default async function PostManagementPage() {
  const admin = await getCurrentAdmin();
  if (!admin) redirect("/admin/login");

  const db = await getDb();
  const employers = await db.collection("employers").find({}).sort({ company: 1 }).toArray();
  const employerList = employers.map((e) => ({
    id: e._id.toString(),
    company: e.company || e.name || "",
    name: e.name || "",
    email: e.email || "",
  }));

  return (
    <AdminShell active="Post Management" title="Post Management">
      <Suspense
        fallback={<div className="p-12 text-center text-on-surface-variant">Loading…</div>}
      >
        <JobPostForm source="admin" createdBy={admin.email} employers={employerList} />
      </Suspense>
    </AdminShell>
  );
}
