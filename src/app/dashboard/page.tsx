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
      assignments: { include: { shift: true, role: true } },
      hoursEntries: true,
      trainings: true,
    },
  });
  if (!volunteer) return null;

  const trainedSlugs = new Set(volunteer.trainings.map((t) => t.roleSlug));
  const m1Done = trainedSlugs.has("training_m1_people");
  const m2Done = trainedSlugs.has("training_m2_power");
  const m3Done = trainedSlugs.has("training_m3_purpose");
  const certified = trainedSlugs.has("organizing_intensive") || (m1Done && m2Done && m3Done);
  const completedCount = (m1Done ? 1 : 0) + (m2Done ? 1 : 0) + (m3Done ? 1 : 0);

  const now = new Date();
  const upcomingAssignments = volunteer.assignments
    .filter(
      (a) =>
        ["registered", "confirmed", "pending_approval", "waitlisted"].includes(a.status) &&
        a.shift.startsAt >= now,
    )
    .sort((a, b) => a.shift.startsAt.getTime() - b.shift.startsAt.getTime());

  const next = upcomingAssignments[0];

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
      kicker="Volunteer Desk"
      title={`Welcome back, ${volunteer.name.split(" ")[0]}`}
    >
      <div className="grid gap-4 min-[641px]:grid-cols-3">
        <div className="border border-[#d7d0c2] bg-white p-5">
          <p className="hub-kicker">Volunteer Hours</p>
          <p className="mt-2 text-3xl tracking-normal normal-case">
            {formatMinutes(confirmedMinutes)}
          </p>
          <Link href="/hours" className="mt-3 inline-block text-sm underline hover:text-navy">
            View hours history →
          </Link>
        </div>
        <div className="border border-[#d7d0c2] bg-white p-5">
          <p className="hub-kicker">Upcoming Shifts</p>
          <p className="mt-2 text-3xl tracking-normal normal-case">
            {upcomingAssignments.length}
          </p>
          <Link href="/my-shifts" className="mt-3 inline-block text-sm underline hover:text-navy">
            View my schedule →
          </Link>
        </div>
        <div className="border border-[#d7d0c2] bg-white p-5">
          <p className="hub-kicker">Profile Status</p>
          <p className="mt-2 text-3xl tracking-normal normal-case">{completeness}%</p>
          <Link href="/profile" className="mt-3 inline-block text-sm underline hover:text-navy">
            Update profile & roles →
          </Link>
        </div>
      </div>

      <div className="mt-6 border border-[#d7d0c2] bg-white p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="hub-kicker text-navy">Volunteer Training</p>
            <h3 className="mt-1 text-xl">
              {certified
                ? "Organizing Intensive Certified ✓"
                : `${completedCount} of 3 Modules Completed`}
            </h3>
            <p className="mt-1 text-sm text-[#5c574c]">
              {certified
                ? "You have completed all organizing intensive modules. Shifts requiring training are unlocked."
                : "Master public narrative, power dynamics, and campaign planning for the Dimple Ajmera campaign."}
            </p>
          </div>
          <a
            href="/volunteer/training/index.html"
            className="hub-btn inline-flex h-10 items-center bg-[#222] px-4 text-white hover:bg-navy"
          >
            {completedCount === 0
              ? "Start Training"
              : certified
                ? "Review Modules"
                : "Continue Training"}
          </a>
        </div>

        <div className="mt-4 grid gap-2 min-[641px]:grid-cols-3">
          <a
            href="/volunteer/training/module-1-people.html"
            className={`block border p-3.5 transition-colors ${
              m1Done
                ? "border-[#1f7a44] bg-[#1f7a44] text-white hover:bg-[#196337]"
                : "border-[#d7d0c2] bg-white hover:bg-[#f9fafb]"
            }`}
          >
            <p className={`text-xs font-semibold uppercase tracking-wider ${m1Done ? "text-white/90" : "text-[#5c574c]"}`}>
              Module 1
            </p>
            <p className={`font-semibold text-sm mt-0.5 ${m1Done ? "text-white" : "text-[#222]"}`}>
              People {m1Done ? "✓" : ""}
            </p>
            <p className={`text-xs mt-0.5 ${m1Done ? "text-white/90" : "text-[#5c574c]"}`}>
              {m1Done ? "Completed" : "Not started"}
            </p>
          </a>
          <a
            href="/volunteer/training/module-2-power.html"
            className={`block border p-3.5 transition-colors ${
              m2Done
                ? "border-[#1f7a44] bg-[#1f7a44] text-white hover:bg-[#196337]"
                : "border-[#d7d0c2] bg-white hover:bg-[#f9fafb]"
            }`}
          >
            <p className={`text-xs font-semibold uppercase tracking-wider ${m2Done ? "text-white/90" : "text-[#5c574c]"}`}>
              Module 2
            </p>
            <p className={`font-semibold text-sm mt-0.5 ${m2Done ? "text-white" : "text-[#222]"}`}>
              Power {m2Done ? "✓" : ""}
            </p>
            <p className={`text-xs mt-0.5 ${m2Done ? "text-white/90" : "text-[#5c574c]"}`}>
              {m2Done ? "Completed" : "Not started"}
            </p>
          </a>
          <a
            href="/volunteer/training/module-3-purpose.html"
            className={`block border p-3.5 transition-colors ${
              m3Done
                ? "border-[#1f7a44] bg-[#1f7a44] text-white hover:bg-[#196337]"
                : "border-[#d7d0c2] bg-white hover:bg-[#f9fafb]"
            }`}
          >
            <p className={`text-xs font-semibold uppercase tracking-wider ${m3Done ? "text-white/90" : "text-[#5c574c]"}`}>
              Module 3
            </p>
            <p className={`font-semibold text-sm mt-0.5 ${m3Done ? "text-white" : "text-[#222]"}`}>
              Purpose {m3Done ? "✓" : ""}
            </p>
            <p className={`text-xs mt-0.5 ${m3Done ? "text-white/90" : "text-[#5c574c]"}`}>
              {m3Done ? "Completed" : "Not started"}
            </p>
          </a>
        </div>
      </div>

      <div className="mt-8">
        <div className="flex items-center justify-between">
          <h2 className="text-xl">Your Next Shift</h2>
          {upcomingAssignments.length > 1 ? (
            <Link href="/my-shifts" className="text-sm underline hover:text-navy">
              View all ({upcomingAssignments.length}) →
            </Link>
          ) : null}
        </div>
        {next ? (
          <ul className="mt-3">
            <AssignmentRow
              title={`${next.shift.title} · ${next.role.title}`}
              when={formatInZone(next.shift.startsAt, next.shift.timezone)}
              status={next.status}
              href={`/shifts/${next.shift.id}`}
            />
          </ul>
        ) : (
          <div className="mt-3">
            <EmptyState
              title="No upcoming shifts scheduled"
              body="You don’t have any shifts on your calendar yet. Check out the shift board to find a time to canvass, greet voters, or make calls."
              action={
                <Link href="/shifts" className="hub-btn inline-flex h-11 items-center bg-[#222] px-5 text-white hover:bg-navy">
                  Browse Shift Board
                </Link>
              }
            />
          </div>
        )}
      </div>
    </PageShell>
  );
}
