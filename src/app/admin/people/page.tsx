import Link from "next/link";
import { requireStaff } from "@/app/actions/auth";
import { EmptyState, PageShell, inputClass } from "@/components/ui-copy";
import { SegmentBadge } from "@/components/status-badge";
import { prisma } from "@/lib/db";
import { formatPhone } from "@/lib/phone";
import { volunteerSegmentMap } from "@/lib/staff-metrics";
import { SEGMENT_COPY, type Segment } from "@/lib/segments";

const FILTERS: Segment[] = ["new", "hot_lead", "active", "lapsed", "paused", "blocked"];

export default async function PeoplePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireStaff();
  const params = await searchParams;
  const q = typeof params.q === "string" ? params.q.trim() : "";
  const segment =
    typeof params.segment === "string" && FILTERS.includes(params.segment as Segment)
      ? (params.segment as Segment)
      : null;

  const volunteers = await prisma.volunteer.findMany({
    orderBy: { createdAt: "desc" },
    include: { rolePrefs: { include: { role: true } } },
  });
  const segments = await volunteerSegmentMap(volunteers.map((v) => v.id));

  const filtered = volunteers.filter((v) => {
    const seg = segments.get(v.id);
    if (segment && seg !== segment) return false;
    if (!q) return true;
    const blob = `${v.name} ${v.email} ${v.phone ?? ""} ${v.zip ?? ""}`.toLowerCase();
    return blob.includes(q.toLowerCase());
  });

  return (
    <PageShell
      kicker="People"
      title="Volunteers"
      description="Hot lead means they registered and have never taken a shift. Home addresses stay off the public board."
    >
      <form className="mb-6 flex flex-col gap-3 min-[641px]:flex-row">
        <input
          name="q"
          defaultValue={q}
          placeholder="Search name, email, phone"
          className={inputClass}
        />
        <select name="segment" defaultValue={segment ?? ""} className={`${inputClass} min-[641px]:w-56`}>
          <option value="">All segments</option>
          {FILTERS.map((s) => (
            <option key={s} value={s}>
              {SEGMENT_COPY[s].title}
            </option>
          ))}
        </select>
        <button type="submit" className="hub-btn h-11 bg-[#222] px-5 text-white">
          Filter
        </button>
      </form>
      {volunteers.length === 0 ? (
        <EmptyState
          title="No volunteers yet"
          body="Share the register page. People who already subscribed on the campaign site still need a Hub account to take shifts."
          action={
            <Link href="/register" className="hub-btn inline-flex h-11 items-center bg-[#222] px-5 text-white">
              Open register
            </Link>
          }
        />
      ) : filtered.length === 0 ? (
        <EmptyState title="No matches" body="Clear the search or pick another segment." />
      ) : (
        <>
          <ul className="space-y-3 min-[641px]:hidden">
            {filtered.map((v) => (
              <li key={v.id} className="border border-[#d7d0c2] bg-white p-4">
                <Link href={`/admin/people/${v.id}`} className="font-medium underline">
                  {v.name}
                </Link>
                <p className="mt-1 break-words text-sm text-[#5c574c]">
                  {v.email}
                  <br />
                  {formatPhone(v.phone) || "—"} · {v.zip || "no ZIP"}
                </p>
                <p className="mt-2">
                  <SegmentBadge segment={segments.get(v.id) ?? "new"} />
                </p>
                <p className="mt-2 text-sm">
                  {v.rolePrefs.map((p) => p.role.title).join(", ") || "—"}
                </p>
              </li>
            ))}
          </ul>
          <div className="hidden overflow-x-auto border border-[#d7d0c2] bg-white min-[641px]:block">
          <table className="w-full text-left">
            <thead className="border-b border-[#d7d0c2] bg-white">
              <tr>
                <th className="hub-kicker px-4 py-3">Name</th>
                <th className="hub-kicker px-4 py-3">Contact</th>
                <th className="hub-kicker px-4 py-3">Segment</th>
                <th className="hub-kicker px-4 py-3">Prefs</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((v) => (
                <tr key={v.id} className="border-b border-[#eeeae0]">
                  <td className="px-4 py-3">
                    <Link href={`/admin/people/${v.id}`} className="underline">
                      {v.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    {v.email}
                    <br />
                    {formatPhone(v.phone) || "—"} · {v.zip || "no ZIP"}
                  </td>
                  <td className="px-4 py-3">
                    <SegmentBadge segment={segments.get(v.id) ?? "new"} />
                  </td>
                  <td className="px-4 py-3">
                    {v.rolePrefs.map((p) => p.role.title).join(", ") || "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </>
      )}
    </PageShell>
  );
}
