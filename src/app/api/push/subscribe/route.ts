import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

type Body = {
  endpoint?: string;
  keys?: { p256dh?: string; auth?: string };
};

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Log in to save this device." }, { status: 401 });
  }
  const body = (await request.json().catch(() => ({}))) as Body;
  const endpoint = body.endpoint?.trim();
  const p256dh = body.keys?.p256dh?.trim();
  const auth = body.keys?.auth?.trim();
  if (!endpoint || !p256dh || !auth) {
    return NextResponse.json({ error: "That subscription was incomplete." }, { status: 400 });
  }
  await prisma.pushSubscription.upsert({
    where: { endpoint },
    create: {
      endpoint,
      p256dh,
      auth,
      volunteerId: session.kind === "volunteer" ? session.id : null,
      staffUserId: session.kind === "staff" ? session.id : null,
    },
    update: {
      p256dh,
      auth,
      volunteerId: session.kind === "volunteer" ? session.id : null,
      staffUserId: session.kind === "staff" ? session.id : null,
    },
  });
  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request) {
  const session = await getSession();
  const body = (await request.json().catch(() => ({}))) as { endpoint?: string };
  const endpoint = body.endpoint?.trim();
  if (!endpoint) {
    return NextResponse.json({ error: "Missing endpoint." }, { status: 400 });
  }
  const existing = await prisma.pushSubscription.findUnique({ where: { endpoint } });
  if (!existing) return NextResponse.json({ ok: true });
  if (session?.kind === "volunteer" && existing.volunteerId !== session.id) {
    return NextResponse.json({ error: "Not this device." }, { status: 403 });
  }
  if (session?.kind === "staff" && existing.staffUserId !== session.id) {
    return NextResponse.json({ error: "Not this device." }, { status: 403 });
  }
  if (!session) {
    return NextResponse.json({ error: "Log in to remove this device." }, { status: 401 });
  }
  await prisma.pushSubscription.delete({ where: { endpoint } });
  return NextResponse.json({ ok: true });
}
