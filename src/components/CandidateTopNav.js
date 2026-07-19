"use client";

export default function CandidateTopNav({ active = "Dashboard", onMenuClick }) {
  const items = [
    { label: "Dashboard", href: "/candidate" },
    { label: "Job Search", href: "/jobs" },
    { label: "My Applications", href: "/candidate/applications" },
    { label: "Document Vault", href: "/candidate/documents" },
  ];
  return (
    <header className="h-16 flex items-center justify-between px-margin-desktop bg-surface-container-lowest border-b border-outline-variant shadow-sm z-10">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="md:hidden p-2 -ml-2 text-on-surface-variant hover:bg-surface-container rounded-full transition-colors"
          aria-label="Open menu"
        >
          <span className="material-symbols-outlined">menu</span>
        </button>
        <span className="md:hidden text-headline-sm font-bold text-secondary">CH</span>
        <div className="hidden md:flex items-center gap-6">
          {items.map((it) => {
            const isActive = active === it.label;
            return (
              <a
                key={it.label}
                className={
                  isActive
                    ? "text-secondary border-b-2 border-secondary pb-1 text-label-md font-label-md"
                    : "text-on-surface-variant hover:text-secondary transition-colors text-label-md font-label-md"
                }
                href={it.href}
              >
                {it.label}
              </a>
            );
          })}
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="relative hidden sm:flex items-center">
          <span className="material-symbols-outlined absolute left-3 text-outline">search</span>
          <input
            className="pl-10 pr-4 py-1.5 bg-surface-container-low border-none rounded-full text-body-md focus:ring-2 focus:ring-secondary/20 w-64 max-w-[50vw]"
            placeholder="Search jobs, articles..."
            type="text"
          />
        </div>
        <button className="p-2 text-on-surface-variant hover:bg-surface-container rounded-full transition-colors">
          <span className="material-symbols-outlined">notifications</span>
        </button>
        <button className="p-2 text-on-surface-variant hover:bg-surface-container rounded-full transition-colors">
          <span className="material-symbols-outlined">settings</span>
        </button>
      </div>
    </header>
  );
}
