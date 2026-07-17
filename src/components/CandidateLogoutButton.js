"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function CandidateLogoutButton({ className = "" }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function logout() {
    setBusy(true);
    try {
      await fetch("/api/candidates/login", { method: "DELETE" });
      router.push("/candidate/login");
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      onClick={logout}
      disabled={busy}
      className={`flex items-center gap-2 px-5 py-3 rounded-lg border border-outline-variant text-on-surface-variant hover:bg-surface-container-low transition-colors disabled:opacity-60 ${className}`}
    >
      <span className="material-symbols-outlined text-[18px]">logout</span>
      Sign out
    </button>
  );
}
