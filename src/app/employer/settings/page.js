import { Suspense } from "react";
import { redirect } from "next/navigation";
import EmployerSideNav from "@/components/EmployerSideNav";
import EmployerTopNav from "@/components/EmployerTopNav";
import EmployerSettingsPanel from "@/components/EmployerSettingsPanel";
import { getOrgName } from "@/lib/settings";
import { getCurrentEmployer } from "@/lib/employer";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  const org = await getOrgName();
  return { title: `Employer Settings — ${org}` };
}

export default async function EmployerSettingsPage() {
  const employer = await getCurrentEmployer();
  if (!employer) redirect("/employer/login");
  const orgName = employer.company || (await getOrgName());

  return (
    <div className="bg-background text-on-surface min-h-screen">
      <EmployerTopNav orgName={orgName} />
      <EmployerSideNav active="Settings" />
      <main className="ml-64 pt-16 min-h-screen">
        <Suspense
          fallback={<div className="p-12 text-center text-on-surface-variant">Loading…</div>}
        >
          <EmployerSettingsPanel />
        </Suspense>
      </main>
    </div>
  );
}
