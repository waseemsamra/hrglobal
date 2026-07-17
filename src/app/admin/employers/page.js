import AdminShell from "@/components/AdminShell";
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
    <AdminShell active="Employers" title="Employers">
      <EmployerManager />
    </AdminShell>
  );
}
