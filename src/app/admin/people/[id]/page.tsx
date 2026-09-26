import Link from "next/link";
import { notFound } from "next/navigation";
import { requireStaff } from "@/app/actions/auth";
import {
  HoursOverrideForm,
  NoteForm,
  StatusForm,
  TrainingForm,
} from "@/components/admin-people-forms";
import { AssignmentBadge, SegmentBadge } from "@/components/status-badge";
import { PageShell } from "@/components/ui-copy";
import { formatPhone } from "@/lib/phone";
import { prisma } from "@/lib/db";
import { BASE_PATH, WEEKDAYS } from "@/lib/constants";
import { formatInZone, formatMinutes } from "@/lib/datetime";
import { volunteerSegmentMap } from "@/lib/staff-metrics";

export default async function PersonPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireStaff();
  const { id } = await params;
  const volunteer = await prisma.volunteer.findUnique({
    where: { id },
    include: {
      rolePrefs: { include: { role: true } },
      availability: true,
      trainings: { include: { role: true }, orderBy: { completedAt: "desc" } },
      assignments: { include: { shift: true, role: true }, orderBy: { createdAt: "desc" } },
      hoursEntries: true,
      documents: true,
      staffNotes: { include: { staff: true }, orderBy: { createdAt: "desc" } },
    },
  });
  if (!volunteer) notFound();
  const seg = (await volunteerSegmentMap([volunteer.id])).get(volunteer.id) ?? "new";
  const hours = volunteer.hoursEntries
    .filter((h) => h.status === "confirmed")
    .reduce((sum, h) => sum + h.minutes, 0);
  const phoneClash = volunteer.phone
    ? await prisma.volunteer.findFirst({
        where: { phone: volunteer.phone, NOT: { id: volunteer.id } },
        select: { id: true, name: true },
      })
    : null;

  return (
    <PageShell kicker="People" title={volunteer.name}>
      <div className="grid gap-6 min-[641px]:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-5">
          <div className="border border-[#d7d0c2] bg-white p-5">
            <SegmentBadge segment={seg} />
            <p className="mt-3 break-words">{volunteer.email}</p>
            <p>{formatPhone(volunteer.phone) || "No phone"}</p>
            <p>ZIP {volunteer.zip || "—"}</p>
            <p className="text-sm text-[#5c574c]">
              Street address (staff only): {volunteer.address || "not provided"}
            </p>
            {phoneClash ? (
              <p className="mt-3 text-destructive">
                Same phone as{" "}
                <Link href={`/admin/people/${phoneClash.id}`} className="underline">
                  {phoneClash.name}
                </Link>
                .
              </p>
            ) : null}
            <p className="mt-3">Willing to host: {volunteer.willingToHost ? "yes" : "no"}</p>
            <p>
              Prefs:{" "}
              {volunteer.rolePrefs.map((p) => p.role.title).join(", ") || "none"}
            </p>
            <p>
              Availability:{" "}
              {volunteer.availability.length
                ? volunteer.availability
                    .map((a) => `${WEEKDAYS[a.weekday]} ${a.startLocal}–${a.endLocal}`)
                    .join("; ")
                : "none on file"}
            </p>
            <p className="mt-3">Confirmed hours: {formatMinutes(hours)}</p>
          </div>
          <div className="border border-[#d7d0c2] bg-white p-5">
            <h2 className="text-lg">Status</h2>
            <div className="mt-3">
              <StatusForm volunteerId={volunteer.id} status={volunteer.status} />
            </div>
          </div>
          <div className="border border-[#d7d0c2] bg-white p-5">
            <h2 className="text-lg">Assignments</h2>
            <ul className="mt-3 space-y-2">
              {volunteer.assignments.map((a) => (
                <li key={a.id} className="flex items-center justify-between gap-3">
                  <span>
                    {a.shift.title} · {a.role.title}
                    <br />
                    <span className="text-sm text-[#5c574c]">
                      {formatInZone(a.shift.startsAt, a.shift.timezone)}
                    </span>
                  </span>
                  <AssignmentBadge status={a.status} />
                </li>
              ))}
              {volunteer.assignments.length === 0 ? <li>No shifts yet.</li> : null}
            </ul>
          </div>
          <div className="border border-[#d7d0c2] bg-white p-5">
            <h2 className="text-lg">Documents</h2>
            <ul className="mt-3 space-y-2">
              {volunteer.documents.map((d) => (
                <li key={d.id}>
                  <a href={`${BASE_PATH}/api/documents/${d.id}`} className="underline">
                    {d.kind}: {d.filename}
                  </a>
                </li>
              ))}
              {volunteer.documents.length === 0 ? <li>None uploaded.</li> : null}
            </ul>
          </div>
        </div>
        <div className="space-y-5">
          <div className="border border-[#d7d0c2] bg-white p-5">
            <h2 className="text-lg">Staff notes</h2>
            <div className="mt-3">
              <NoteForm volunteerId={volunteer.id} />
            </div>
            <ul className="mt-4 space-y-3">
              {volunteer.staffNotes.map((note) => (
                <li key={note.id} className="border-t border-[#eeeae0] pt-3">
                  <p className="text-sm text-[#5c574c]">
                    {note.staff.name} · {formatInZone(note.createdAt)}
                  </p>
                  <p>{note.body}</p>
                </li>
              ))}
            </ul>
          </div>
          <div className="border border-[#d7d0c2] bg-white p-5">
            <h2 className="text-lg">Training credentials</h2>
            {volunteer.trainings.filter((t) => t.roleSlug.startsWith("training_") || t.roleSlug === "organizing_intensive").length > 0 ? (
              <div className="mt-3 space-y-2 border-b border-[#eeeae0] pb-3">
                {volunteer.trainings
                  .filter((t) => t.roleSlug.startsWith("training_") || t.roleSlug === "organizing_intensive")
                  .map((t) => (
                    <div key={t.id} className="flex items-center justify-between text-sm">
                      <span className="font-semibold">{t.role.title}</span>
                      <span className="text-xs font-semibold text-[#2e7d4f]">✓ {formatInZone(t.completedAt).split(" · ")[0]}</span>
                    </div>
                  ))}
              </div>
            ) : (
              <p className="mt-2 text-xs text-[#5c574c]">No curriculum modules completed yet.</p>
            )}
            <h3 className="mt-4 text-xs font-semibold uppercase tracking-wider text-[#5c574c]">Role flags</h3>
            <div className="mt-2">
              <TrainingForm
                volunteerId={volunteer.id}
                trained={volunteer.trainings.map((t) => t.roleSlug)}
              />
            </div>
          </div>
          <div className="border border-[#d7d0c2] bg-white p-5">
            <h2 className="text-lg">Manual hours</h2>
            <div className="mt-3">
              <HoursOverrideForm volunteerId={volunteer.id} />
            </div>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
