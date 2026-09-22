import { NextResponse } from "next/server";
import { getSession, isStaff } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { formatInZone } from "@/lib/datetime";
import { notifyVolunteer } from "@/lib/push";

/** Staff-triggered stand-in for a morning-of cron. */
export async function POST() {
  const session = await getSession();
  if (!session || !isStaff(session)) {
    return NextResponse.json({ error: "Staff only." }, { status: 403 });
  }
  const start = new Date();
  const end = new Date(start.getTime() + 36 * 60 * 60 * 1000);
  const assignments = await prisma.assignment.findMany({
    where: {
      status: { in: ["registered", "confirmed"] },
      shift: { status: "published", startsAt: { gte: start, lte: end } },
    },
    include: { shift: true, volunteer: true, role: true },
  });
  let sent = 0;
  for (const assignment of assignments) {
    const result = await notifyVolunteer(assignment.volunteerId, {
      title: `Shift reminder: ${assignment.shift.title}`,
      body: `${assignment.role.title} · ${formatInZone(assignment.shift.startsAt, assignment.shift.timezone)} at ${assignment.shift.locationName}.`,
      url: `/shifts/${assignment.shift.id}`,
    });
    sent += result.sent;
  }
  return NextResponse.json({ ok: true, volunteers: assignments.length, sent });
}
