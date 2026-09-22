import Link from "next/link";
import { EmptyState, PageShell } from "@/components/ui-copy";
import { ShiftCard } from "@/components/shift-card";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { ROLE_COPY, ROLE_SLUGS, type RoleSlug } from "@/lib/constants";
import { remainingSeats } from "@/lib/scheduling";
import { rankShift } from "@/lib/ranking";

export default async function ShiftsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const roleFilter =
    typeof params.role === "string" && ROLE_SLUGS.includes(params.role as RoleSlug)
      ? (params.role as RoleSlug)
      : null;

  const session = await getSession();
  const now = new Date();
  const shifts = await prisma.shift.findMany({
    where: {
      status: "published",
      visibility: "public",
      startsAt: { gte: now },
      ...(roleFilter ? { roleCaps: { some: { roleSlug: roleFilter } } } : {}),
    },
    include: { roleCaps: { include: { role: true } } },
    orderBy: { startsAt: "asc" },
  });

  let volunteerContext: {
    zip: string | null;
    prefs: { roleSlug: string; priority: number }[];
    availability: { weekday: number; startLocal: string; endLocal: string }[];
    completed: number;
    noShows: number;
  } | null = null;

  if (session?.kind === "volunteer") {
    const volunteer = await prisma.volunteer.findUnique({
      where: { id: session.id },
      include: {
        rolePrefs: true,
        availability: true,
        assignments: { select: { status: true } },
      },
    });
    if (volunteer) {
      volunteerContext = {
        zip: volunteer.zip,
        prefs: volunteer.rolePrefs,
        availability: volunteer.availability,
        completed: volunteer.assignments.filter((a) => a.status === "completed").length,
        noShows: volunteer.assignments.filter((a) => a.status === "no_show").length,
      };
    }
  }

  const cards = await Promise.all(
    shifts.map(async (shift) => {
      const roles = await Promise.all(
        shift.roleCaps.map(async (cap) => {
          const remaining = await remainingSeats(shift.id, cap.roleSlug);
          const rank = volunteerContext
            ? rankShift({
                volunteer: { zip: volunteerContext.zip },
                prefs: volunteerContext.prefs,
                availability: volunteerContext.availability,
                completed: volunteerContext.completed,
                noShows: volunteerContext.noShows,
                roleSlug: cap.roleSlug,
                startsAt: shift.startsAt,
                endsAt: shift.endsAt,
                timezone: shift.timezone,
                locationName: shift.locationName,
              })
            : 0;
          return {
            slug: cap.roleSlug,
            title: cap.role.title,
            remaining,
            capacity: cap.capacity,
            rank,
          };
        }),
      );
      const remaining = roles.reduce((sum, role) => sum + role.remaining, 0);
      const capacity = roles.reduce((sum, role) => sum + role.capacity, 0);
      const rank = Math.max(0, ...roles.map((r) => r.rank));
      return {
        id: shift.id,
        title: shift.title,
        locationName: shift.locationName,
        startsAt: shift.startsAt,
        endsAt: shift.endsAt,
        timezone: shift.timezone,
        remaining,
        capacity,
        roles,
        rank,
      };
    }),
  );

  if (volunteerContext) {
    cards.sort((a, b) => b.rank - a.rank || a.startsAt.getTime() - b.startsAt.getTime());
  }

  return (
    <PageShell
      kicker="Shift board"
      title="Published shifts"
      description="Meeting points only — no home addresses. Sign up stays on this site."
    >
      <div className="mb-6 flex flex-wrap gap-2">
        <Link
          href="/shifts"
          className={`hub-kicker border px-3 py-2 ${!roleFilter ? "border-[#222] bg-[#222] text-white" : "border-[#d7d0c2]"}`}
        >
          All roles
        </Link>
        {ROLE_SLUGS.map((slug) => (
          <Link
            key={slug}
            href={`/shifts?role=${slug}`}
            className={`hub-kicker border px-3 py-2 ${roleFilter === slug ? "border-[#222] bg-[#222] text-white" : "border-[#d7d0c2]"}`}
          >
            {ROLE_COPY[slug].title}
          </Link>
        ))}
      </div>
      {cards.length === 0 ? (
        <EmptyState
          title="Shifts will appear when the campaign publishes them."
          body="Check back after the coordinator posts timeslots, or register so you can take a shift as soon as one opens."
          action={
            <Link href="/register" className="hub-btn inline-flex h-11 items-center bg-[#222] px-5 text-white">
              Register
            </Link>
          }
        />
      ) : (
        <div className="grid gap-4 min-[641px]:grid-cols-2">
          {cards.map((shift) => (
            <ShiftCard key={shift.id} shift={shift} />
          ))}
        </div>
      )}
    </PageShell>
  );
}
