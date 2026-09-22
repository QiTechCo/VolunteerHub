import { readFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { getSession, isStaff } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Log in required." }, { status: 401 });
  }
  const { id } = await context.params;
  const doc = await prisma.document.findUnique({ where: { id } });
  if (!doc) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }
  const allowed =
    (session.kind === "volunteer" && session.id === doc.volunteerId) || isStaff(session);
  if (!allowed) {
    return NextResponse.json({ error: "Not allowed." }, { status: 403 });
  }
  const filePath = path.join(process.cwd(), "uploads", doc.storageKey);
  try {
    const data = await readFile(filePath);
    return new NextResponse(new Uint8Array(data), {
      headers: {
        "Content-Type": doc.contentType,
        "Content-Disposition": `attachment; filename="${doc.filename.replace(/"/g, "")}"`,
      },
    });
  } catch {
    return NextResponse.json({ error: "File missing on disk." }, { status: 404 });
  }
}
