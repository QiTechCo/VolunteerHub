"use client";

import { useState } from "react";
import { logoutAction } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { unsubscribeHubPush } from "@/lib/push-client";
import { cn } from "@/lib/utils";

export function LogoutButton({
  className,
  filled = false,
}: {
  className?: string;
  filled?: boolean;
}) {
  const [busy, setBusy] = useState(false);

  async function handleLogout() {
    if (busy) return;
    setBusy(true);
    void unsubscribeHubPush().catch(() => undefined);
    try {
      await logoutAction();
    } catch {
      // Next.js redirect throws internally; fallback below guarantees navigation
    }
    window.location.href = "/volunteer";
  }

  return (
    <Button
      type="button"
      disabled={busy}
      onClick={() => void handleLogout()}
      variant={filled ? "default" : "outline"}
      className={cn(
        "hub-btn h-10 rounded-none px-4 cursor-pointer",
        filled && "h-11 w-full bg-[#222] text-white hover:bg-[#272727]",
        className,
      )}
    >
      {busy ? "Logging out…" : "Log out"}
    </Button>
  );
}
