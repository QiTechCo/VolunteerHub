"use client";

import { useState, useSyncExternalStore } from "react";
import Link from "next/link";
import {
  isIosDevice,
  isStandaloneDisplay,
  sendTestPing,
  subscribeHubPush,
  unsubscribeHubPush,
} from "@/lib/push-client";

function subscribeNoop() {
  return () => undefined;
}

export function PushOptIn() {
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const iosNeedsInstall = useSyncExternalStore(
    subscribeNoop,
    () => isIosDevice() && !isStandaloneDisplay(),
    () => false,
  );

  async function enable() {
    setBusy(true);
    setError(null);
    try {
      const result = await subscribeHubPush();
      setStatus(
        result.mode === "mock"
          ? "Notifications are on for this device (local preview / mock Web Push)."
          : "This device will get shift confirmations, reminders, and waitlist pings.",
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not turn on notifications.");
    } finally {
      setBusy(false);
    }
  }

  async function disable() {
    setBusy(true);
    setError(null);
    try {
      await unsubscribeHubPush();
      setStatus("This device will not get Hub pings.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not turn off notifications.");
    } finally {
      setBusy(false);
    }
  }

  async function ping() {
    setBusy(true);
    setError(null);
    try {
      await sendTestPing();
      setStatus("Test ping sent. If nothing appeared, check notification permission.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Test ping failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="border border-[#d7d0c2] bg-white p-5">
      <p className="hub-kicker text-navy">Shift notifications</p>
      <h2 className="mt-2 text-lg">Pings on this phone</h2>
      <p className="mt-3 text-[17px]">
        Opt in for signup confirmations, waitlist seats, and reminders. Hub never uses
        this for marketing.{" "}
        <Link href="/install" className="underline">
          Install and iPhone notes
        </Link>
        .
      </p>
      {iosNeedsInstall ? (
        <p className="mt-3 text-sm text-[#5c574c]">
          Safari on iPhone only delivers Web Push after Volunteer Hub is on the Home
          Screen and opened from that icon.
        </p>
      ) : null}
      {status ? <p className="mt-3">{status}</p> : null}
      {error ? <p className="mt-3 text-[#b11a2b]">{error}</p> : null}
      <div className="mt-4 flex flex-col gap-2 min-[480px]:flex-row">
        <button
          type="button"
          disabled={busy}
          onClick={() => void enable()}
          className="hub-btn inline-flex h-11 items-center justify-center bg-[#222] px-5 text-white disabled:opacity-60"
        >
          {busy ? "Working…" : "Turn on"}
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={() => void ping()}
          className="hub-btn inline-flex h-11 items-center justify-center border border-[#222] px-5 disabled:opacity-60"
        >
          Send a test ping
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={() => void disable()}
          className="hub-btn inline-flex h-11 items-center justify-center px-5 text-[#5c574c] disabled:opacity-60"
        >
          Turn off
        </button>
      </div>
    </div>
  );
}
