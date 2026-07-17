import { redirect } from "next/navigation";
import EmployerSideNav from "@/components/EmployerSideNav";
import EmployerTopNav from "@/components/EmployerTopNav";
import EmployerJobList from "@/components/EmployerJobList";
import { getOrgName } from "@/lib/settings";
import { getCurrentEmployer } from "@/lib/employer";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  const org = await getOrgName();
  return { title: `My Job Posts — ${org}` };
}

export default async function EmployerJobsPage() {
  const employer = await getCurrentEmployer();
  if (!employer) redirect("/employer/login");
  const orgName = employer.company || (await getOrgName());

  return (
    <div className="bg-surface text-on-surface min-h-screen">
      <EmployerTopNav orgName={orgName} />
      <EmployerSideNav active="My Job Posts" />
      <main className="ml-64 pt-16 min-h-screen">
        <EmployerJobList employerId={employer.id} />
      </main>
    </div>
  );
}
