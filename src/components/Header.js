"use client";

import { useEffect, useState } from "react";

export default function Header() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 w-full z-50 bg-surface border-b border-outline-variant flex justify-between items-center h-16 px-container-padding-desktop transition-shadow ${
        scrolled ? "shadow-md glass-header" : ""
      }`}
    >
      <div className="flex items-center gap-gutter">
        <span className="text-title-md font-title-md font-bold text-on-surface flex items-center gap-2">
          <span className="material-symbols-outlined text-secondary">corporate_fare</span>
          HR System
        </span>
        <nav className="hidden md:flex gap-6">
          <a
            className="text-label-md font-label-md text-secondary font-bold border-b-2 border-secondary h-16 flex items-center"
            href="#"
          >
            Solutions
          </a>
          <a
            className="text-label-md font-label-md text-on-surface-variant hover:bg-surface-container-low transition-colors px-2 h-16 flex items-center"
            href="#"
          >
            Enterprise
          </a>
          <a
            className="text-label-md font-label-md text-on-surface-variant hover:bg-surface-container-low transition-colors px-2 h-16 flex items-center"
            href="#"
          >
            Pricing
          </a>
        </nav>
      </div>
      <div className="flex items-center gap-4">
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-surface-container rounded-full">
          <span className="material-symbols-outlined text-on-surface-variant text-[20px]">search</span>
          <input
            className="bg-transparent border-none focus:ring-0 text-body-sm w-48"
            placeholder="Search resources..."
            type="text"
          />
        </div>
        <div className="flex items-center gap-stack-md">
          <button className="material-symbols-outlined text-on-surface-variant hover:bg-surface-container-low p-2 rounded-full transition-colors">
            notifications
          </button>
          <button className="material-symbols-outlined text-on-surface-variant hover:bg-surface-container-low p-2 rounded-full transition-colors">
            help_outline
          </button>
          <button className="bg-primary text-on-primary px-6 py-2 rounded-lg font-label-md hover:opacity-90 transition-all active:scale-[0.98]">
            Login
          </button>
        </div>
      </div>
    </header>
  );
}
