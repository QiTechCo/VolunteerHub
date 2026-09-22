"use client";

import { useState } from "react";

export function ReminderPingButton() {
  const [status, setStatus] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  return (
    <div className="mt-4">
      <button
        type="button"
        disabled={busy}
        className="hub-btn inline-flex h-11 items-center bg-[#222] px-5 text-white disabled:opacity-60"
        onClick={async () => {
          setBusy(true);
          setStatus(null);
          try {
            const res = await fetch("/volunteer/api/push/reminders", { method: "POST" });
            const data = (await res.json()) as {
              ok?: boolean;
              volunteers?: number;
              sent?: number;
              error?: string;
            };
            if (!res.ok) throw new Error(data.error || "Could not ping.");
            setStatus(
              `Reminders queued for ${data.volunteers ?? 0} upcoming assignment${(data.volunteers ?? 0) === 1 ? "" : "s"} (${data.sent ?? 0} device hits).`,
            );
          } catch (e) {
            setStatus(e instanceof Error ? e.message : "Could not ping.");
          } finally {
            setBusy(false);
          }
        }}
      >
        {busy ? "Sending…" : "Ping upcoming shifts"}
      </button>
      {status ? <p className="mt-3 text-sm">{status}</p> : null}
    </div>
  );
}
