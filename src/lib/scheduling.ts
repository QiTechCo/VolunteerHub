import { OCCUPYING_STATUSES } from "@/lib/constants";
import { prisma } from "@/lib/db";
import { logAudit, logEmail } from "@/lib/audit";
import { formatInZone, minutesBetween } from "@/lib/datetime";

export async function filledCount(shiftId: string, roleSlug: string) {
  return prisma.assignment.count({
    where: {
      shiftId,
      roleSlug,
      status: { in: [...OCCUPYING_STATUSES] },
    },
  });
}

export async function remainingSeats(shiftId: string, roleSlug: string) {
  const cap = await prisma.shiftRoleCap.findUnique({
    where: { shiftId_roleSlug: { shiftId, roleSlug } },
  });
  if (!cap) return 0;
  const filled = await filledCount(shiftId, roleSlug);
  return Math.max(0, cap.capacity - filled);
}

export async function signupForShift(input: {
  volunteerId: string;
  shiftId: string;
  roleSlug: string;
  source: "portal" | "staff";
}) {
  return prisma.$transaction(async (tx) => {
    const shift = await tx.shift.findUnique({
      where: { id: input.shiftId },
      include: { roleCaps: true },
    });
    if (!shift) {
      return { ok: false as const, error: "Shift not found." };
    }
    if (shift.status !== "published") {
      return { ok: false as const, error: "This shift is not open for signup." };
    }
    if (shift.registrationClosesAt && shift.registrationClosesAt < new Date()) {
      return { ok: false as const, error: "Registration for this shift has closed." };
    }
    if (shift.startsAt < new Date()) {
      return { ok: false as const, error: "This shift has already started." };
    }
    const cap = shift.roleCaps.find((c) => c.roleSlug === input.roleSlug);
    if (!cap) {
      return { ok: false as const, error: "That role is not on this shift." };
    }

    const existing = await tx.assignment.findFirst({
      where: {
        volunteerId: input.volunteerId,
        shiftId: input.shiftId,
        status: {
          in: [
            "registered",
            "waitlisted",
            "confirmed",
            "pending_approval",
            "completed",
          ],
        },
      },
    });
    if (existing) {
      return {
        ok: false as const,
        error: "You already have a spot or waitlist place on this shift.",
      };
    }

    const volunteer = await tx.volunteer.findUnique({
      where: { id: input.volunteerId },
    });
    if (!volunteer || volunteer.status === "blocked") {
      return { ok: false as const, error: "This account cannot take shifts." };
    }

    const role = await tx.roleCatalog.findUnique({
      where: { slug: input.roleSlug },
    });
    if (!role) {
      return { ok: false as const, error: "Unknown role." };
    }
    if (role.requiresTraining) {
      const training = await tx.training.findUnique({
        where: {
          volunteerId_roleSlug: {
            volunteerId: input.volunteerId,
            roleSlug: input.roleSlug,
          },
        },
      });
      if (!training) {
        return {
          ok: false as const,
          error: "This role needs a training flag from staff before signup.",
        };
      }
    }

    const filled = await tx.assignment.count({
      where: {
        shiftId: input.shiftId,
        roleSlug: input.roleSlug,
        status: { in: [...OCCUPYING_STATUSES] },
      },
    });

    const now = new Date();
    const highTrust = role.trustLevel === "high" && input.source === "portal";
    let status: string;
    if (filled >= cap.capacity) {
      status = "waitlisted";
    } else if (highTrust) {
      status = "pending_approval";
    } else {
      status = "registered";
    }

    const assignment = await tx.assignment.create({
      data: {
        volunteerId: input.volunteerId,
        shiftId: input.shiftId,
        roleSlug: input.roleSlug,
        status,
        source: input.source,
        waitlistedAt: status === "waitlisted" ? now : null,
        registeredAt: status === "waitlisted" ? null : now,
      },
    });

    return { ok: true as const, assignment, shift, volunteer };
  });
}

export async function cancelAssignment(input: {
  assignmentId: string;
  actor: { kind: "volunteer"; id: string } | { kind: "staff"; id: string };
}) {
  const result = await prisma.$transaction(async (tx) => {
    const assignment = await tx.assignment.findUnique({
      where: { id: input.assignmentId },
      include: { shift: true, volunteer: true },
    });
    if (!assignment) {
      return { ok: false as const, error: "Assignment not found." };
    }
    if (input.actor.kind === "volunteer" && assignment.volunteerId !== input.actor.id) {
      return { ok: false as const, error: "You can only cancel your own shifts." };
    }
    if (
      assignment.status === "canceled" ||
      assignment.status === "completed" ||
      assignment.status === "no_show"
    ) {
      return { ok: false as const, error: "This assignment is already closed." };
    }

    await tx.assignment.update({
      where: { id: assignment.id },
      data: { status: "canceled", canceledAt: new Date() },
    });

    let promotedId: string | null = null;
    if (assignment.status !== "waitlisted") {
      const next = await tx.assignment.findFirst({
        where: {
          shiftId: assignment.shiftId,
          roleSlug: assignment.roleSlug,
          status: "waitlisted",
        },
        orderBy: { waitlistedAt: "asc" },
      });
      if (next) {
        await tx.assignment.update({
          where: { id: next.id },
          data: {
            status: "registered",
            registeredAt: new Date(),
          },
        });
        promotedId = next.id;
      }
    }

    return { ok: true as const, assignment, promotedId };
  });

  if (result.ok && result.promotedId) {
    const promoted = await prisma.assignment.findUnique({
      where: { id: result.promotedId },
      include: { volunteer: true, shift: true },
    });
    if (promoted) {
      await logEmail({
        toEmail: promoted.volunteer.email,
        kind: "waitlist_promoted",
        subject: `A seat opened: ${promoted.shift.title}`,
        body: `A waitlisted seat opened on ${promoted.shift.title} (${formatInZone(promoted.shift.startsAt, promoted.shift.timezone)}). You are now registered.`,
      });
    }
  }

  return result;
}

export async function setAttendance(input: {
  assignmentId: string;
  status: "registered" | "confirmed" | "completed" | "no_show" | "canceled";
  staffId: string;
}) {
  const assignment = await prisma.assignment.findUnique({
    where: { id: input.assignmentId },
    include: { shift: true, volunteer: true, hoursEntries: true },
  });
  if (!assignment) {
    return { ok: false as const, error: "Assignment not found." };
  }

  const previous = assignment.status;
  await prisma.assignment.update({
    where: { id: assignment.id },
    data: {
      status: input.status,
      canceledAt: input.status === "canceled" ? new Date() : assignment.canceledAt,
    },
  });

  if (input.status === "completed") {
    const minutes = minutesBetween(assignment.shift.startsAt, assignment.shift.endsAt);
    const existing = assignment.hoursEntries[0];
    if (existing) {
      await prisma.hoursEntry.update({
        where: { id: existing.id },
        data: { minutes, status: "confirmed", source: "check_in" },
      });
    } else {
      await prisma.hoursEntry.create({
        data: {
          volunteerId: assignment.volunteerId,
          assignmentId: assignment.id,
          minutes,
          source: "shift_length",
          status: "confirmed",
        },
      });
    }
  }

  if (input.status === "canceled" && previous !== "waitlisted" && previous !== "canceled") {
    const next = await prisma.assignment.findFirst({
      where: {
        shiftId: assignment.shiftId,
        roleSlug: assignment.roleSlug,
        status: "waitlisted",
      },
      orderBy: { waitlistedAt: "asc" },
    });
    if (next) {
      await prisma.assignment.update({
        where: { id: next.id },
        data: { status: "registered", registeredAt: new Date() },
      });
    }
  }

  await logAudit({
    action: "attendance.set",
    actorStaffId: input.staffId,
    volunteerId: assignment.volunteerId,
    meta: { assignmentId: assignment.id, status: input.status, previous },
  });

  return { ok: true as const };
}

export async function shiftCapacitySummary(shiftId: string) {
  const caps = await prisma.shiftRoleCap.findMany({
    where: { shiftId },
    include: { role: true },
    orderBy: { role: { sortOrder: "asc" } },
  });
  const rows = await Promise.all(
    caps.map(async (cap) => {
      const filled = await filledCount(shiftId, cap.roleSlug);
      const waitlisted = await prisma.assignment.count({
        where: { shiftId, roleSlug: cap.roleSlug, status: "waitlisted" },
      });
      return {
        roleSlug: cap.roleSlug,
        title: cap.role.title,
        capacity: cap.capacity,
        filled,
        remaining: Math.max(0, cap.capacity - filled),
        waitlisted,
      };
    }),
  );
  return rows;
}
