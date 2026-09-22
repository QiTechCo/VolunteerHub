import Link from "next/link";
import { notFound } from "next/navigation";
import { SignupForm } from "@/components/signup-form";
import { PageShell } from "@/components/ui-copy";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { formatDateInZone, formatTimeInZone } from "@/lib/datetime";
import { shiftCapacitySummary } from "@/lib/scheduling";

export default async function ShiftDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const shift = await prisma.shift.findUnique({ where: { id } });
  if (!shift || shift.visibility !== "public" || shift.status === "draft") {
    notFound();
  }
  const session = await getSession();
  const caps = await shiftCapacitySummary(shift.id);
  const existing =
    session?.kind === "volunteer"
      ? await prisma.assignment.findFirst({
          where: {
            shiftId: shift.id,
            volunteerId: session.id,
            status: {
              in: ["registered", "waitlisted", "confirmed", "pending_approval"],
            },
          },
        })
      : null;

  const open = shift.status === "published" && shift.startsAt > new Date();

  return (
    <PageShell kicker="Shift" title={shift.title}>
      <div className="grid gap-8 min-[641px]:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-4 border border-[#d7d0c2] bg-white p-5">
          <p>
            {formatDateInZone(shift.startsAt, shift.timezone)}
            <br />
            {formatTimeInZone(shift.startsAt, shift.timezone)} –{" "}
            {formatTimeInZone(shift.endsAt, shift.timezone)} ({shift.timezone})
          </p>
          <p>{shift.locationName}</p>
          {shift.whatToBring ? (
            <div>
              <p className="hub-kicker">What to bring</p>
              <p className="mt-2">{shift.whatToBring}</p>
            </div>
          ) : null}
          <div>
            <p className="hub-kicker">Seats by role</p>
            <ul className="mt-2 space-y-1">
              {caps.map((cap) => (
                <li key={cap.roleSlug}>
                  {cap.title}: {cap.remaining} of {cap.capacity} open
                  {cap.waitlisted ? ` · ${cap.waitlisted} waitlisted` : ""}
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div>
          {!open ? (
            <p className="border border-[#d7d0c2] bg-white p-5">
              This shift is not open for new signups.
            </p>
          ) : existing ? (
            <p className="border border-[#d7d0c2] bg-white p-5">
              You are {existing.status.replace("_", " ")} for this shift.{" "}
              <Link href="/my-shifts" className="underline">
                Manage it on My shifts
              </Link>
              .
            </p>
          ) : session?.kind === "volunteer" ? (
            <SignupForm
              shiftId={shift.id}
              roles={caps.map((c) => ({
                slug: c.roleSlug,
                title: c.title,
                remaining: c.remaining,
              }))}
            />
          ) : session?.kind === "staff" ? (
            <p className="border border-[#d7d0c2] bg-white p-5">
              Staff assign people from the{" "}
              <Link href={`/admin/schedule/${shift.id}`} className="underline">
                schedule
              </Link>
              .
            </p>
          ) : (
            <div className="border border-[#d7d0c2] bg-white p-5">
              <p>Log in or register to take this shift. Signup stays on Volunteer Hub.</p>
              <div className="mt-4 flex gap-3">
                <Link href={`/login?next=/shifts/${shift.id}`} className="hub-btn inline-flex h-11 items-center border border-[#222] px-4">
                  Log in
                </Link>
                <Link href="/register" className="hub-btn inline-flex h-11 items-center bg-[#222] px-4 text-white">
                  Register
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </PageShell>
  );
}
