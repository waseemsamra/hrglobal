import { notFound, redirect } from "next/navigation";
import { ObjectId } from "mongodb";
import { getDb } from "@/lib/mongodb";
import { getCurrentCandidate } from "@/lib/candidate";
import CandidateSideNav from "@/components/CandidateSideNav";
import CandidateTopNav from "@/components/CandidateTopNav";
import CandidateDocPreviewer from "@/components/CandidateDocPreviewer";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  return { title: "CV Previewer | CareerHub" };
}

async function getDocMeta(id, candidateId) {
  const db = await getDb();
  const meta = await db.collection("candidate_doc_meta").findOne({ _id: new ObjectId(id) });
  if (!meta || meta.candidateId !== candidateId) return null;
  return {
    id: meta._id.toString(),
    name: meta.name,
    category: meta.category,
    status: meta.status || "Pending",
    size: meta.size || 0,
    contentType: meta.contentType || "application/octet-stream",
    uploadedAt: meta.uploadedAt,
    isPrimary: !!meta.isPrimary,
  };
}

export default async function CandidateDocPreviewPage({ params }) {
  const candidate = await getCurrentCandidate();
  if (!candidate) redirect("/candidate/login");

  const { id } = await params;
  let meta;
  try {
    meta = await getDocMeta(id, candidate.id);
  } catch {
    meta = null;
  }
  if (!meta) notFound();

  const fileUrl = `/api/candidates/documents/${id}`;

  return (
    <div className="flex min-h-screen bg-background text-on-surface font-body-md">
      <CandidateSideNav candidate={candidate} />

        <main className="flex-1 flex flex-col overflow-hidden">
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

        {/* Breadcrumbs / Secondary Header */}
        <div className="px-8 py-4 flex items-center justify-between border-b border-outline-variant bg-surface-container-lowest">
          <nav className="flex items-center gap-2 text-label-md font-label-md">
            <a className="text-outline hover:text-secondary transition-colors" href="/candidate/documents">
              Document Vault
            </a>
            <span className="material-symbols-outlined text-outline text-[16px]">chevron_right</span>
            <span className="text-on-surface">{meta.name}</span>
          </nav>
          <div className="flex items-center gap-3">
            <a
              href={fileUrl}
              className="flex items-center gap-2 px-3 py-1.5 text-secondary border border-secondary rounded-lg font-label-md text-label-md hover:bg-secondary-container transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">share</span> Share
            </a>
            <a
              href={fileUrl}
              download={meta.name}
              className="flex items-center gap-2 px-3 py-1.5 bg-secondary text-on-secondary rounded-lg font-label-md text-label-md hover:bg-on-secondary-container transition-colors shadow-sm"
            >
              <span className="material-symbols-outlined text-[18px]">download</span> Download
            </a>
          </div>
        </div>

        {/* Content Split Layout */}
        <CandidateDocPreviewer doc={meta} fileUrl={fileUrl} />
      </main>
    </div>
  );
}
