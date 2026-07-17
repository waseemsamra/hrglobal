import { redirect } from "next/navigation";
import EmployerSideNav from "@/components/EmployerSideNav";
import EmployerTopNav from "@/components/EmployerTopNav";
import EmployerTeamPanel from "@/components/EmployerTeamPanel";
import { getOrgName } from "@/lib/settings";
import { getCurrentEmployer } from "@/lib/employer";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  const org = await getOrgName();
  return { title: `Team Management — ${org}` };
}

export default async function EmployerTeamPage() {
  const employer = await getCurrentEmployer();
  if (!employer) redirect("/employer/login");
  const orgName = employer.company || (await getOrgName());

  return (
    <div className="bg-background text-on-surface min-h-screen">
      <EmployerTopNav orgName={orgName} />
      <EmployerSideNav active="Team Management" />
      <main className="ml-64 pt-16 min-h-screen">
        <EmployerTeamPanel />
      </main>
    </div>
  );
}
