"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { canEditSchedule, canManagePeople } from "@/lib/auth";
import { ROLE_SLUGS } from "@/lib/constants";
import { parseDatetimeLocal } from "@/lib/datetime";
import { logAudit } from "@/lib/audit";
import { cancelAssignment, setAttendance, signupForShift } from "@/lib/scheduling";
import { requireStaff, type ActionState } from "@/app/actions/auth";
import { redirectToHub } from "@/lib/redirect";

function parseCaps(formData: FormData) {
  const caps: { roleSlug: string; capacity: number }[] = [];
  for (const slug of ROLE_SLUGS) {
    if (formData.get(`role_${slug}`) !== "on") continue;
    const cap = Number(formData.get(`cap_${slug}`) || 0);
    if (!Number.isFinite(cap) || cap < 1) continue;
    caps.push({ roleSlug: slug, capacity: Math.floor(cap) });
  }
  return caps;
}

export async function saveShiftAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const staff = await requireStaff();
  if (!canEditSchedule(staff.role)) {
    return { error: "Your staff role cannot edit the schedule." };
  }

  const id = String(formData.get("id") || "") || `shift_${crypto.randomUUID()}`;
  const title = String(formData.get("title") ?? "").trim();
  const locationName = String(formData.get("locationName") ?? "").trim();
  const startsAtRaw = String(formData.get("startsAt") ?? "");
  const endsAtRaw = String(formData.get("endsAt") ?? "");
  const timezone = String(formData.get("timezone") || "America/New_York");
  const visibility = String(formData.get("visibility") || "public");
  const status = String(formData.get("status") || "draft");
  const whatToBring = String(formData.get("whatToBring") ?? "").trim();
  const notes = String(formData.get("notes") ?? "").trim();
  const closesRaw = String(formData.get("registrationClosesAt") ?? "");
  const caps = parseCaps(formData);

  if (!title || !locationName || !startsAtRaw || !endsAtRaw) {
    return { error: "Title, location, start, and end are required." };
  }
  if (caps.length === 0) {
    return { error: "Add at least one role with a seat count." };
  }

  const startsAt = parseDatetimeLocal(startsAtRaw, timezone);
  const endsAt = parseDatetimeLocal(endsAtRaw, timezone);
  if (endsAt <= startsAt) {
    return { error: "End must be after start." };
  }
  const registrationClosesAt = closesRaw ? parseDatetimeLocal(closesRaw, timezone) : null;

  const existing = await prisma.shift.findUnique({ where: { id } });
  await prisma.$transaction(async (tx) => {
    if (existing) {
      await tx.shift.update({
        where: { id },
        data: {
          title,
          locationName,
          startsAt,
          endsAt,
          timezone,
          visibility,
          status,
          whatToBring: whatToBring || null,
          notes: notes || null,
          registrationClosesAt,
        },
      });
      await tx.shiftRoleCap.deleteMany({ where: { shiftId: id } });
    } else {
      await tx.shift.create({
        data: {
          id,
          title,
          locationName,
          startsAt,
          endsAt,
          timezone,
          visibility,
          status,
          whatToBring: whatToBring || null,
          notes: notes || null,
          registrationClosesAt,
        },
      });
    }
    await tx.shiftRoleCap.createMany({
      data: caps.map((cap) => ({ ...cap, shiftId: id })),
    });
  });

  await logAudit({
    action: existing ? "shift.update" : "shift.create",
    actorStaffId: staff.id,
    meta: { shiftId: id, status },
  });
  revalidatePath("/admin/schedule");
  revalidatePath(`/admin/schedule/${id}`);
  revalidatePath("/shifts");
  await redirectToHub(`/admin/schedule/${id}`);
  return {};
}

export async function setShiftStatusAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const staff = await requireStaff();
  if (!canEditSchedule(staff.role)) {
    return { error: "Your staff role cannot edit the schedule." };
  }
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "");
  if (!["draft", "published", "closed", "canceled"].includes(status)) {
    return { error: "Unknown status." };
  }
  await prisma.shift.update({ where: { id }, data: { status } });
  await logAudit({
    action: "shift.status",
    actorStaffId: staff.id,
    meta: { shiftId: id, status },
  });
  revalidatePath("/admin/schedule");
  revalidatePath(`/admin/schedule/${id}`);
  revalidatePath("/shifts");
  return { success: `Shift marked ${status}.` };
}

export async function attendanceAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const staff = await requireStaff();
  const assignmentId = String(formData.get("assignmentId") ?? "");
  const status = String(formData.get("status") ?? "") as
    | "registered"
    | "confirmed"
    | "completed"
    | "no_show"
    | "canceled";
  const result = await setAttendance({ assignmentId, status, staffId: staff.id });
  if (!result.ok) return { error: result.error };
  revalidatePath("/admin/attendance");
  revalidatePath("/hours");
  revalidatePath("/my-shifts");
  return { success: "Attendance saved." };
}

export async function staffAssignAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const staff = await requireStaff();
  if (!canEditSchedule(staff.role)) {
    return { error: "Your staff role cannot assign shifts." };
  }
  const volunteerId = String(formData.get("volunteerId") ?? "");
  const shiftId = String(formData.get("shiftId") ?? "");
  const roleSlug = String(formData.get("roleSlug") ?? "");
  const result = await signupForShift({
    volunteerId,
    shiftId,
    roleSlug,
    source: "staff",
  });
  if (!result.ok) return { error: result.error };
  revalidatePath(`/admin/schedule/${shiftId}`);
  revalidatePath("/admin/attendance");
  return { success: "Volunteer assigned." };
}

export async function staffCancelAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const staff = await requireStaff();
  const assignmentId = String(formData.get("assignmentId") ?? "");
  const result = await cancelAssignment({
    assignmentId,
    actor: { kind: "staff", id: staff.id },
  });
  if (!result.ok) return { error: result.error };
  revalidatePath("/admin/attendance");
  return { success: "Assignment canceled." };
}

export async function addStaffNoteAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const staff = await requireStaff();
  if (!canManagePeople(staff.role)) {
    return { error: "Your staff role cannot add notes." };
  }
  const volunteerId = String(formData.get("volunteerId") ?? "");
  const body = String(formData.get("body") ?? "").trim();
  if (!body) return { error: "Write a note." };
  await prisma.staffNote.create({
    data: { volunteerId, staffId: staff.id, body: body.slice(0, 2000) },
  });
  revalidatePath(`/admin/people/${volunteerId}`);
  return { success: "Note saved." };
}

export async function setVolunteerStatusAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const staff = await requireStaff();
  if (!canManagePeople(staff.role)) {
    return { error: "Your staff role cannot change volunteer status." };
  }
  const volunteerId = String(formData.get("volunteerId") ?? "");
  const status = String(formData.get("status") ?? "");
  if (!["active", "paused", "blocked"].includes(status)) {
    return { error: "Unknown status." };
  }
  await prisma.volunteer.update({ where: { id: volunteerId }, data: { status } });
  await logAudit({
    action: "volunteer.status",
    actorStaffId: staff.id,
    volunteerId,
    meta: { status },
  });
  revalidatePath(`/admin/people/${volunteerId}`);
  revalidatePath("/admin/people");
  return { success: "Status updated." };
}

export async function updateRoleCatalogAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const staff = await requireStaff();
  if (!canManagePeople(staff.role)) {
    return { error: "Your staff role cannot edit roles." };
  }
  const slug = String(formData.get("slug") ?? "");
  const trustLevel = String(formData.get("trustLevel") ?? "low");
  const requiresTraining = formData.get("requiresTraining") === "on";
  const description = String(formData.get("description") ?? "").trim();
  await prisma.roleCatalog.update({
    where: { slug },
    data: { trustLevel, requiresTraining, description },
  });
  revalidatePath("/admin/roles");
  return { success: "Role saved." };
}

export async function overrideHoursAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const staff = await requireStaff();
  const volunteerId = String(formData.get("volunteerId") ?? "");
  const minutes = Number(formData.get("minutes") ?? 0);
  const note = String(formData.get("staffNote") ?? "").trim();
  if (!volunteerId || !Number.isFinite(minutes) || minutes <= 0) {
    return { error: "Enter minutes greater than zero." };
  }
  await prisma.hoursEntry.create({
    data: {
      volunteerId,
      minutes: Math.round(minutes),
      source: "manual",
      status: "confirmed",
      staffNote: note || `Manual entry by ${staff.email}`,
    },
  });
  revalidatePath(`/admin/people/${volunteerId}`);
  revalidatePath("/hours");
  return { success: "Hours added." };
}

export async function setTrainingAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const staff = await requireStaff();
  const volunteerId = String(formData.get("volunteerId") ?? "");
  const roleSlug = String(formData.get("roleSlug") ?? "");
  const enabled = formData.get("enabled") === "on";
  if (enabled) {
    await prisma.training.upsert({
      where: { volunteerId_roleSlug: { volunteerId, roleSlug } },
      create: { volunteerId, roleSlug, completedAt: new Date() },
      update: { completedAt: new Date() },
    });
  } else {
    await prisma.training.deleteMany({ where: { volunteerId, roleSlug } });
  }
  revalidatePath(`/admin/people/${volunteerId}`);
  await logAudit({
    action: "volunteer.training",
    actorStaffId: staff.id,
    volunteerId,
    meta: { roleSlug, enabled },
  });
  return { success: "Training flag updated." };
}
