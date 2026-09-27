import { requireVolunteer } from "@/app/actions/auth";
import { EmptyState, PageShell } from "@/components/ui-copy";
import { prisma } from "@/lib/db";
import { formatInZone, formatMinutes } from "@/lib/datetime";

export default async function HoursPage() {
  const session = await requireVolunteer();
  const entries = await prisma.hoursEntry.findMany({
    where: { volunteerId: session.id },
    include: { assignment: { include: { shift: true } } },
    orderBy: { createdAt: "desc" },
  });
  const confirmed = entries.filter((e) => e.status === "confirmed");
  const total = confirmed.reduce((sum, e) => sum + e.minutes, 0);

  return (
    <PageShell
      kicker="Hours"
      title="Hours ledger"
      description="Hours appear after staff confirm attendance. This is not pay and is not a public leaderboard."
    >
      <p className="mb-6 text-2xl tracking-normal normal-case">
        Confirmed: {formatMinutes(total)}
      </p>
      {entries.length === 0 ? (
        <EmptyState
          title="Hours appear after staff confirm attendance."
          body="Take a shift, then the coordinator marks you complete at the attendance desk."
        />
      ) : (
        <>
          <ul className="space-y-3 min-[641px]:hidden">
            {entries.map((entry) => (
              <li key={entry.id} className="border border-[#d7d0c2] bg-white p-4">
                <p>
                  {entry.assignment?.shift
                    ? formatInZone(entry.assignment.shift.startsAt, entry.assignment.shift.timezone)
                    : formatInZone(entry.createdAt)}
                </p>
                <p className="text-sm text-[#5c574c]">
                  {entry.source.replace("_", " ")} · {formatMinutes(entry.minutes)} · {entry.status}
                </p>
              </li>
            ))}
          </ul>
          <div className="hidden overflow-x-auto border border-[#d7d0c2] bg-white min-[641px]:block">
          <table className="w-full text-left text-[16px]">
            <thead className="border-b border-[#d7d0c2] bg-white">
              <tr>
                <th className="hub-kicker px-4 py-3">When</th>
                <th className="hub-kicker px-4 py-3">Source</th>
                <th className="hub-kicker px-4 py-3">Time</th>
                <th className="hub-kicker px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry) => (
                <tr key={entry.id} className="border-b border-[#eeeae0]">
                  <td className="px-4 py-3">
                    {entry.assignment?.shift
                      ? formatInZone(entry.assignment.shift.startsAt, entry.assignment.shift.timezone)
                      : formatInZone(entry.createdAt)}
                  </td>
                  <td className="px-4 py-3">{entry.source.replace("_", " ")}</td>
                  <td className="px-4 py-3">{formatMinutes(entry.minutes)}</td>
                  <td className="px-4 py-3">{entry.status}</td>
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
