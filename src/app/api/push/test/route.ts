import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { notifyStaff, notifyVolunteer, vapidConfigured } from "@/lib/push";

export async function POST() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Log in to send a test ping." }, { status: 401 });
  }
  const payload = {
    title: "Shift reminder (test)",
    body: "This is how a confirmation, reminder, or waitlist ping looks on this phone.",
    url: session.kind === "staff" ? "/admin" : "/my-shifts",
  };
  if (session.kind === "staff") {
    const result = await notifyStaff(session.id, payload);
    return NextResponse.json({
      ok: true,
      mode: result.mock || result.sent === 0 ? "mock" : "web-push",
    });
  }
  const result = await notifyVolunteer(session.id, payload);
  return NextResponse.json({
    ok: true,
    mode: !vapidConfigured() || result.mock || result.sent === 0 ? "mock" : "web-push",
  });
}
