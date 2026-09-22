"use server";

import { revalidatePath } from "next/cache";
import { logEmail } from "@/lib/audit";
import { formatInZone } from "@/lib/datetime";
import { cancelAssignment, signupForShift } from "@/lib/scheduling";
import { requireVolunteer, type ActionState } from "@/app/actions/auth";

export async function signupAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await requireVolunteer();
  const shiftId = String(formData.get("shiftId") ?? "");
  const roleSlug = String(formData.get("roleSlug") ?? "");
  if (!shiftId || !roleSlug) {
    return { error: "Pick a role on this shift." };
  }

  const result = await signupForShift({
    volunteerId: session.id,
    shiftId,
    roleSlug,
    source: "portal",
  });

  if (!result.ok) return { error: result.error };

  const { assignment, shift, volunteer } = result;
  const when = `${formatInZone(shift.startsAt, shift.timezone)} – ${formatInZone(shift.endsAt, shift.timezone)}`;
  if (assignment.status === "waitlisted") {
    await logEmail({
      toEmail: volunteer.email,
      kind: "waitlist",
      subject: `Waitlisted: ${shift.title}`,
      body: `The ${roleSlug.replace("_", " ")} seats on ${shift.title} (${when}) are full. You are on the waitlist in signup order. If a seat opens, Hub will move you to registered.`,
    });
  } else if (assignment.status === "pending_approval") {
    await logEmail({
      toEmail: volunteer.email,
      kind: "pending_approval",
      subject: `Pending staff approval: ${shift.title}`,
      body: `Your event hosting request for ${shift.title} (${when}) is waiting on staff approval.`,
    });
  } else {
    await logEmail({
      toEmail: volunteer.email,
      kind: "signup_confirm",
      subject: `You're registered: ${shift.title}`,
      body: `You are registered for ${shift.title} at ${shift.locationName} (${when}). Confirmation email is logged in this beta and not sent yet. Download the calendar invite from My shifts.`,
    });
  }

  revalidatePath("/shifts");
  revalidatePath(`/shifts/${shiftId}`);
  revalidatePath("/my-shifts");
  revalidatePath("/dashboard");
  return {
    success:
      assignment.status === "waitlisted"
        ? "This role is full. You are on the waitlist."
        : assignment.status === "pending_approval"
          ? "Requested. Staff will approve the host seat."
          : "You're registered. A confirmation is queued (not emailed in this beta).",
  };
}

export async function cancelSignupAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await requireVolunteer();
  const assignmentId = String(formData.get("assignmentId") ?? "");
  const result = await cancelAssignment({
    assignmentId,
    actor: { kind: "volunteer", id: session.id },
  });
  if (!result.ok) return { error: result.error };
  revalidatePath("/my-shifts");
  revalidatePath("/dashboard");
  revalidatePath("/shifts");
  return { success: "Shift canceled. If someone was waitlisted, they were moved into the seat." };
}

export async function overrideHoursAction() {
  return { error: "Staff change hours from the attendance desk." };
}
