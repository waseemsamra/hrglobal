import AdminShell from "@/components/AdminShell";
import SettingsPanel from "@/components/SettingsPanel";

export const metadata = {
  title: "Settings | HR System",
};

export default function SettingsPage() {
  return (
    <AdminShell active="Settings" title="System Settings">
      <div className="flex-1 p-container-padding-desktop">
        <p className="font-body-md text-on-surface-variant mb-stack-lg">
          Manage your personal preferences and organizational configuration.
        </p>
        <SettingsPanel />
      </div>
    </AdminShell>
  );
}
