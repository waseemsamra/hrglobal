"use client";

import Link from "next/link";
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
      className={`fixed top-0 w-full z-50 bg-surface border-b border-outline-variant transition-shadow ${
        scrolled ? "shadow-md glass-header" : ""
      }`}
    >
      <div className="flex justify-end items-center h-16 px-container-padding-desktop max-w-[1440px] mx-auto">
        <div className="flex items-center gap-gutter">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-headline-lg-mobile font-headline-lg-mobile font-bold text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary">corporate_fare</span>
            CareerHub
          </span>
        </Link>
          <nav className="hidden md:flex gap-6">
            <Link className="text-label-md font-label-md text-secondary font-bold border-b-2 border-secondary h-16 flex items-center" href="/jobs">
              Jobs
            </Link>
            <Link className="text-label-md font-label-md text-on-surface-variant hover:bg-surface-container-low transition-colors px-2 h-16 flex items-center" href="#">
              Services
            </Link>
            <Link className="text-label-md font-label-md text-on-surface-variant hover:bg-surface-container-low transition-colors px-2 h-16 flex items-center" href="#">
              Resources
            </Link>
            <Link className="text-label-md font-label-md text-on-surface-variant hover:bg-surface-container-low transition-colors px-2 h-16 flex items-center" href="#">
              Testimonials
            </Link>
            <Link className="text-label-md font-label-md text-on-surface-variant hover:bg-surface-container-low transition-colors px-2 h-16 flex items-center" href="#">
              About
            </Link>
            <Link className="text-label-md font-label-md text-on-surface-variant hover:bg-surface-container-low transition-colors px-2 h-16 flex items-center" href="#">
              FAQs
            </Link>
            <Link className="text-label-md font-label-md text-on-surface-variant hover:bg-surface-container-low transition-colors px-2 h-16 flex items-center" href="#">
              Contact
            </Link>
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
            <Link href="/candidate/login" className="px-4 py-2 border border-outline-variant font-label-md text-label-md rounded-lg hover:bg-surface-container-low transition-all">
              Login
            </Link>
            <Link href="/employer/login" className="px-4 py-2 bg-on-surface text-on-primary font-label-md text-label-md rounded-lg hover:opacity-80 transition-all">
              Employer
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
