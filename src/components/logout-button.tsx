"use client";

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
  return (
    <form
      action={async () => {
        await unsubscribeHubPush().catch(() => undefined);
        await logoutAction();
      }}
    >
      <Button
        type="submit"
        variant={filled ? "default" : "outline"}
        className={cn(
          "hub-btn h-10 rounded-none px-4",
          filled && "h-11 w-full bg-[#222] text-white hover:bg-[#272727]",
          className,
        )}
      >
        Log out
      </Button>
    </form>
  );
}
