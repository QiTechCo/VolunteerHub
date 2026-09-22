import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { BASE_PATH, SESSION_COOKIE, type StaffRole } from "@/lib/constants";

export type Session =
  | {
      kind: "volunteer";
      id: string;
      email: string;
      name: string;
    }
  | {
      kind: "staff";
      id: string;
      email: string;
      name: string;
      role: StaffRole;
    };

function secret() {
  const value = process.env.AUTH_SECRET;
  if (!value) {
    throw new Error("AUTH_SECRET is not set");
  }
  return new TextEncoder().encode(value);
}

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export async function createSessionToken(session: Session) {
  return new SignJWT(session)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("14d")
    .sign(secret());
}

export async function readSessionToken(token: string): Promise<Session | null> {
  try {
    const { payload } = await jwtVerify(token, secret());
    if (payload.kind === "staff") {
      return {
        kind: "staff",
        id: String(payload.id),
        email: String(payload.email),
        name: String(payload.name),
        role: payload.role as StaffRole,
      };
    }
    if (payload.kind === "volunteer") {
      return {
        kind: "volunteer",
        id: String(payload.id),
        email: String(payload.email),
        name: String(payload.name),
      };
    }
    return null;
  } catch {
    return null;
  }
}

export async function getSession(): Promise<Session | null> {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return readSessionToken(token);
}

export async function setSession(session: Session) {
  const token = await createSessionToken(session);
  const jar = await cookies();
  jar.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: BASE_PATH,
    maxAge: 60 * 60 * 24 * 14,
  });
}

export async function clearSession() {
  const jar = await cookies();
  jar.set(SESSION_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: BASE_PATH,
    maxAge: 0,
  });
}

export function isStaff(session: Session | null): session is Extract<
  Session,
  { kind: "staff" }
> {
  return session?.kind === "staff";
}

export function canEditSchedule(role: StaffRole) {
  return role === "owner" || role === "volunteer_director" || role === "scheduler";
}

export function canManagePeople(role: StaffRole) {
  return role === "owner" || role === "volunteer_director";
}
