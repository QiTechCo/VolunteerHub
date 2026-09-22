import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { shiftIcs } from "@/lib/ics";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Log in required." }, { status: 401 });
  }
  const { id } = await context.params;
  const shift = await prisma.shift.findUnique({ where: { id } });
  if (!shift) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }
  if (session.kind === "volunteer") {
    const assignment = await prisma.assignment.findFirst({
      where: {
        shiftId: id,
        volunteerId: session.id,
        status: { in: ["registered", "confirmed", "pending_approval", "waitlisted"] },
      },
    });
    if (!assignment) {
      return NextResponse.json({ error: "Not on this shift." }, { status: 403 });
    }
  }
  const body = shiftIcs(shift);
  return new NextResponse(body, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="${shift.id}.ics"`,
    },
  });
}
