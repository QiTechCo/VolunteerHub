import Link from "next/link";
import { AssignmentBadge } from "@/components/status-badge";
import { formatDateInZone, formatTimeInZone } from "@/lib/datetime";

export type ShiftCardModel = {
  id: string;
  title: string;
  locationName: string;
  startsAt: Date;
  endsAt: Date;
  timezone: string;
  remaining: number;
  capacity: number;
  roles: { slug: string; title: string; remaining: number; capacity: number }[];
  rank?: number;
};

export function ShiftCard({ shift }: { shift: ShiftCardModel }) {
  return (
    <article className="flex flex-col border border-[#d7d0c2] bg-white p-5">
      <p className="hub-kicker text-navy">
        {formatDateInZone(shift.startsAt, shift.timezone)}
      </p>
      <h2 className="mt-2 text-lg normal-case tracking-normal">
        <Link href={`/shifts/${shift.id}`} className="hover:underline">
          {shift.title}
        </Link>
      </h2>
      <p className="mt-2 text-[#5c574c]">
        {formatTimeInZone(shift.startsAt, shift.timezone)} –{" "}
        {formatTimeInZone(shift.endsAt, shift.timezone)} · {shift.locationName}
      </p>
      <ul className="mt-4 flex flex-wrap gap-2">
        {shift.roles.map((role) => (
          <li
            key={role.slug}
            className="border border-[#d7d0c2] px-2 py-1 text-sm"
          >
            {role.title}: {role.remaining} of {role.capacity} open
          </li>
        ))}
      </ul>
      {shift.remaining === 0 ? (
        <p className="mt-3 text-sm">Full — waitlist available on the shift page.</p>
      ) : null}
      <Link
        href={`/shifts/${shift.id}`}
        className="hub-btn mt-5 inline-flex h-11 items-center justify-center bg-[#222] px-5 text-white"
      >
        View shift
      </Link>
    </article>
  );
}

export function AssignmentRow({
  title,
  when,
  status,
  href,
}: {
  title: string;
  when: string;
  status: string;
  href: string;
}) {
  return (
    <li className="flex flex-col gap-2 border border-[#d7d0c2] bg-white p-4 min-[641px]:flex-row min-[641px]:items-center min-[641px]:justify-between">
      <div>
        <Link href={href} className="font-medium hover:underline">
          {title}
        </Link>
        <p className="text-sm text-[#5c574c]">{when}</p>
      </div>
      <AssignmentBadge status={status} />
    </li>
  );
}
