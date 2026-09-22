"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export function FormAlert({ state }: { state?: { error?: string; success?: string } }) {
  if (!state?.error && !state?.success) return null;
  if (state.error) {
    return (
      <Alert variant="destructive" className="rounded-none">
        <AlertTitle>Could not save</AlertTitle>
        <AlertDescription>{state.error}</AlertDescription>
      </Alert>
    );
  }
  return (
    <Alert className="rounded-none border-[#1e3a6e]/30 bg-[#1e3a6e]/5">
      <AlertTitle>Saved</AlertTitle>
      <AlertDescription>{state.success}</AlertDescription>
    </Alert>
  );
}
