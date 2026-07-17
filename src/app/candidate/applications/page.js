import { redirect } from "next/navigation";
import { getCurrentCandidate } from "@/lib/candidate";
import CandidateSideNav from "@/components/CandidateSideNav";
import CandidateTopNav from "@/components/CandidateTopNav";
import CandidateApplications from "@/components/CandidateApplications";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  return { title: "My Applications | CareerHub" };
}

export default async function CandidateApplicationsPage() {
  const candidate = await getCurrentCandidate();
  if (!candidate) redirect("/candidate/login");

  return (
    <div className="flex min-h-screen bg-background text-on-surface font-body-md">
      <CandidateSideNav candidate={candidate} />

      <main className="flex-1 transition-all duration-300">
        <CandidateTopNav active="My Applications" />

        <CandidateApplications candidate={candidate} />

        <footer className="h-20" />
      </main>
    </div>
  );
}
