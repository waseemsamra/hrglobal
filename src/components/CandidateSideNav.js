"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { icon: "dashboard", label: "Dashboard", href: "/candidate" },
  { icon: "search", label: "Job Search", href: "/jobs" },
  { icon: "assignment_turned_in", label: "My Applications", href: "/candidate/applications" },
  { icon: "folder_shared", label: "Document Vault", href: "/candidate/documents" },
  { icon: "person", label: "Settings", href: "/candidate/settings" },
];

export default function CandidateSideNav({ candidate, open = false, onClose }) {
  const pathname = usePathname();
  const isActive = (href) => {
    const active =
      href === "/candidate"
        ? pathname === "/candidate"
        : pathname === href || (pathname.startsWith(href + "/") && href !== "/jobs");
    return active;
  };

  const initials = (name = "") => {
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed md:static inset-y-0 left-0 z-50 flex flex-col h-screen p-stack-unit border-r border-outline-variant bg-surface-container-low w-64 shrink-0 transform transition-transform duration-300 md:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        } md:flex`}
      >
        <div className="flex items-center justify-between px-4 py-6">
          <span className="text-headline-md font-headline-md font-bold text-secondary">CareerHub</span>
          <button
            onClick={onClose}
            className="md:hidden p-2 -mr-2 text-on-surface-variant hover:bg-surface-container-high rounded-full"
            aria-label="Close menu"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

      <div className="flex flex-col gap-1 px-2 mb-8">
        {NAV_ITEMS.map((item) => {
          const active = isActive(item.href);
          return (
              <Link
                key={item.label}
                href={item.href}
                onClick={onClose}
                className={`flex items-center gap-3 p-3 rounded-full font-semibold cursor-pointer active:scale-95 transform transition-transform ${
                  active
                    ? "bg-secondary-container text-on-secondary-container"
                    : "text-on-surface-variant hover:bg-surface-container-highest"
                }`}
              >
              <span className="material-symbols-outlined">{item.icon}</span>
              <span className="text-body-md font-body-md">{item.label}</span>
            </Link>
          );
        })}
      </div>

      <div className="mt-auto px-4 py-6 bg-surface-container rounded-xl mb-4">
        <div className="flex items-center gap-3 mb-4">
          {candidate?.avatar ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              className="w-10 h-10 rounded-full object-cover"
              src={candidate.avatar}
              alt={candidate.name}
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-primary-container text-on-primary flex items-center justify-center font-bold">
              {initials(candidate?.name || "C")}
            </div>
          )}
          <div className="overflow-hidden">
            <p className="text-body-md font-bold truncate">{candidate?.name || "Candidate"}</p>
            <p className="text-label-sm text-on-surface-variant truncate">{candidate?.role || "—"}</p>
          </div>
        </div>
        <Link
          href="/candidate/saved"
          onClick={onClose}
          className="w-full py-2 bg-secondary text-on-secondary rounded-full text-label-md font-label-md hover:opacity-90 transition-opacity text-center block"
        >
          View Saved Jobs
        </Link>
      </div>

      <div className="flex flex-col gap-1 px-2 border-t border-outline-variant pt-4">
        <Link
          href="/candidate/help"
          onClick={onClose}
          className="flex items-center gap-3 p-3 text-on-surface-variant hover:bg-surface-container-highest rounded-full cursor-pointer"
        >
          <span className="material-symbols-outlined">help</span>
          <span className="text-body-md font-body-md">Help Center</span>
        </Link>
        <Link
          href="/candidate/login"
          onClick={onClose}
          className="flex items-center gap-3 p-3 text-on-surface-variant hover:bg-surface-container-highest rounded-full cursor-pointer"
        >
          <span className="material-symbols-outlined">logout</span>
          <span className="text-body-md font-body-md">Sign Out</span>
        </Link>
      </div>
    </aside>
    </>
  );
}
