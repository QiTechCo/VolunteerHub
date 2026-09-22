"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { digitsOnly } from "@/lib/phone";
import { ROLE_SLUGS, WEEKDAYS } from "@/lib/constants";
import { requireVolunteer, type ActionState } from "@/app/actions/auth";
import { logAudit } from "@/lib/audit";

const profileSchema = z.object({
  name: z.string().trim().min(2).max(80),
  phone: z.string().trim().optional(),
  zip: z.string().trim().max(10).optional(),
  address: z.string().trim().max(200).optional(),
  maxShiftsPerWeek: z.string().optional(),
});

export async function updateProfile(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await requireVolunteer();
  const parsed = profileSchema.safeParse({
    name: formData.get("name"),
    phone: formData.get("phone") || undefined,
    zip: formData.get("zip") || undefined,
    address: formData.get("address") || undefined,
    maxShiftsPerWeek: formData.get("maxShiftsPerWeek") || undefined,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Check the form and try again." };
  }

  const phone = parsed.data.phone ? digitsOnly(parsed.data.phone) : "";
  if (phone) {
    const clash = await prisma.volunteer.findFirst({
      where: { phone, NOT: { id: session.id } },
    });
    if (clash) {
      return { error: "That phone number is already on another account." };
    }
  }

  const maxRaw = parsed.data.maxShiftsPerWeek;
  const maxShiftsPerWeek = maxRaw ? Number(maxRaw) : null;
  if (maxRaw && (Number.isNaN(maxShiftsPerWeek) || (maxShiftsPerWeek ?? 0) < 1)) {
    return { error: "Max shifts per week must be a positive number, or blank." };
  }

  const prefs = ROLE_SLUGS.filter((slug) => formData.get(`role_${slug}`) === "on");

  await prisma.$transaction(async (tx) => {
    await tx.volunteer.update({
      where: { id: session.id },
      data: {
        name: parsed.data.name,
        phone: phone || null,
        zip: parsed.data.zip || null,
        address: parsed.data.address || null,
        willingToHost: formData.get("willingToHost") === "on",
        smsTransactionalOptIn: formData.get("sms_transactional") === "on",
        maxShiftsPerWeek,
      },
    });
    await tx.volunteerRolePref.deleteMany({ where: { volunteerId: session.id } });
    if (prefs.length) {
      await tx.volunteerRolePref.createMany({
        data: prefs.map((slug, index) => ({
          volunteerId: session.id,
          roleSlug: slug,
          priority: index + 1,
        })),
      });
    }
    await tx.availability.deleteMany({ where: { volunteerId: session.id } });
    const windows = [];
    for (let weekday = 0; weekday < WEEKDAYS.length; weekday += 1) {
      if (formData.get(`avail_${weekday}`) !== "on") continue;
      const startLocal = String(formData.get(`avail_start_${weekday}`) || "09:00");
      const endLocal = String(formData.get(`avail_end_${weekday}`) || "17:00");
      windows.push({
        volunteerId: session.id,
        weekday,
        startLocal,
        endLocal,
      });
    }
    if (windows.length) {
      await tx.availability.createMany({ data: windows });
    }
  });

  await logAudit({ action: "volunteer.profile.update", volunteerId: session.id });
  revalidatePath("/profile");
  revalidatePath("/dashboard");
  return { success: "Profile saved." };
}

export async function saveShiftFeedback(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await requireVolunteer();
  const assignmentId = String(formData.get("assignmentId") ?? "");
  const note = String(formData.get("feedbackNote") ?? "").trim();
  if (!assignmentId) return { error: "Missing assignment." };
  const assignment = await prisma.assignment.findUnique({ where: { id: assignmentId } });
  if (!assignment || assignment.volunteerId !== session.id) {
    return { error: "Assignment not found." };
  }
  if (assignment.status !== "completed") {
    return { error: "Feedback opens after staff mark the shift complete." };
  }
  await prisma.assignment.update({
    where: { id: assignmentId },
    data: { feedbackNote: note.slice(0, 1000) },
  });
  revalidatePath("/my-shifts");
  return { success: "Thank you. Staff can read this from your assignment." };
}
