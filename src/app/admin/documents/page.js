import SideNav from "@/components/SideNav";
import TopNav from "@/components/TopNav";
import DocumentVault from "@/components/DocumentVault";
import { getCurrentAdmin } from "@/lib/admin";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function AdminDocumentsPage() {
  const admin = await getCurrentAdmin();
  if (!admin) redirect("/admin/login");

  return (
    <>
      <SideNav active="Documents" />
      <main className="ml-[280px] min-h-screen bg-slate-50">
        <TopNav title="Document Vault" />
        <DocumentVault />
      </main>
    </>
  );
}
