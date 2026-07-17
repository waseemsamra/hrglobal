import SideNav from "@/components/SideNav";
import TopNav from "@/components/TopNav";
import SettingsPanel from "@/components/SettingsPanel";

export const metadata = {
  title: "Settings | HR System",
};

export default function SettingsPage() {
  return (
    <>
      <SideNav active="Settings" />
      <main className="ml-[280px] min-h-screen flex flex-col">
        <TopNav title="System Settings" />
        <div className="flex-1 p-container-padding-desktop">
          <p className="font-body-md text-on-surface-variant mb-stack-lg">
            Manage your personal preferences and organizational configuration.
          </p>
          <SettingsPanel />
        </div>
      </main>
    </>
  );
}
