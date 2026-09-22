import { BASE_PATH } from "@/lib/constants";
import { formatInZone } from "@/lib/datetime";

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function icsDate(date: Date) {
  return (
    date.getUTCFullYear().toString() +
    pad(date.getUTCMonth() + 1) +
    pad(date.getUTCDate()) +
    "T" +
    pad(date.getUTCHours()) +
    pad(date.getUTCMinutes()) +
    pad(date.getUTCSeconds()) +
    "Z"
  );
}

export function shiftIcs(input: {
  id: string;
  title: string;
  locationName: string;
  startsAt: Date;
  endsAt: Date;
  timezone: string;
}) {
  const stamp = icsDate(new Date());
  const uid = `${input.id}@volunteer.dimpleajmera.com`;
  const desc = `Volunteer Hub shift. ${formatInZone(input.startsAt, input.timezone)} – ${formatInZone(input.endsAt, input.timezone)}.`;
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Volunteer Hub//Dimple Ajmera//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${stamp}`,
    `DTSTART:${icsDate(input.startsAt)}`,
    `DTEND:${icsDate(input.endsAt)}`,
    `SUMMARY:${escapeIcs(input.title)}`,
    `LOCATION:${escapeIcs(input.locationName)}`,
    `DESCRIPTION:${escapeIcs(desc)}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
}

function escapeIcs(value: string) {
  return value.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");
}

export function icsHref(shiftId: string) {
  return `${BASE_PATH}/api/shifts/${shiftId}/ics`;
}
