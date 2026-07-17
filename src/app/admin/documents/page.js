import AdminShell from "@/components/AdminShell";
import DocumentVault from "@/components/DocumentVault";
import { getCurrentAdmin } from "@/lib/admin";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function AdminDocumentsPage() {
  const admin = await getCurrentAdmin();
  if (!admin) redirect("/admin/login");

  return (
    <AdminShell active="Documents" title="Document Vault">
      <DocumentVault />
    </AdminShell>
  );
}
