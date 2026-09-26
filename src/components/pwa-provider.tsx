"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { registerHubServiceWorker } from "@/lib/push-client";
import { OfflinePanel } from "@/components/offline-panel";

function subscribeOnline(onStoreChange: () => void) {
  window.addEventListener("online", onStoreChange);
  window.addEventListener("offline", onStoreChange);
  return () => {
    window.removeEventListener("online", onStoreChange);
    window.removeEventListener("offline", onStoreChange);
  };
}

export function PwaProvider({
  signedIn,
  children,
}: {
  signedIn: boolean;
  children: React.ReactNode;
}) {
  const offline = useSyncExternalStore(
    subscribeOnline,
    () => !navigator.onLine,
    () => false,
  );
  const pathname = usePathname();
  const [hint, setHint] = useState(false);
  const showOfflinePanel =
    offline &&
    (pathname === "/training" ||
      pathname.startsWith("/training/") ||
      pathname === "/shifts" ||
      pathname.startsWith("/shifts/"));

  useEffect(() => {
    void registerHubServiceWorker();
  }, []);

  useEffect(() => {
    if (signedIn) document.body.classList.add("has-mobile-dock");
    else document.body.classList.remove("has-mobile-dock");
    return () => document.body.classList.remove("has-mobile-dock");
  }, [signedIn]);

  useEffect(() => {
    if (window.localStorage.getItem("vh_install_hint") === "done") return;
    const narrow = window.matchMedia("(max-width: 640px)").matches;
    if (!narrow) return;
    const t = window.setTimeout(() => setHint(true), 1200);
    return () => window.clearTimeout(t);
  }, []);

  return (
    <>
      {offline ? (
        <div className="border-b border-[#d7d0c2] bg-white px-4 py-2 text-center text-sm">
          You’re offline. Training modules and guide resources stay on this device. The shift board
          needs a connection.
        </div>
      ) : null}
      {hint ? (
        <div className="border-b border-[#d7d0c2] bg-[#efe8d8] px-4 py-3 text-sm min-[641px]:hidden">
          <p>
            Add Volunteer Hub to your Home Screen for a full-screen app and, on iPhone,
            notifications.{" "}
            <Link href="/install" className="underline">
              How to install
            </Link>
          </p>
          <button
            type="button"
            className="hub-kicker mt-2 underline"
            onClick={() => {
              window.localStorage.setItem("vh_install_hint", "done");
              setHint(false);
            }}
          >
            Dismiss
          </button>
        </div>
      ) : null}
      {showOfflinePanel ? <OfflinePanel /> : children}
    </>
  );
}
