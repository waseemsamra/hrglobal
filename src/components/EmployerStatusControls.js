"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function EmployerStatusControls({ id, status }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function change(next) {
    setBusy(true);
    try {
      await fetch(`/api/employers/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next }),
      });
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    if (!confirm("Delete this employer? Their job posts will be kept but unlinked.")) return;
    setBusy(true);
    try {
      await fetch(`/api/employers/${id}`, { method: "DELETE" });
      router.push("/admin/employers");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex items-center gap-2">
      {status !== "Active" && (
        <button
          disabled={busy}
          onClick={() => change("Active")}
          className="flex items-center gap-1 px-3 py-2 rounded-lg bg-secondary/10 text-secondary hover:bg-secondary/20 text-label-md font-bold disabled:opacity-60"
        >
          <span className="material-symbols-outlined text-[18px]">check_circle</span>
          Approve
        </button>
      )}
      {status !== "Suspended" && (
        <button
          disabled={busy}
          onClick={() => change("Suspended")}
          className="flex items-center gap-1 px-3 py-2 rounded-lg bg-error-container text-on-error-container hover:opacity-90 text-label-md font-bold disabled:opacity-60"
        >
          <span className="material-symbols-outlined text-[18px]">block</span>
          Suspend
        </button>
      )}
      <button
        disabled={busy}
        onClick={remove}
        className="flex items-center gap-1 px-3 py-2 rounded-lg border border-outline-variant text-error hover:bg-error-container text-label-md font-bold disabled:opacity-60"
      >
        <span className="material-symbols-outlined text-[18px]">delete</span>
        Delete
      </button>
    </div>
  );
}
