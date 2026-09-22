import Link from "next/link";
import { requireVolunteer } from "@/app/actions/auth";
import { CancelShiftButton, FeedbackForm } from "@/components/my-shift-actions";
import { AssignmentBadge } from "@/components/status-badge";
import { EmptyState, PageShell } from "@/components/ui-copy";
import { prisma } from "@/lib/db";
import { formatInZone } from "@/lib/datetime";
import { BASE_PATH } from "@/lib/constants";

export default async function MyShiftsPage() {
  const session = await requireVolunteer();
  const assignments = await prisma.assignment.findMany({
    where: { volunteerId: session.id },
    include: { shift: true, role: true },
    orderBy: { shift: { startsAt: "desc" } },
  });
  const now = new Date();
  const upcoming = assignments.filter(
    (a) =>
      a.shift.startsAt >= now &&
      ["registered", "confirmed", "pending_approval", "waitlisted"].includes(a.status),
  );
  const past = assignments.filter((a) => !upcoming.includes(a));

  return (
    <PageShell kicker="My shifts" title="Upcoming, waitlisted, past">
      <section>
        <h2 className="text-xl">Upcoming</h2>
        {upcoming.length === 0 ? (
          <div className="mt-4">
            <EmptyState
              title="You’re in. Pick a shift."
              body="Nothing on your calendar. Open the board to take a seat or join a waitlist."
              action={
                <Link href="/shifts" className="hub-btn inline-flex h-11 items-center bg-[#222] px-5 text-white">
                  Shift board
                </Link>
              }
            />
          </div>
        ) : (
          <ul className="mt-4 space-y-4">
            {upcoming.map((a) => (
              <li key={a.id} className="border border-[#d7d0c2] bg-white p-5">
                <div className="flex flex-col gap-3 min-[641px]:flex-row min-[641px]:items-start min-[641px]:justify-between">
                  <div>
                    <Link href={`/shifts/${a.shift.id}`} className="text-lg font-medium hover:underline">
                      {a.shift.title}
                    </Link>
                    <p className="text-[#5c574c]">
                      {a.role.title} · {formatInZone(a.shift.startsAt, a.shift.timezone)}
                    </p>
                    <p className="mt-2">{a.shift.locationName}</p>
                  </div>
                  <AssignmentBadge status={a.status} />
                </div>
                <div className="mt-4 flex flex-wrap gap-3">
                  <a
                    href={`${BASE_PATH}/api/shifts/${a.shift.id}/ics`}
                    className="hub-kicker border border-[#222] px-3 py-2"
                  >
                    Download calendar invite
                  </a>
                  <CancelShiftButton assignmentId={a.id} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
      <section className="mt-12">
        <h2 className="text-xl">Past</h2>
        {past.length === 0 ? (
          <p className="mt-4 text-[#5c574c]">Past assignments will land here after the first shift.</p>
        ) : (
          <ul className="mt-4 space-y-4">
            {past.map((a) => (
              <li key={a.id} className="border border-[#d7d0c2] bg-white p-5">
                <div className="flex flex-col gap-3 min-[641px]:flex-row min-[641px]:justify-between">
                  <div>
                    <p className="text-lg font-medium">{a.shift.title}</p>
                    <p className="text-[#5c574c]">
                      {a.role.title} · {formatInZone(a.shift.startsAt, a.shift.timezone)}
                    </p>
                  </div>
                  <AssignmentBadge status={a.status} />
                </div>
                {a.status === "completed" ? (
                  <div className="mt-4">
                    <p className="mb-2">Thank you for showing up. Hours post after staff confirm attendance.</p>
                    <FeedbackForm assignmentId={a.id} defaultNote={a.feedbackNote} />
                  </div>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </section>
    </PageShell>
  );
}
