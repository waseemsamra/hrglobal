import Link from "next/link";
import { Suspense } from "react";
import JobSearch from "@/components/JobSearch";
import { getOrgName } from "@/lib/settings";
import { getCurrentCandidate } from "@/lib/candidate";
import CandidateSideNav from "@/components/CandidateSideNav";
import CandidateTopNav from "@/components/CandidateTopNav";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  const org = await getOrgName();
  return {
    title: `${org} | Job Search`,
    description: "Search active job postings with filters for type, level, salary, and location.",
  };
}

export default async function JobsPage() {
  const orgName = await getOrgName();
  const candidate = await getCurrentCandidate();

  // Signed-in candidates stay inside the candidate shell (sidebar + top nav)
  // so "Job Search" opens in the main area of the dashboard, not the global page.
  if (candidate) {
    return (
      <div className="flex min-h-screen bg-background text-on-surface font-body-md">
        <CandidateSideNav candidate={candidate} />
        <main className="flex-1 flex flex-col">
          <CandidateTopNav active="Job Search" />
          <Suspense fallback={<div className="p-12 text-center text-on-surface-variant">Loading…</div>}>
            <JobSearch candidate={candidate} />
          </Suspense>
          <footer className="h-20" />
        </main>
      </div>
    );
  }

  return (
    <div className="bg-surface text-on-surface min-h-screen flex flex-col">
      {/* TopNavBar */}
      <header className="bg-surface border-b border-outline-variant sticky top-0 z-50">
        <div className="flex justify-between items-center h-16 px-container-padding-desktop max-w-[1440px] mx-auto">
          <div className="flex items-center gap-8">
            <Link href="/" className="font-headline-lg text-headline-lg font-bold text-on-surface">
              {orgName}
            </Link>
            <nav className="hidden md:flex gap-6 items-center">
              <Link className="text-secondary border-b-2 border-secondary pb-1 font-title-md text-title-md" href="/jobs">
                Jobs
              </Link>
              <Link className="text-on-surface-variant hover:text-secondary font-title-md text-title-md transition-colors" href="/admin/candidates">
                Candidates
              </Link>
              <Link className="text-on-surface-variant hover:text-secondary font-title-md text-title-md transition-colors" href="/admin">
                Employers
              </Link>
              <Link className="text-on-surface-variant hover:text-secondary font-title-md text-title-md transition-colors" href="/">
                Resources
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 mr-4">
              <button className="p-2 hover:bg-surface-container-low transition-colors rounded-full">
                <span className="material-symbols-outlined">notifications</span>
              </button>
              <Link href="/admin" className="p-2 hover:bg-surface-container-low transition-colors rounded-full">
                <span className="material-symbols-outlined">account_circle</span>
              </Link>
            </div>
            <Link href="/register" className="px-4 py-2 border border-outline-variant font-label-md text-label-md rounded-lg hover:bg-surface-container-low transition-all">
              Login
            </Link>
            <Link href="/register" className="px-4 py-2 bg-on-surface text-on-primary font-label-md text-label-md rounded-lg hover:opacity-80 transition-all">
              Register
            </Link>
          </div>
        </div>
      </header>

      <Suspense fallback={<div className="p-12 text-center text-on-surface-variant">Loading…</div>}>
        <JobSearch candidate={candidate} />
      </Suspense>

      {/* Footer */}
      <footer className="bg-surface-container-low border-t border-outline-variant mt-auto">
        <div className="w-full py-stack-lg px-container-padding-desktop grid grid-cols-1 md:grid-cols-3 gap-gutter max-w-[1440px] mx-auto">
          <div className="flex flex-col gap-4">
            <span className="font-title-md text-title-md font-bold text-on-surface">{orgName}</span>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              Connecting top talent with leading innovators. Systematic recruitment solutions for a
              global workforce.
            </p>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              © {new Date().getFullYear()} {orgName}. All rights reserved.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <h4 className="font-label-md text-label-md text-on-surface font-bold">Solutions</h4>
              <Link className="text-on-surface-variant hover:text-secondary font-body-sm text-body-sm transition-all hover:underline" href="/admin">Recruitment Solutions</Link>
              <a className="text-on-surface-variant hover:text-secondary font-body-sm text-body-sm transition-all hover:underline" href="#">Mobile App</a>
              <Link className="text-on-surface-variant hover:text-secondary font-body-sm text-body-sm transition-all hover:underline" href="/admin/jobs/manage">Job Posting</Link>
            </div>
            <div className="flex flex-col gap-2">
              <h4 className="font-label-md text-label-md text-on-surface font-bold">Company</h4>
              <a className="text-on-surface-variant hover:text-secondary font-body-sm text-body-sm transition-all hover:underline" href="#">Privacy Policy</a>
              <a className="text-on-surface-variant hover:text-secondary font-body-sm text-body-sm transition-all hover:underline" href="#">Terms of Service</a>
              <a className="text-on-surface-variant hover:text-secondary font-body-sm text-body-sm transition-all hover:underline" href="#">Cookie Policy</a>
            </div>
          </div>
          <div className="flex flex-col gap-4">
            <h4 className="font-label-md text-label-md text-on-surface font-bold">Stay Updated</h4>
            <div className="flex gap-2">
              <input className="bg-white border border-outline-variant px-4 py-2 rounded-lg flex-1 text-body-sm" placeholder="Email address" type="email" />
              <button className="bg-secondary text-on-secondary px-4 py-2 rounded-lg font-label-md text-label-md">Join</button>
            </div>
            <div className="flex gap-4">
              <a className="text-on-surface-variant hover:text-secondary" href="#"><span className="material-symbols-outlined">public</span></a>
              <a className="text-on-surface-variant hover:text-secondary" href="#"><span className="material-symbols-outlined">alternate_email</span></a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
