"use client";

import { useState } from "react";
import CandidateSideNav from "@/components/CandidateSideNav";
import CandidateTopNav from "@/components/CandidateTopNav";

export default function CandidateShell({ candidate, active, children }) {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <div className="flex min-h-screen bg-background text-on-surface font-body-md">
      <CandidateSideNav candidate={candidate} open={menuOpen} onClose={() => setMenuOpen(false)} />
      <main className="flex-1 flex flex-col">
        <CandidateTopNav active={active} onMenuClick={() => setMenuOpen(true)} />
        {children}
      </main>
    </div>
  );
}
