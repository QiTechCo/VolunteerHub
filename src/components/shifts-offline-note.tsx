"use client";

import { useSyncExternalStore } from "react";

function subscribeOnline(onStoreChange: () => void) {
  window.addEventListener("online", onStoreChange);
  window.addEventListener("offline", onStoreChange);
  return () => {
    window.removeEventListener("online", onStoreChange);
    window.removeEventListener("offline", onStoreChange);
  };
}

export function ShiftsOfflineNote() {
  const offline = useSyncExternalStore(
    subscribeOnline,
    () => !navigator.onLine,
    () => false,
  );
  if (!offline) return null;
  return (
    <div className="mb-6 border border-[#d7d0c2] bg-white p-4">
      <p className="hub-kicker text-navy">Offline</p>
      <p className="mt-2">
        The live shift board needs a connection so seats and waitlists stay honest. Hub
        will not silently show a stale private roster. How-to and Day 1 still open from
        the Home Screen.
      </p>
    </div>
  );
}
