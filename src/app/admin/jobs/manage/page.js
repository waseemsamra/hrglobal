import { Suspense } from "react";
import SideNav from "@/components/SideNav";
import TopNav from "@/components/TopNav";
import JobPostForm from "@/components/JobPostForm";
import { getCurrentAdmin } from "@/lib/admin";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Post Management | HR System",
};

export const dynamic = "force-dynamic";

export default async function PostManagementPage() {
  const admin = await getCurrentAdmin();
  if (!admin) redirect("/admin/login");

  return (
    <>
      <SideNav active="Post Management" />
      <main className="ml-[280px] min-h-screen flex flex-col">
        <TopNav title="Post Management" />
        <Suspense
          fallback={<div className="p-12 text-center text-on-surface-variant">Loading…</div>}
        >
          <JobPostForm />
        </Suspense>
      </main>
    </>
  );
}
