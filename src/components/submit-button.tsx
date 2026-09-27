"use client";

import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function SubmitButton({
  children,
  className,
  variant = "default",
}: {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "outline" | "destructive" | "secondary";
}) {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      variant={variant}
      disabled={pending}
      className={cn(
        "hub-btn h-11 rounded-none bg-[#222] px-6 text-white hover:bg-[#272727]",
        variant === "outline" && "border-[#222] bg-transparent text-[#222] hover:bg-neutral-100",
        variant === "destructive" && "bg-destructive text-white hover:bg-destructive/90",
        className,
      )}
    >
      {pending ? "Saving…" : children}
    </Button>
  );
}
