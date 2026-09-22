import Link from "next/link";
import { requireStaff } from "@/app/actions/auth";
import { AttendanceForm } from "@/components/attendance-form";
import { EmptyState, PageShell } from "@/components/ui-copy";
import { prisma } from "@/lib/db";
import { formatInZone } from "@/lib/datetime";

export default async function AttendancePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireStaff();
  const params = await searchParams;
  const shifts = await prisma.shift.findMany({
    where: { status: { in: ["published", "closed"] } },
    orderBy: { startsAt: "desc" },
    take: 40,
  });
  const selectedId =
    (typeof params.shiftId === "string" && params.shiftId) || shifts[0]?.id || null;
  const selected = selectedId
    ? await prisma.shift.findUnique({
        where: { id: selectedId },
        include: {
          assignments: {
            include: { volunteer: true, role: true },
            orderBy: { createdAt: "asc" },
          },
        },
      })
    : null;

  return (
    <PageShell
      kicker="Attendance desk"
      title="Mark who showed"
      description="Staff mark wins over any volunteer self-report. Completed shifts write confirmed hours from the shift length."
    >
      {shifts.length === 0 ? (
        <EmptyState
          title="No shifts published."
          body="Create and publish a shift on the schedule, then return here to check people in."
        />
      ) : (
        <>
          <form className="mb-6 flex flex-col gap-3 min-[641px]:flex-row">
            <select name="shiftId" defaultValue={selectedId ?? ""} className="h-11 flex-1 rounded-none border border-[#d7d0c2] bg-white px-3">
              {shifts.map((s) => (
                <option key={s.id} value={s.id}>
                  {formatInZone(s.startsAt, s.timezone)} — {s.title}
                </option>
              ))}
            </select>
            <button type="submit" className="hub-btn h-11 bg-[#222] px-5 text-white">
              Open roster
            </button>
          </form>
          {selected ? (
            <div className="border border-[#d7d0c2] bg-white">
              <div className="border-b border-[#d7d0c2] px-4 py-3">
                <p className="hub-kicker">{selected.title}</p>
                <p>{selected.locationName}</p>
                <Link href={`/admin/schedule/${selected.id}`} className="text-sm underline">
                  Edit shift
                </Link>
              </div>
              {selected.assignments.length === 0 ? (
                <p className="p-5">No one is on this roster yet.</p>
              ) : (
                <ul>
                  {selected.assignments.map((a) => (
                    <li
                      key={a.id}
                      className="flex flex-col gap-3 border-t border-[#eeeae0] px-4 py-4 min-[641px]:flex-row min-[641px]:items-center min-[641px]:justify-between"
                    >
                      <div>
                        <Link href={`/admin/people/${a.volunteer.id}`} className="underline">
                          {a.volunteer.name}
                        </Link>
                        <p className="text-sm text-[#5c574c]">
                          {a.role.title} · {a.volunteer.email}
                        </p>
                      </div>
                      <AttendanceForm assignmentId={a.id} status={a.status} />
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ) : null}
        </>
      )}
    </PageShell>
  );
}
