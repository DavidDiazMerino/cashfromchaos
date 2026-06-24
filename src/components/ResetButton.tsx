"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function ResetButton() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  return (
    <button
      onClick={async () => {
        setBusy(true);
        await fetch("/api/reset", { method: "POST" });
        setBusy(false);
        router.refresh();
      }}
      className="btn-ghost text-xs"
      title="Wipe and re-seed the three demo items"
    >
      {busy ? "Resetting…" : "↺ Reset demo"}
    </button>
  );
}
