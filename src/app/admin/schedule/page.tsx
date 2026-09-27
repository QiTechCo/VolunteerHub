import Link from "next/link";
import { requireStaff } from "@/app/actions/auth";
import { EmptyState, PageShell } from "@/components/ui-copy";
import { prisma } from "@/lib/db";
import { formatInZone } from "@/lib/datetime";
import { shiftCapacitySummary } from "@/lib/scheduling";

export default async function SchedulePage() {
  await requireStaff();
  const shifts = await prisma.shift.findMany({ orderBy: { startsAt: "desc" } });
  const rows = await Promise.all(
    shifts.map(async (shift) => {
      const caps = await shiftCapacitySummary(shift.id);
      const capacity = caps.reduce((s, c) => s + c.capacity, 0);
      const filled = caps.reduce((s, c) => s + c.filled, 0);
      return { shift, capacity, filled };
    }),
  );

  return (
    <PageShell
      kicker="Schedule"
      title="Shifts"
      description="Each timeslot is its own row. Recurring series are copied as separate shifts in this beta."
    >
      <Link
        href="/admin/schedule/new"
        className="hub-btn mb-6 inline-flex h-11 items-center bg-[#222] px-5 text-white"
      >
        New shift
      </Link>
      {rows.length === 0 ? (
        <EmptyState
          title="No shifts published."
          body="Create a timeslot, set seats per role, then mark it published to show on the public board."
        />
      ) : (
        <>
          <ul className="space-y-3 min-[641px]:hidden">
            {rows.map(({ shift, capacity, filled }) => (
              <li key={shift.id} className="border border-[#d7d0c2] bg-white p-4">
                <Link href={`/admin/schedule/${shift.id}`} className="font-medium underline">
                  {shift.title}
                </Link>
                <p className="mt-1 text-sm text-[#5c574c]">{shift.locationName}</p>
                <p className="mt-2 text-sm">{formatInZone(shift.startsAt, shift.timezone)}</p>
                <p className="mt-1 text-sm">
                  {filled}/{capacity} · {shift.status} · {shift.visibility}
                </p>
              </li>
            ))}
          </ul>
          <div className="hidden overflow-x-auto border border-[#d7d0c2] bg-white min-[641px]:block">
          <table className="w-full text-left">
            <thead className="border-b border-[#d7d0c2] bg-white">
              <tr>
                <th className="hub-kicker px-4 py-3">Shift</th>
                <th className="hub-kicker px-4 py-3">When</th>
                <th className="hub-kicker px-4 py-3">Fill</th>
                <th className="hub-kicker px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(({ shift, capacity, filled }) => (
                <tr key={shift.id} className="border-b border-[#eeeae0]">
                  <td className="px-4 py-3">
                    <Link href={`/admin/schedule/${shift.id}`} className="underline">
                      {shift.title}
                    </Link>
                    <p className="text-sm text-[#5c574c]">{shift.locationName}</p>
                  </td>
                  <td className="px-4 py-3">{formatInZone(shift.startsAt, shift.timezone)}</td>
                  <td className="px-4 py-3">
                    {filled}/{capacity}
                  </td>
                  <td className="px-4 py-3">
                    {shift.status} · {shift.visibility}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </>
      )}
    </PageShell>
  );
}
