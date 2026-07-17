import { redirect } from "next/navigation";
import { getCurrentCandidate } from "@/lib/candidate";
import CandidateSideNav from "@/components/CandidateSideNav";
import CandidateTopNav from "@/components/CandidateTopNav";
import CandidateSettings from "@/components/CandidateSettings";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  return { title: "Settings | CareerHub" };
}

export default async function CandidateSettingsPage() {
  const candidate = await getCurrentCandidate();
  if (!candidate) redirect("/candidate/login");

  return (
    <div className="flex min-h-screen bg-background text-on-surface font-body-md">
      <CandidateSideNav candidate={candidate} />

      <main className="flex-1 flex flex-col">
        <CandidateTopNav active="Settings" />

        <CandidateSettings candidate={candidate} />

        <footer className="h-20" />
      </main>
    </div>
  );
}
