"use client";

import { useState } from "react";
import SideNav from "@/components/SideNav";
import TopNav from "@/components/TopNav";

export default function AdminShell({ active, title, children }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="bg-surface text-on-surface min-h-screen">
      <SideNav active={active} open={menuOpen} onClose={() => setMenuOpen(false)} />
      <main className="md:ml-[280px] pt-16 min-h-screen">
        <TopNav title={title} onMenuClick={() => setMenuOpen(true)} />
        {children}
      </main>
    </div>
  );
}
