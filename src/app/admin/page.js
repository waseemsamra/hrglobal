import { redirect } from "next/navigation";
import SideNav from "@/components/SideNav";
import TopNav from "@/components/TopNav";
import AdminOverview from "@/components/AdminOverview";
import { getDb } from "@/lib/mongodb";
import { getCurrentAdmin } from "@/lib/admin";

export const metadata = {
  title: "Global Admin Dashboard | HR System",
};

export const dynamic = "force-dynamic";

const STATUS_CYCLE = ["Interviewing", "Verified", "In Progress", "Pending"];

async function getAdminData() {
  try {
    const db = await getDb();
    const registrationsCol = db.collection("registrations");
    const candidatesCol = db.collection("candidates");

    const [totalRegistrations, totalCandidates, recent] = await Promise.all([
      registrationsCol.countDocuments(),
      candidatesCol.countDocuments(),
      registrationsCol.find({}).sort({ createdAt: -1 }).limit(10).toArray(),
    ]);

    const registrations = recent.map((r, i) => ({
      id: r._id.toString(),
      name: `${r.firstName || ""} ${r.lastName || ""}`.trim() || "Unnamed",
      email: r.email,
      position: r.orgSize || "—",
      department: "General",
      location: "—",
      status: STATUS_CYCLE[i % STATUS_CYCLE.length],
    }));

    return {
      metrics: {
        totalCandidates: totalCandidates + totalRegistrations,
        totalRegistrations,
        activeOpenings: 482,
        avgTimeToHire: "18d",
        offerAcceptance: "94%",
      },
      registrations,
    };
  } catch (err) {
    console.error("Failed to load admin data:", err);
    return {
      metrics: {
        totalCandidates: 0,
        totalRegistrations: 0,
        activeOpenings: 482,
        avgTimeToHire: "18d",
        offerAcceptance: "94%",
      },
      registrations: [],
    };
  }
}

export default async function AdminDashboardPage() {
  const admin = await getCurrentAdmin();
  if (!admin) redirect("/admin/login");

  const { metrics, registrations } = await getAdminData();

  return (
    <>
      <SideNav active="Dashboard" />
      <main className="ml-[280px] min-h-screen">
        <TopNav title="Dashboard" />
        <div className="p-container-padding-desktop">
          <AdminOverview metrics={metrics} registrations={registrations} />
        </div>
      </main>
    </>
  );
}
