"use server";

import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { DOCUMENT_KINDS, type DocumentKind } from "@/lib/constants";
import { requireVolunteer, type ActionState } from "@/app/actions/auth";
import { logAudit } from "@/lib/audit";

const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
  "text/markdown",
]);

export async function uploadDocument(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await requireVolunteer();
  const kind = String(formData.get("kind") ?? "") as DocumentKind;
  if (!DOCUMENT_KINDS.includes(kind)) {
    return { error: "Choose resume, CV, or bio." };
  }
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { error: "Choose a file to upload." };
  }
  if (file.size > MAX_BYTES) {
    return { error: "File must be 5 MB or smaller." };
  }
  const contentType = file.type || "application/octet-stream";
  if (file.type && !ALLOWED.has(file.type)) {
    return { error: "Upload a PDF, Word, or plain-text file." };
  }

  const id = crypto.randomUUID();
  const safeName = file.name.replace(/[^\w.\-]+/g, "_").slice(0, 80) || "document";
  const dir = path.join(process.cwd(), "uploads", session.id);
  await mkdir(dir, { recursive: true });
  const storageKey = path.join(session.id, `${id}-${safeName}`);
  const dest = path.join(process.cwd(), "uploads", storageKey);
  await writeFile(dest, Buffer.from(await file.arrayBuffer()));

  await prisma.document.create({
    data: {
      id,
      volunteerId: session.id,
      kind,
      storageKey,
      filename: file.name.slice(0, 120),
      contentType,
    },
  });

  await logAudit({
    action: "volunteer.document.upload",
    volunteerId: session.id,
    meta: { kind, filename: file.name },
  });
  revalidatePath("/documents");
  revalidatePath("/dashboard");
  return { success: "Document saved." };
}

export async function deleteDocument(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await requireVolunteer();
  const id = String(formData.get("id") ?? "");
  const doc = await prisma.document.findUnique({ where: { id } });
  if (!doc || doc.volunteerId !== session.id) {
    return { error: "Document not found." };
  }
  await prisma.document.delete({ where: { id } });
  revalidatePath("/documents");
  return { success: "Document removed." };
}
