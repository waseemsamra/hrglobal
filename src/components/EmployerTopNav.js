import EmployerLogoutButton from "@/components/EmployerLogoutButton";

export default function EmployerTopNav({ orgName = "HR Global Portal" }) {
  return (
    <header className="fixed top-0 left-0 right-0 h-16 z-40 bg-surface border-b border-outline-variant flex justify-between items-center px-8">
      <div className="flex items-center gap-8">
        <span className="font-headline-md text-headline-md font-bold text-primary">{orgName}</span>
        <div className="hidden md:flex relative group">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">
            search
          </span>
          <input
            type="text"
            placeholder="Search resources..."
            className="pl-10 pr-4 py-1.5 bg-surface-container-low border border-outline-variant rounded-lg text-body-md focus:ring-2 focus:ring-primary focus:outline-none w-64"
          />
        </div>
      </div>
      <div className="flex items-center gap-6">
        <button className="material-symbols-outlined text-on-surface-variant hover:bg-surface-container-low p-2 rounded-full transition-colors">
          notifications
        </button>
        <button className="material-symbols-outlined text-on-surface-variant hover:bg-surface-container-low p-2 rounded-full transition-colors">
          help
        </button>
        <button className="material-symbols-outlined text-primary font-bold border-b-2 border-primary p-2 transition-colors">
          settings
        </button>
        <div className="w-8 h-8 rounded-full bg-primary-container flex items-center justify-center overflow-hidden border border-outline-variant">
          <span className="material-symbols-outlined text-white text-[20px]">person</span>
        </div>
        <EmployerLogoutButton />
      </div>
    </header>
  );
}
