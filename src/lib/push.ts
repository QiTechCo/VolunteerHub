import { prisma } from "@/lib/db";
import { BASE_PATH } from "@/lib/constants";
import { hubPath } from "@/lib/redirect";
import { logAudit } from "@/lib/audit";

export type PushPayload = {
  title: string;
  body: string;
  url: string;
};

export function vapidPublicKey() {
  return process.env.VAPID_PUBLIC_KEY?.trim() || "";
}

export function vapidConfigured() {
  return Boolean(vapidPublicKey() && process.env.VAPID_PRIVATE_KEY?.trim());
}

type WebPushClient = {
  setVapidDetails: (subject: string, publicKey: string, privateKey: string) => void;
  sendNotification: (
    subscription: { endpoint: string; keys: { p256dh: string; auth: string } },
    payload: string,
    options?: { TTL?: number },
  ) => Promise<unknown>;
};

async function webpush(): Promise<WebPushClient | null> {
  if (!vapidConfigured()) return null;
  const imported = (await import("web-push")) as { default?: WebPushClient } & WebPushClient;
  const client = imported.default ?? imported;
  client.setVapidDetails(
    process.env.VAPID_SUBJECT?.trim() || "mailto:Dimple@DimpleAjmera.com",
    vapidPublicKey(),
    process.env.VAPID_PRIVATE_KEY!.trim(),
  );
  return client;
}

function absoluteHubUrl(path: string) {
  return hubPath(path.startsWith("/") ? path : `/${path}`);
}

export async function notifyVolunteer(volunteerId: string, payload: PushPayload) {
  try {
    const subs = await prisma.pushSubscription.findMany({ where: { volunteerId } });
    return await deliver(subs, payload, { volunteerId });
  } catch {
    return { sent: 0, mock: !vapidConfigured() };
  }
}

export async function notifyStaff(staffUserId: string, payload: PushPayload) {
  try {
    const subs = await prisma.pushSubscription.findMany({ where: { staffUserId } });
    return await deliver(subs, payload, { staffUserId });
  } catch {
    return { sent: 0, mock: !vapidConfigured() };
  }
}

async function deliver(
  subs: { id: string; endpoint: string; p256dh: string; auth: string }[],
  payload: PushPayload,
  actor: { volunteerId?: string; staffUserId?: string },
): Promise<{ sent: number; mock: boolean }> {
  const body = JSON.stringify({
    title: payload.title,
    body: payload.body,
    url: absoluteHubUrl(payload.url || "/"),
  });

  if (subs.length === 0) {
    await logAudit({
      action: "push.skipped_no_subscription",
      volunteerId: actor.volunteerId,
      actorStaffId: actor.staffUserId,
      meta: { title: payload.title },
    });
    return { sent: 0, mock: !vapidConfigured() };
  }

  const client = await webpush();
  if (!client) {
    await logAudit({
      action: "push.logged_mock",
      volunteerId: actor.volunteerId,
      actorStaffId: actor.staffUserId,
      meta: { title: payload.title, body: payload.body, url: payload.url, devices: subs.length },
    });
    return { sent: 0, mock: true };
  }

  let sent = 0;
  for (const sub of subs) {
    try {
      await client.sendNotification(
        { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
        body,
        { TTL: 60 * 60 * 12 },
      );
      sent += 1;
    } catch (error) {
      const status = (error as { statusCode?: number }).statusCode;
      if (status === 404 || status === 410) {
        await prisma.pushSubscription.delete({ where: { id: sub.id } }).catch(() => undefined);
      }
    }
  }
  await logAudit({
    action: "push.sent",
    volunteerId: actor.volunteerId,
    actorStaffId: actor.staffUserId,
    meta: { title: payload.title, sent, devices: subs.length },
  });
  return { sent, mock: false };
}

export function pushConfigResponse() {
  return {
    publicKey: vapidPublicKey() || null,
    mock: !vapidConfigured(),
    startUrl: `${BASE_PATH}/`,
  };
}
