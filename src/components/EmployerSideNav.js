"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { icon: "dashboard", label: "Dashboard", href: "/employer" },
  { icon: "work", label: "My Job Posts", href: "/employer/jobs" },
  { icon: "group", label: "Applicants", href: "/employer/candidates" },
  { icon: "badge", label: "Team Management", href: "/employer/team" },
  { icon: "analytics", label: "Hiring Stats", href: "/employer/analytics" },
];

export default function EmployerSideNav({ active }) {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-surface-container-low border-r border-outline-variant z-50 flex flex-col p-4 pt-20">
      <div className="mb-8 px-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
            <span
              className="material-symbols-outlined text-white"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              corporate_fare
            </span>
          </div>
          <div>
            <h2 className="font-headline-lg text-headline-lg-mobile font-black text-on-surface">
              Employer Portal
            </h2>
            <p className="text-label-md font-label-md text-on-surface-variant uppercase tracking-wider">
              Admin Access
            </p>
          </div>
        </div>
      </div>

      <nav className="flex-1 space-y-1">
        {NAV_ITEMS.map((item) => {
          const isActive = active
            ? active === item.label
            : item.href !== "/employer" && pathname === item.href;
          return (
            <Link
              key={item.label}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                isActive
                  ? "bg-secondary-fixed text-on-secondary-fixed font-bold"
                  : "text-on-surface-variant hover:bg-surface-container-high"
              }`}
            >
              <span className="material-symbols-outlined">{item.icon}</span>
              <span className="font-label-md text-label-md">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto pt-4 border-t border-outline-variant space-y-1">
        <Link
          href="/employer/jobs/manage"
          className="w-full bg-secondary text-on-secondary py-3 rounded-lg font-label-md text-label-md flex items-center justify-center gap-2 hover:opacity-90 transition-all active:scale-95 mb-4"
        >
          <span className="material-symbols-outlined text-[20px]">add_circle</span>
          Post New Job
        </Link>
        <Link
          href="/employer/settings"
          className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
            active === "Settings" || pathname === "/employer/settings"
              ? "bg-secondary-container text-on-secondary-container"
              : "text-on-surface-variant hover:bg-surface-container-high"
          }`}
        >
          <span className="material-symbols-outlined">settings</span>
          <span className="font-label-md text-label-md">Settings</span>
        </Link>
        <a
          href="#"
          className="flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:bg-surface-container-high transition-all rounded-lg"
        >
          <span className="material-symbols-outlined">contact_support</span>
          <span className="font-label-md text-label-md">Support</span>
        </a>
        <Link
          href="/employer/login"
          className="flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:bg-surface-container-high transition-all rounded-lg"
        >
          <span className="material-symbols-outlined">logout</span>
          <span className="font-label-md text-label-md">Log out</span>
        </Link>
      </div>
    </aside>
  );
}
