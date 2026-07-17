import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import SideNav from "@/components/SideNav";
import TopNav from "@/components/TopNav";
import CandidateDashboard from "@/components/CandidateDashboard";
import { getDb } from "@/lib/mongodb";
import { getCurrentAdmin } from "@/lib/admin";

export const metadata = {
  title: "Candidate Dashboard | HR System",
};

export const dynamic = "force-dynamic";

function formatAppliedDate(date) {
  if (!date) return "—";
  try {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return "—";
  }
}

async function getCandidateById(id) {
  try {
    const db = await getDb();
    return await db.collection("candidates").findOne({ candidateId: id });
  } catch (err) {
    console.error("Failed to load candidate:", err);
    return null;
  }
}

export default async function CandidateDetailPage({ params }) {
  const admin = await getCurrentAdmin();
  if (!admin) redirect("/admin/login");

  const { id } = await params;
  const doc = await getCandidateById(id);

  if (!doc) {
    notFound();
  }

  const candidate = {
    name: doc.name,
    role: doc.role,
    department: doc.department,
    status: doc.status,
    avatar: doc.avatar,
    appliedDate: formatAppliedDate(doc.appliedAt),
    stage: doc.stage,
    recruiter: doc.recruiter,
    score: doc.score || {},
    timeline: doc.timeline || [],
    documents: doc.documents || [],
    feedback: doc.feedback || [],
  };

  return (
    <>
      <SideNav active="Candidate Management" />
      <main className="ml-[280px] min-h-screen">
        <TopNav title="Candidate Dashboard" />
        <div className="px-container-padding-desktop pt-container-padding-desktop">
          <Link
            href="/admin/candidates"
            className="inline-flex items-center gap-1 text-secondary font-bold text-label-md hover:underline"
          >
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            Back to Candidate Pool
          </Link>
        </div>
        <CandidateDashboard candidate={candidate} />
      </main>
    </>
  );
}
