"use server";

import { z } from "zod";
import { prisma } from "@/lib/db";
import {
  clearSession,
  getSession,
  hashPassword,
  isStaff,
  setSession,
  verifyPassword,
  type Session,
} from "@/lib/auth";
import { logAudit } from "@/lib/audit";
import { ROLE_SLUGS, type StaffRole } from "@/lib/constants";
import { digitsOnly } from "@/lib/phone";
import { isSafeHubPath, redirectToHub } from "@/lib/redirect";

export type ActionState = { error?: string; success?: string };

const registerSchema = z.object({
  name: z.string().trim().min(2, "Enter your name.").max(80),
  email: z.string().trim().email("Enter a valid email."),
  password: z.string().min(8, "Password must be at least 8 characters."),
  phone: z.string().trim().optional(),
  zip: z.string().trim().max(10).optional(),
});

export async function requireVolunteer(): Promise<Extract<Session, { kind: "volunteer" }>> {
  const session = await getSession();
  if (!session || session.kind !== "volunteer") {
    await redirectToHub("/login");
  }
  return session as Extract<Session, { kind: "volunteer" }>;
}

export async function requireStaff(): Promise<Extract<Session, { kind: "staff" }>> {
  const session = await getSession();
  if (!session) await redirectToHub("/login?next=/admin");
  if (!isStaff(session)) await redirectToHub("/admin/denied");
  return session as Extract<Session, { kind: "staff" }>;
}

export async function registerVolunteer(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = registerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    phone: formData.get("phone") || undefined,
    zip: formData.get("zip") || undefined,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Check the form and try again." };
  }

  const email = parsed.data.email.toLowerCase();
  const phone = parsed.data.phone ? digitsOnly(parsed.data.phone) : "";

  const existingEmail = await prisma.volunteer.findUnique({ where: { email } });
  if (existingEmail) {
    return { error: "An account with this email already exists. Log in instead." };
  }
  const staffEmail = await prisma.staffUser.findUnique({ where: { email } });
  if (staffEmail) {
    return { error: "Use the staff login for this email." };
  }
  if (phone) {
    const existingPhone = await prisma.volunteer.findFirst({ where: { phone } });
    if (existingPhone) {
      return { error: "An account with this phone number already exists. Log in instead." };
    }
  }

  const prefs = ROLE_SLUGS.filter((slug) => formData.get(`role_${slug}`) === "on");

  const volunteer = await prisma.volunteer.create({
    data: {
      id: `vol_${crypto.randomUUID()}`,
      email,
      passwordHash: await hashPassword(parsed.data.password),
      name: parsed.data.name,
      phone: phone || null,
      zip: parsed.data.zip || null,
      smsTransactionalOptIn: formData.get("sms_transactional") === "on",
      rolePrefs: {
        create: prefs.map((slug, index) => ({ roleSlug: slug, priority: index + 1 })),
      },
    },
  });

  await logAudit({
    action: "volunteer.register",
    volunteerId: volunteer.id,
    meta: { email },
  });

  await setSession({
    kind: "volunteer",
    id: volunteer.id,
    email: volunteer.email,
    name: volunteer.name,
  });

  await redirectToHub("/dashboard");
  return {};
}

export async function loginAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") ?? "");
  const next = String(formData.get("next") ?? "");

  if (!email || !password) {
    return { error: "Enter email and password." };
  }

  const staff = await prisma.staffUser.findUnique({ where: { email } });
  if (staff && (await verifyPassword(password, staff.passwordHash))) {
    await setSession({
      kind: "staff",
      id: staff.id,
      email: staff.email,
      name: staff.name,
      role: staff.role as StaffRole,
    });
    await logAudit({ action: "staff.login", actorStaffId: staff.id });
    const dest = next.startsWith("/admin") && isSafeHubPath(next) ? next : "/admin";
    await redirectToHub(dest);
    return {};
  }

  const volunteer = await prisma.volunteer.findUnique({ where: { email } });
  if (volunteer && (await verifyPassword(password, volunteer.passwordHash))) {
    if (volunteer.status === "blocked") {
      return { error: "This account is blocked. Email the campaign if that is a mistake." };
    }
    await setSession({
      kind: "volunteer",
      id: volunteer.id,
      email: volunteer.email,
      name: volunteer.name,
    });
    await logAudit({ action: "volunteer.login", volunteerId: volunteer.id });
    if (isSafeHubPath(next) && !next.startsWith("/admin")) {
      await redirectToHub(next);
    }
    await redirectToHub("/dashboard");
  }

  return { error: "Email or password did not match." };
}

export async function logoutAction() {
  await clearSession();
  await redirectToHub("/");
}
