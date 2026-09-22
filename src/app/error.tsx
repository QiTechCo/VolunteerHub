"use client";

import { useEffect } from "react";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto max-w-xl px-4 py-16 text-center">
      <p className="hub-kicker text-navy">Server error</p>
      <h1 className="mt-3 text-2xl">Volunteer Hub hit a problem</h1>
      <p className="mt-4 text-[#5c574c]">
        This is not a permissions issue. Retry, or come back after the coordinator
        reloads the desk.
      </p>
      <button
        type="button"
        onClick={() => reset()}
        className="hub-btn mt-6 inline-flex h-11 items-center bg-[#222] px-5 text-white"
      >
        Retry
      </button>
    </div>
  );
}
