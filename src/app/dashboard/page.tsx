import Link from "next/link";
import { requireVolunteer } from "@/app/actions/auth";
import { EmptyState, PageShell } from "@/components/ui-copy";
import { AssignmentRow } from "@/components/shift-card";
import { prisma } from "@/lib/db";
import { formatInZone, formatMinutes } from "@/lib/datetime";

export default async function DashboardPage() {
  const session = await requireVolunteer();
  const volunteer = await prisma.volunteer.findUnique({
    where: { id: session.id },
    include: {
      rolePrefs: true,
      availability: true,
      documents: true,
      assignments: { include: { shift: true, role: true } },
      hoursEntries: true,
    },
  });
  if (!volunteer) return null;

  const now = new Date();
  const next = volunteer.assignments
    .filter(
      (a) =>
        ["registered", "confirmed", "pending_approval", "waitlisted"].includes(a.status) &&
        a.shift.startsAt >= now,
    )
    .sort((a, b) => a.shift.startsAt.getTime() - b.shift.startsAt.getTime())[0];

  const confirmedMinutes = volunteer.hoursEntries
    .filter((h) => h.status === "confirmed")
    .reduce((sum, h) => sum + h.minutes, 0);

  const profileBits = [
    volunteer.phone ? 1 : 0,
    volunteer.zip ? 1 : 0,
    volunteer.rolePrefs.length ? 1 : 0,
    volunteer.availability.length ? 1 : 0,
  ];
  const completeness = Math.round((profileBits.reduce((a, b) => a + b, 0) / 4) * 100);

  return (
    <PageShell
      kicker="Dashboard"
      title={`Hello, ${volunteer.name.split(" ")[0]}`}
    >
      <div className="grid gap-4 min-[641px]:grid-cols-3">
        <div className="border border-[#d7d0c2] bg-white p-5">
          <p className="hub-kicker">Hours</p>
          <p className="mt-2 text-3xl tracking-normal normal-case">
            {formatMinutes(confirmedMinutes)}
          </p>
          <Link href="/hours" className="mt-3 inline-block underline">
            Hours ledger
          </Link>
        </div>
        <div className="border border-[#d7d0c2] bg-white p-5">
          <p className="hub-kicker">Profile</p>
          <p className="mt-2 text-3xl tracking-normal normal-case">{completeness}%</p>
          <Link href="/profile" className="mt-3 inline-block underline">
            Contact, availability, roles
          </Link>
        </div>
        <div className="border border-[#d7d0c2] bg-white p-5">
          <p className="hub-kicker">Documents</p>
          <p className="mt-2 text-3xl tracking-normal normal-case">
            {volunteer.documents.length}
          </p>
          <Link href="/documents" className="mt-3 inline-block underline">
            Resume, CV, bio
          </Link>
        </div>
      </div>

      <div className="mt-4 border border-[#d7d0c2] bg-white p-5">
        <p className="hub-kicker">Training</p>
        <p className="mt-2">Day 1 notebook — People, Power, Purpose.</p>
        <Link href="/training" className="mt-3 inline-block underline">
          Open Day 1
        </Link>
      </div>

      <div className="mt-10">
        <h2 className="text-xl">Next shift</h2>
        {next ? (
          <ul className="mt-4">
            <AssignmentRow
              title={`${next.shift.title} · ${next.role.title}`}
              when={formatInZone(next.shift.startsAt, next.shift.timezone)}
              status={next.status}
              href={`/shifts/${next.shift.id}`}
            />
          </ul>
        ) : (
          <EmptyState
            title="You’re in. Pick a shift."
            body="Nothing upcoming yet. Open the board and take a published timeslot."
            action={
              <Link href="/shifts" className="hub-btn inline-flex h-11 items-center bg-[#222] px-5 text-white">
                Shift board
              </Link>
            }
          />
        )}
      </div>
    </PageShell>
  );
}
