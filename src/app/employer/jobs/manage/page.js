import { Suspense } from "react";
import { redirect } from "next/navigation";
import EmployerSideNav from "@/components/EmployerSideNav";
import EmployerTopNav from "@/components/EmployerTopNav";
import JobPostForm from "@/components/JobPostForm";
import { getOrgName } from "@/lib/settings";
import { getCurrentEmployer } from "@/lib/employer";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  const org = await getOrgName();
  return { title: `Post a Job — ${org}` };
}

export default async function EmployerJobManagePage() {
  const employer = await getCurrentEmployer();
  if (!employer) redirect("/employer/login");
  const orgName = employer.company || (await getOrgName());

  return (
    <div className="bg-surface text-on-surface min-h-screen">
      <EmployerTopNav orgName={orgName} />
      <EmployerSideNav active="Job Posts" />
      <main className="ml-64 pt-16 min-h-screen">
        <Suspense fallback={<div className="p-12 text-center text-on-surface-variant">Loading…</div>}>
          <JobPostForm source="employer" createdBy={employer.email} employerId={employer.id} />
        </Suspense>
      </main>
    </div>
  );
}
