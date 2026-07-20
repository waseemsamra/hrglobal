import Link from "next/link";
import { Suspense } from "react";
import JobSearch from "@/components/JobSearch";
import Header from "@/components/Header";
import { getOrgName } from "@/lib/settings";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";
export const revalidate = 0;

export async function generateMetadata() {
  const org = await getOrgName();
  return {
    title: `${org} | Job Search`,
    description: "Search active job postings with filters for type, level, salary, and location.",
  };
}

export default async function JobsPage() {
  const orgName = await getOrgName();

  return (
    <div className="bg-surface text-on-surface min-h-screen flex flex-col">
      <Header />
      <main className="pt-20">
        <Suspense fallback={<div className="p-12 text-center text-on-surface-variant">Loading…</div>}>
        <JobSearch />
      </Suspense>
      </main>

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
