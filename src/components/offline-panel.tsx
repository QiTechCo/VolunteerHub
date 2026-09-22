"use client";

import { usePathname } from "next/navigation";
import { ROLE_COPY, ROLE_SLUGS } from "@/lib/constants";

export function OfflinePanel() {
  const pathname = usePathname();
  const training = pathname === "/training" || pathname.startsWith("/training/");
  const shifts = pathname === "/shifts" || pathname.startsWith("/shifts/");
  const home = pathname === "/";

  if (!training && !shifts && !home) return null;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <p className="hub-kicker text-navy">Offline</p>
      <h1 className="mt-3 text-2xl">You’re offline</h1>
      <p className="mt-4 max-w-2xl">
        Hub chrome and site information stay on this phone. This copy is campaign
        information, not an account page — volunteer profile data is not stored here.
      </p>
      {shifts ? (
        <div className="mt-6 border border-[#d7d0c2] bg-white p-5">
          <h2 className="text-lg">Shift board</h2>
          <p className="mt-3">
            The live board needs a connection so seats and waitlists stay honest. Hub
            will not silently show a stale private roster.
          </p>
        </div>
      ) : null}
      {home || training ? (
        <>
          <h2 className="mt-8 text-lg">How to volunteer</h2>
          <ol className="mt-3 list-decimal space-y-2 pl-5">
            <li>Create an on-domain account with your name, email, and a password.</li>
            <li>Add availability and role preferences on your profile.</li>
            <li>Sign up for a published shift. If a role is full, you join the waitlist.</li>
            <li>Hours post after staff confirm attendance.</li>
          </ol>
          <h2 className="mt-8 text-lg">How you can help</h2>
          <ul className="mt-4 space-y-3">
            {ROLE_SLUGS.map((slug) => (
              <li key={slug} className="border border-[#d7d0c2] bg-white p-4">
                <p className="font-medium">{ROLE_COPY[slug].title}</p>
                <p className="mt-1 text-[17px]">{ROLE_COPY[slug].description}</p>
              </li>
            ))}
          </ul>
        </>
      ) : null}
      {training || home ? (
        <div className="mt-8 space-y-3">
          <h2 className="text-lg">Day 1 — People, Power, Purpose</h2>
          <p>Volunteer Organizing Intensive playbook. Short excerpts only.</p>
          <div className="border border-[#d7d0c2] bg-white p-5">
            <p className="hub-kicker text-navy">People</p>
            <p className="mt-3">
              People is who we are fighting for, and how we talk with them — Dimple’s
              path, the four-pillar mandate, and an empathy loop at the door without
              blame.
            </p>
            <p className="mt-3">
              “It&apos;s not what we say, but it&apos;s really what we do that matters.”
            </p>
          </div>
          <div className="border border-[#d7d0c2] bg-white p-5">
            <p className="hub-kicker text-navy">Power</p>
            <p className="mt-3">
              Three jobs at once: win the seat, build volunteer leadership, and change
              what Charlotte treats as common sense.
            </p>
            <p className="mt-3">
              1st dimension: power to win demands. 2nd: drive the agenda. 3rd: shape
              common sense.
            </p>
          </div>
          <div className="border border-[#d7d0c2] bg-white p-5">
            <p className="hub-kicker text-navy">Purpose</p>
            <p className="mt-3">
              Goal, analysis, strategy, then tactics. Put big rocks (voter contact,
              house meetings, leadership) on the calendar first.
            </p>
          </div>
        </div>
      ) : null}
    </div>
  );
}
