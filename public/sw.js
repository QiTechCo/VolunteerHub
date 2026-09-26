const BASE = "/volunteer";
const CACHE = "vh-hub-v4";
const PRECACHE = [
  `${BASE}/offline.html`,
  `${BASE}/icons/icon-192.png`,
  `${BASE}/icons/icon-512.png`,
  `${BASE}/icons/apple-touch-icon.png`,
  `${BASE}/volunteer-hub-logo.jpg`,
  `${BASE}/manifest.webmanifest`,
];

self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE);
      for (const url of PRECACHE) {
        try {
          const res = await fetch(url, { cache: "reload", signal: AbortSignal.timeout(4000) });
          if (res.ok) await cache.put(url, res.clone());
        } catch {
          /* keep installing even if one asset is slow */
        }
      }
    })(),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)));
      await self.clients.claim();
    })(),
  );
});

function hasSessionCookie(request) {
  return /(^|;\s*)vh_session=/.test(request.headers.get("cookie") || "");
}

function isApi(url) {
  return url.pathname.startsWith(`${BASE}/api/`);
}

function isStaticAsset(url) {
  return (
    url.pathname.startsWith(`${BASE}/_next/static/`) ||
    url.pathname.startsWith(`${BASE}/icons/`) ||
    url.pathname.endsWith("/volunteer-hub-logo.jpg") ||
    url.pathname.endsWith("/offline.html") ||
    url.pathname.endsWith("manifest.webmanifest")
  );
}

function isPublicSitePath(url) {
  const path = url.pathname.replace(/\/$/, "") || "/";
  return (
    path === BASE ||
    path === `${BASE}/login` ||
    path === `${BASE}/register` ||
    path === `${BASE}/install`
  );
}

async function offlinePage() {
  const cache = await caches.open(CACHE);
  return (
    (await cache.match(`${BASE}/offline.html`)) ||
    new Response("Volunteer Hub is offline.", {
      status: 503,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    })
  );
}

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (url.hostname === "localhost" || url.hostname === "127.0.0.1") return;
  if (isApi(url)) return;
  if (url.pathname.endsWith(".mp4") || url.pathname.includes("/videos/")) return;

  event.respondWith(handleFetch(request, url));
});

async function handleFetch(request, url) {
  const dest = request.headers.get("Sec-Fetch-Dest") || "";
  const isDoc = request.mode === "navigate" || dest === "document";

  if (isStaticAsset(url)) {
    const cached = await caches.match(request);
    if (cached) return cached;
    try {
      const fresh = await fetch(request);
      if (fresh.ok) {
        const cache = await caches.open(CACHE);
        await cache.put(request, fresh.clone());
      }
      return fresh;
    } catch {
      if (cached) return cached;
      if (isDoc) return offlinePage();
      throw new Error("offline");
    }
  }

  if (isDoc) {
    try {
      const fresh = await fetch(request);
      if (!fresh.ok) throw new Error("bad status");
      if (!hasSessionCookie(request) && isPublicSitePath(url)) {
        const cache = await caches.open(CACHE);
        await cache.put(request, fresh.clone());
      }
      return fresh;
    } catch {
      if (!hasSessionCookie(request)) {
        const cached = await caches.match(request);
        if (cached) return cached;
      }
      return offlinePage();
    }
  }

  try {
    return await fetch(request);
  } catch {
    const cached = await caches.match(request);
    if (cached) return cached;
    return new Response("Offline", { status: 503 });
  }
}

self.addEventListener("push", (event) => {
  let data = { title: "Volunteer Hub", body: "You have a Hub update.", url: `${BASE}/` };
  try {
    if (event.data) data = { ...data, ...event.data.json() };
  } catch {
    if (event.data) data.body = event.data.text();
  }
  event.waitUntil(
    self.registration.showNotification(data.title || "Volunteer Hub", {
      body: data.body,
      icon: `${BASE}/icons/icon-192.png`,
      badge: `${BASE}/icons/icon-192.png`,
      data: { url: data.url || `${BASE}/` },
    }),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const dest = event.notification.data?.url || `${BASE}/`;
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clients) => {
      for (const client of clients) {
        if ("focus" in client) {
          client.navigate?.(dest);
          return client.focus();
        }
      }
      return self.clients.openWindow(dest);
    }),
  );
});

self.addEventListener("message", (event) => {
  const data = event.data || {};
  if (data.type === "SHOW_NOTIFICATION") {
    event.waitUntil(
      self.registration.showNotification(data.title || "Volunteer Hub", {
        body: data.body || "",
        icon: `${BASE}/icons/icon-192.png`,
        badge: `${BASE}/icons/icon-192.png`,
        data: { url: data.url || `${BASE}/` },
      }),
    );
  }
});
