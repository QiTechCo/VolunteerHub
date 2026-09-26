export const SW_PATH = "/volunteer/sw.js";
export const SW_SCOPE = "/volunteer";

export function isStandaloneDisplay() {
  if (typeof window === "undefined") return false;
  const media = window.matchMedia("(display-mode: standalone)").matches;
  const ios = "standalone" in window.navigator && Boolean((window.navigator as Navigator & { standalone?: boolean }).standalone);
  return media || ios;
}

export function isIosDevice() {
  if (typeof window === "undefined") return false;
  return /iphone|ipad|ipod/i.test(window.navigator.userAgent);
}

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  const output = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i += 1) output[i] = raw.charCodeAt(i);
  return output;
}

export async function registerHubServiceWorker() {
  if (!("serviceWorker" in navigator)) return null;

  if (
    process.env.NODE_ENV !== "production" ||
    (typeof window !== "undefined" &&
      (window.location.hostname === "localhost" ||
        window.location.hostname === "127.0.0.1"))
  ) {
    try {
      const registrations = await navigator.serviceWorker.getRegistrations();
      for (const reg of registrations) {
        await reg.unregister();
      }
      if ("caches" in window) {
        const keys = await caches.keys();
        for (const key of keys) {
          await caches.delete(key);
        }
      }
    } catch {
      // ignore
    }
    return null;
  }

  return navigator.serviceWorker.register(SW_PATH, {
    scope: SW_SCOPE,
    updateViaCache: "none",
  });
}

export async function localShowNotification(title: string, body: string, url = "/volunteer/") {
  const ready = "serviceWorker" in navigator ? await navigator.serviceWorker.ready.catch(() => null) : null;
  if (ready) {
    ready.active?.postMessage({ type: "SHOW_NOTIFICATION", title, body, url });
    return "service-worker";
  }
  if (typeof Notification !== "undefined" && Notification.permission === "granted") {
    new Notification(title, { body });
    return "page";
  }
  return null;
}

export async function subscribeHubPush() {
  if (!("serviceWorker" in navigator) || !("PushManager" in window) || typeof Notification === "undefined") {
    throw new Error("This browser cannot subscribe to web push.");
  }
  if (isIosDevice() && !isStandaloneDisplay()) {
    throw new Error("On iPhone, add Volunteer Hub to your Home Screen first, then turn on notifications.");
  }
  const permission = await Notification.requestPermission();
  if (permission !== "granted") {
    throw new Error("Notifications are blocked in the browser. You can turn them on later in system settings.");
  }
  const config = (await fetch("/volunteer/api/push/config").then((r) => r.json())) as {
    publicKey: string | null;
    mock: boolean;
  };
  const registration = await navigator.serviceWorker.ready;
  if (!config.publicKey || config.mock) {
    await localShowNotification(
      "Volunteer Hub is ready",
      "This device will show a local ping. Server Web Push keys are in mock mode.",
      "/volunteer/dashboard",
    );
    return { mode: "mock" as const };
  }
  try {
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(config.publicKey),
    });
    const json = subscription.toJSON();
    const res = await fetch("/volunteer/api/push/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        endpoint: json.endpoint,
        keys: json.keys,
      }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error((err as { error?: string }).error || "Could not save this device.");
    }
    return { mode: "web-push" as const };
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (message.startsWith("Could not save") || message.startsWith("Log in")) {
      throw error;
    }
    await localShowNotification(
      "Volunteer Hub is ready",
      "This browser could not reach a Web Push service. Showing a local ping so you can still see how reminders look.",
      "/volunteer/dashboard",
    );
    return { mode: "mock" as const };
  }
}

export async function unsubscribeHubPush() {
  if (!("serviceWorker" in navigator) || !("PushManager" in window)) return;
  const registration = await navigator.serviceWorker.getRegistration(SW_SCOPE).catch(() => null);
  const sub = await registration?.pushManager.getSubscription();
  if (sub) {
    await fetch("/volunteer/api/push/subscribe", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ endpoint: sub.endpoint }),
    }).catch(() => undefined);
    await sub.unsubscribe().catch(() => undefined);
  }
}

export async function sendTestPing() {
  const res = await fetch("/volunteer/api/push/test", { method: "POST" });
  const data = (await res.json().catch(() => ({}))) as { ok?: boolean; mode?: string; error?: string };
  if (!res.ok) throw new Error(data.error || "Test ping failed.");
  if (data.mode === "mock" || data.mode === "local") {
    await localShowNotification(
      "Shift reminder (test)",
      "This is how a confirmation or waitlist ping looks on this phone.",
      "/volunteer/my-shifts",
    );
  }
  return data;
}
