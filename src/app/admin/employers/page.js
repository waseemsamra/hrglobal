import SideNav from "@/components/SideNav";
import TopNav from "@/components/TopNav";
import EmployerManager from "@/components/EmployerManager";
import { getCurrentAdmin } from "@/lib/admin";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Employer Management | HR System",
};

export const dynamic = "force-dynamic";

export default async function AdminEmployersPage() {
  const admin = await getCurrentAdmin();
  if (!admin) redirect("/admin/login");

  return (
    <div className="bg-surface text-on-surface min-h-screen">
      <SideNav active="Employers" />
      <main className="ml-[280px] min-h-screen flex flex-col">
        <TopNav title="Employers" />
        <EmployerManager />
      </main>
    </div>
  );
}
