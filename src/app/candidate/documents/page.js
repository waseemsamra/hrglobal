import { redirect } from "next/navigation";
import { getCurrentCandidate } from "@/lib/candidate";
import CandidateSideNav from "@/components/CandidateSideNav";
import CandidateTopNav from "@/components/CandidateTopNav";
import CandidateVault from "@/components/CandidateVault";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  return { title: "Document Vault | CareerHub" };
}

export default async function CandidateDocumentsPage() {
  const candidate = await getCurrentCandidate();
  if (!candidate) redirect("/candidate/login");

  return (
    <div className="flex min-h-screen bg-background text-on-surface font-body-md">
      <CandidateSideNav candidate={candidate} />

      <main className="flex-1 transition-all duration-300">
        <header className="sticky top-0 z-40 bg-surface-container-lowest shadow-sm border-b border-outline-variant h-16 flex items-center">
          <div className="flex justify-between items-center w-full px-margin-desktop max-w-container-max mx-auto">
            <div className="flex items-center space-x-4">
              <span className="md:hidden material-symbols-outlined text-on-surface-variant cursor-pointer">menu</span>
              <h2 className="text-headline-md font-headline-md text-on-surface">Document Vault</h2>
            </div>
            <div className="flex items-center space-x-6">
              <div className="hidden lg:flex space-x-8">
                <span className="text-label-md font-label-md text-on-surface-variant">Storage: 45% used</span>
              </div>
              <div className="flex items-center space-x-4">
                <span className="material-symbols-outlined text-on-surface-variant cursor-pointer">notifications</span>
                <span className="material-symbols-outlined text-on-surface-variant cursor-pointer">settings</span>
              </div>
            </div>
          </div>
        </header>

        <CandidateVault candidate={candidate} />

        <footer className="h-20"></footer>
      </main>
    </div>
  );
}
