"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function EmployerLogoutButton() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function logout() {
    setBusy(true);
    try {
      await fetch("/api/employers/login", { method: "DELETE" });
      router.push("/employer/login");
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      onClick={logout}
      disabled={busy}
      title="Sign out"
      className="material-symbols-outlined text-on-surface-variant hover:bg-surface-container-low p-2 rounded-full transition-colors disabled:opacity-60"
    >
      logout
    </button>
  );
}
