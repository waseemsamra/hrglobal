"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

const NAV_ITEMS = [
  { icon: "dashboard", label: "Dashboard", href: "/admin" },
  { icon: "person_search", label: "Candidate Management", href: "/admin/candidates" },
  {
    icon: "work",
    label: "Job Posts",
    href: "/admin/jobs",
    children: [
      { icon: "post_add", label: "Post Management", href: "/admin/jobs/manage" },
    ],
  },
  { icon: "description", label: "Documents", href: "/admin/documents" },
  { icon: "apartment", label: "Employers", href: "/admin/employers" },
  { icon: "leaderboard", label: "Analytics", href: "/admin" },
  { icon: "settings", label: "Settings", href: "/admin/settings" },
];

export default function SideNav({ active }) {
  const pathname = usePathname();
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  async function logout() {
    setLoggingOut(true);
    try {
      await fetch("/api/admin/login", { method: "DELETE" });
    } finally {
      router.push("/admin/login");
      router.refresh();
    }
  }

  return (
    <aside className="fixed left-0 top-0 h-full w-[280px] bg-surface-container-lowest border-r border-outline-variant z-50 flex flex-col py-stack-lg px-base">
      <div className="px-4 mb-stack-lg flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
          <span
            className="material-symbols-outlined text-white"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            corporate_fare
          </span>
        </div>
        <div>
          <h2 className="text-title-md font-title-md font-black text-on-surface">HR Management</h2>
          <p className="text-label-md font-label-md text-on-tertiary-container">Global Admin</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-2">
        {NAV_ITEMS.map((item) => {
          const isActive = active
            ? active === item.label
            : item.href !== "/admin" && pathname === item.href;
          return (
            <div key={item.label}>
              <Link
                href={item.href}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-left ${
                  isActive
                    ? "bg-secondary-fixed text-on-secondary-fixed font-bold active:scale-[0.98]"
                    : "text-on-surface-variant hover:bg-surface-container-low"
                }`}
              >
                <span className="material-symbols-outlined">{item.icon}</span>
                <span className="text-label-md font-label-md">{item.label}</span>
              </Link>

              {item.children && (
                <div className="mt-1 ml-4 pl-3 border-l border-outline-variant space-y-1">
                  {item.children.map((child) => {
                    const childActive = active
                      ? active === child.label
                      : pathname === child.href;
                    return (
                      <Link
                        key={child.label}
                        href={child.href}
                        className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition-all text-left ${
                          childActive
                            ? "bg-secondary-fixed text-on-secondary-fixed font-bold"
                            : "text-on-surface-variant hover:bg-surface-container-low"
                        }`}
                      >
                        <span className="material-symbols-outlined text-[18px]">{child.icon}</span>
                        <span className="text-label-md font-label-md">{child.label}</span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      <div className="px-4 mt-auto mb-stack-md">
        <button className="w-full py-3 bg-primary text-white font-bold rounded-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-2">
          <span className="material-symbols-outlined">add</span>
          <span className="text-label-md">Post New Job</span>
        </button>
      </div>

      <div className="border-t border-outline-variant pt-4 px-2">
        <a
          className="flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:bg-surface-container-low rounded-lg transition-all"
          href="#"
        >
          <span className="material-symbols-outlined">contact_support</span>
          <span className="text-label-md font-label-md">Support</span>
        </a>
        <button
          onClick={logout}
          disabled={loggingOut}
          className="w-full flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:bg-surface-container-low rounded-lg transition-all disabled:opacity-60"
        >
          <span className="material-symbols-outlined">logout</span>
          <span className="text-label-md font-label-md">{loggingOut ? "Signing out…" : "Log out"}</span>
        </button>
      </div>
    </aside>
  );
}
