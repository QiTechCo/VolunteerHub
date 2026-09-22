import { hhmmToMinutes, nyDateParts } from "@/lib/datetime";
import type { Availability, Volunteer } from "@prisma/client";

export function zipScore(volunteerZip: string | null | undefined, locationHint?: string) {
  if (!volunteerZip) return 0;
  const zip = volunteerZip.replace(/\D/g, "");
  if (zip.length < 3) return 0;
  if (locationHint && locationHint.includes(zip)) return 20;
  if (zip.startsWith("282")) return 12;
  return 4;
}

export function availabilityScore(
  availability: Pick<Availability, "weekday" | "startLocal" | "endLocal">[],
  startsAt: Date,
  endsAt: Date,
  timeZone: string,
) {
  if (availability.length === 0) return 0;
  const start = nyDateParts(startsAt, timeZone);
  const end = nyDateParts(endsAt, timeZone);
  const startMin = start.hour * 60 + start.minute;
  const endMin = end.hour * 60 + end.minute;
  const match = availability.find((slot) => {
    if (slot.weekday !== start.weekday) return false;
    const a = hhmmToMinutes(slot.startLocal);
    const b = hhmmToMinutes(slot.endLocal);
    return a <= startMin && b >= endMin;
  });
  return match ? 50 : 0;
}

export function prefScore(
  prefs: { roleSlug: string; priority: number }[],
  roleSlug: string,
) {
  const pref = prefs.find((p) => p.roleSlug === roleSlug);
  if (!pref) return 0;
  return Math.max(0, 100 - (pref.priority - 1) * 20);
}

export function reliabilityScore(completed: number, noShows: number) {
  const total = completed + noShows;
  if (total === 0) return 15;
  return Math.round((completed / total) * 30);
}

export function rankShift(input: {
  volunteer: Pick<Volunteer, "zip">;
  prefs: { roleSlug: string; priority: number }[];
  availability: Pick<Availability, "weekday" | "startLocal" | "endLocal">[];
  completed: number;
  noShows: number;
  roleSlug: string;
  startsAt: Date;
  endsAt: Date;
  timezone: string;
  locationName: string;
}) {
  return (
    prefScore(input.prefs, input.roleSlug) +
    availabilityScore(input.availability, input.startsAt, input.endsAt, input.timezone) +
    zipScore(input.volunteer.zip, input.locationName) +
    reliabilityScore(input.completed, input.noShows)
  );
}
