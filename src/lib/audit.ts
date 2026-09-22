import { prisma } from "@/lib/db";

export async function logAudit(input: {
  action: string;
  actorStaffId?: string | null;
  volunteerId?: string | null;
  meta?: Record<string, unknown>;
}) {
  await prisma.auditEvent.create({
    data: {
      action: input.action,
      actorStaffId: input.actorStaffId ?? null,
      volunteerId: input.volunteerId ?? null,
      meta: input.meta ? JSON.stringify(input.meta) : null,
    },
  });
}

export async function logEmail(input: {
  toEmail: string;
  subject: string;
  body: string;
  kind: string;
}) {
  await prisma.outboundEmail.create({
    data: {
      toEmail: input.toEmail,
      subject: input.subject,
      body: input.body,
      kind: input.kind,
      status: "logged_not_sent",
    },
  });
}
