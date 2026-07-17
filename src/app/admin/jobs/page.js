import SideNav from "@/components/SideNav";
import TopNav from "@/components/TopNav";
import JobPosts from "@/components/JobPosts";
import { getDb } from "@/lib/mongodb";
import { getCurrentAdmin } from "@/lib/admin";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Job Posts | HR System",
};

export const dynamic = "force-dynamic";

async function getJobs() {
  try {
    const db = await getDb();
    const collection = db.collection("jobs");
    const [docs, active, archived, draft] = await Promise.all([
      collection.find({}).sort({ postedAt: -1 }).toArray(),
      collection.countDocuments({ status: "Active" }),
      collection.countDocuments({ status: "Archived" }),
      collection.countDocuments({ status: "Draft" }),
    ]);

    const jobs = docs.map((j) => ({
      jobId: j.jobId,
      title: j.title,
      department: j.department,
      location: j.location,
      type: j.type,
      badge: j.badge || null,
      applicants: j.applicants || 0,
      postedAt: j.postedAt ? j.postedAt.toISOString() : null,
      status: j.status || "Active",
    }));

    return { jobs, counts: { active, archived, draft } };
  } catch (err) {
    console.error("Failed to load jobs:", err);
    return { jobs: [], counts: { active: 0, archived: 0, draft: 0 } };
  }
}

export default async function AdminJobsPage() {
  const admin = await getCurrentAdmin();
  if (!admin) redirect("/admin/login");

  const { jobs, counts } = await getJobs();

  return (
    <>
      <SideNav active="Job Posts" />
      <main className="ml-[280px] min-h-screen flex flex-col">
        <TopNav title="Job Posts" />
        <JobPosts jobs={jobs} counts={counts} />
      </main>
    </>
  );
}
