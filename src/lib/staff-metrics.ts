import { prisma } from "@/lib/db";
import { classifyVolunteer, type Segment } from "@/lib/segments";

export async function volunteerSegmentMap(ids?: string[]) {
  const volunteers = await prisma.volunteer.findMany({
    where: ids ? { id: { in: ids } } : undefined,
    select: {
      id: true,
      status: true,
      createdAt: true,
      assignments: {
        select: { status: true, shift: { select: { endsAt: true } } },
      },
    },
  });

  const map = new Map<string, Segment>();
  for (const v of volunteers) {
    const completed = v.assignments.filter((a) => a.status === "completed");
    const lastCompletedAt = completed.reduce<Date | null>((latest, a) => {
      const end = a.shift.endsAt;
      if (!latest || end > latest) return end;
      return latest;
    }, null);
    const everShifted = v.assignments.some((a) =>
      ["registered", "confirmed", "pending_approval", "completed", "no_show"].includes(
        a.status,
      ),
    );
    map.set(
      v.id,
      classifyVolunteer({
        status: v.status,
        createdAt: v.createdAt,
        lastCompletedAt,
        everShifted,
      }),
    );
  }
  return map;
}

export async function segmentCounts() {
  const map = await volunteerSegmentMap();
  const counts: Record<Segment, number> = {
    new: 0,
    hot_lead: 0,
    active: 0,
    lapsed: 0,
    paused: 0,
    blocked: 0,
  };
  for (const segment of map.values()) {
    counts[segment] += 1;
  }
  return { counts, total: map.size };
}

export async function fillAndNoShowRates() {
  const published = await prisma.shift.findMany({
    where: { status: { in: ["published", "closed"] } },
    include: { roleCaps: true, assignments: true },
  });
  let capacity = 0;
  let filled = 0;
  let completed = 0;
  let noShows = 0;
  for (const shift of published) {
    for (const cap of shift.roleCaps) {
      capacity += cap.capacity;
      filled += shift.assignments.filter(
        (a) =>
          a.roleSlug === cap.roleSlug &&
          ["registered", "confirmed", "pending_approval", "completed"].includes(a.status),
      ).length;
    }
    completed += shift.assignments.filter((a) => a.status === "completed").length;
    noShows += shift.assignments.filter((a) => a.status === "no_show").length;
  }
  const denom = completed + noShows;
  return {
    fillRate: capacity === 0 ? 0 : filled / capacity,
    noShowRate: denom === 0 ? 0 : noShows / denom,
    capacity,
    filled,
    completed,
    noShows,
  };
}
