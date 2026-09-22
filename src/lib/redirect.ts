import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { BASE_PATH } from "@/lib/constants";

/** Paths Next.js `redirect()` should send, including `/volunteer`. */
export function hubPath(path: string) {
  const [pathname, query] = path.split("?");
  const raw = pathname && pathname.length > 0 ? pathname : "/";
  const normalized = raw.startsWith("/") ? raw : `/${raw}`;
  let prefixed = normalized;
  if (normalized === "/") {
    prefixed = BASE_PATH;
  } else if (normalized === BASE_PATH || normalized.startsWith(`${BASE_PATH}/`)) {
    prefixed = normalized;
  } else {
    prefixed = `${BASE_PATH}${normalized}`;
  }
  return query ? `${prefixed}?${query}` : prefixed;
}

export function isSafeHubPath(path: string) {
  if (!path.startsWith("/") || path.startsWith("//")) return false;
  if (path.includes("://")) return false;
  return true;
}

/**
 * Server Actions emit a Location header that does not apply `basePath`.
 * Absolute URLs avoid that and also work in Server Components.
 */
export async function redirectToHub(path: string): Promise<never> {
  const dest = hubPath(path);
  const h = await headers();
  const host = (h.get("x-forwarded-host") ?? h.get("host") ?? "")
    .split(",")[0]
    .trim();
  if (!host) {
    redirect(dest);
  }
  const proto = (h.get("x-forwarded-proto") ?? "http").split(",")[0].trim();
  redirect(`${proto}://${host}${dest}`);
}
