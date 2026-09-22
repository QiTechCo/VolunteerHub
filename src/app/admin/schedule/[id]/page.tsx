import { notFound } from "next/navigation";
import { requireStaff } from "@/app/actions/auth";
import { AssignForm, ShiftForm, ShiftStatusForm } from "@/components/admin-schedule-forms";
import { AssignmentBadge } from "@/components/status-badge";
import { PageShell } from "@/components/ui-copy";
import { prisma } from "@/lib/db";
import { datetimeLocalValue, formatInZone } from "@/lib/datetime";
import { shiftCapacitySummary } from "@/lib/scheduling";

export default async function EditShiftPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireStaff();
  const { id } = await params;
  const shift = await prisma.shift.findUnique({
    where: { id },
    include: {
      roleCaps: { include: { role: true } },
      assignments: { include: { volunteer: true, role: true } },
    },
  });
  if (!shift) notFound();
  const caps = await shiftCapacitySummary(shift.id);
  const volunteers = await prisma.volunteer.findMany({
    where: { status: "active" },
    orderBy: { name: "asc" },
    select: { id: true, name: true, email: true },
  });

  return (
    <PageShell kicker="Schedule" title={shift.title}>
      <div className="grid gap-8 min-[641px]:grid-cols-2">
        <div className="border border-[#d7d0c2] bg-white p-6">
          <ShiftForm
            shift={{
              id: shift.id,
              title: shift.title,
              locationName: shift.locationName,
              startsAtLocal: datetimeLocalValue(shift.startsAt, shift.timezone),
              endsAtLocal: datetimeLocalValue(shift.endsAt, shift.timezone),
              timezone: shift.timezone,
              visibility: shift.visibility,
              status: shift.status,
              whatToBring: shift.whatToBring,
              notes: shift.notes,
              registrationClosesLocal: shift.registrationClosesAt
                ? datetimeLocalValue(shift.registrationClosesAt, shift.timezone)
                : "",
              caps: shift.roleCaps.map((c) => ({
                roleSlug: c.roleSlug,
                capacity: c.capacity,
              })),
            }}
          />
          <div className="mt-6">
            <ShiftStatusForm id={shift.id} status={shift.status} />
          </div>
        </div>
        <div className="space-y-6">
          <div className="border border-[#d7d0c2] bg-white p-5">
            <h2 className="text-lg">Seats</h2>
            <ul className="mt-3 space-y-1">
              {caps.map((c) => (
                <li key={c.roleSlug}>
                  {c.title}: {c.filled}/{c.capacity} · {c.waitlisted} waitlisted
                </li>
              ))}
            </ul>
          </div>
          <div className="border border-[#d7d0c2] bg-white p-5">
            <h2 className="text-lg">Assign someone</h2>
            <div className="mt-3">
              <AssignForm
                shiftId={shift.id}
                roles={shift.roleCaps.map((c) => ({
                  slug: c.roleSlug,
                  title: c.role.title,
                }))}
                volunteers={volunteers}
              />
            </div>
          </div>
          <div className="border border-[#d7d0c2] bg-white p-5">
            <h2 className="text-lg">Roster</h2>
            <ul className="mt-3 space-y-2">
              {shift.assignments.map((a) => (
                <li key={a.id} className="flex items-center justify-between gap-2">
                  <span>
                    {a.volunteer.name} · {a.role.title}
                    <br />
                    <span className="text-sm text-[#5c574c]">
                      {formatInZone(shift.startsAt, shift.timezone)}
                    </span>
                  </span>
                  <AssignmentBadge status={a.status} />
                </li>
              ))}
              {shift.assignments.length === 0 ? <li>No one signed up yet.</li> : null}
            </ul>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
