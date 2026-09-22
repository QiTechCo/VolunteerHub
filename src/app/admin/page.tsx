import Link from "next/link";
import { requireStaff } from "@/app/actions/auth";
import { PageShell } from "@/components/ui-copy";
import { prisma } from "@/lib/db";
import { fillAndNoShowRates, segmentCounts } from "@/lib/staff-metrics";
import { SEGMENT_COPY, type Segment } from "@/lib/segments";

export default async function AdminHomePage() {
  await requireStaff();
  const { counts, total } = await segmentCounts();
  const rates = await fillAndNoShowRates();
  const unpublished = await prisma.shift.count({ where: { status: "draft" } });
  const upcoming = await prisma.shift.count({
    where: { status: "published", startsAt: { gte: new Date() } },
  });

  const cards: { key: Segment; href: string }[] = [
    { key: "new", href: "/admin/people?segment=new" },
    { key: "hot_lead", href: "/admin/people?segment=hot_lead" },
    { key: "active", href: "/admin/people?segment=active" },
    { key: "lapsed", href: "/admin/people?segment=lapsed" },
  ];

  return (
    <PageShell
      kicker="Staff"
      title="Volunteer coordinator desk"
      description="Segments, fill, and no-shows. Schedule and attendance are in the header."
    >
      {total === 0 ? (
        <p className="mb-6">
          No volunteers yet. Share{" "}
          <Link href="/register" className="underline">
            /volunteer/register
          </Link>
          .
        </p>
      ) : null}
      {upcoming === 0 ? (
        <p className="mb-6">No shifts published. Open Schedule to add timeslots.</p>
      ) : null}
      <div className="grid gap-4 min-[641px]:grid-cols-4">
        {cards.map((card) => (
          <Link
            key={card.key}
            href={card.href}
            className="border border-[#d7d0c2] bg-white p-5 hover:border-[#222]"
          >
            <p className="hub-kicker">{SEGMENT_COPY[card.key].title}</p>
            <p className="mt-2 text-3xl tracking-normal normal-case">{counts[card.key]}</p>
            <p className="mt-2 text-sm text-[#5c574c]">{SEGMENT_COPY[card.key].blurb}</p>
          </Link>
        ))}
      </div>
      <div className="mt-6 grid gap-4 min-[641px]:grid-cols-3">
        <div className="border border-[#d7d0c2] bg-white p-5">
          <p className="hub-kicker">Fill rate</p>
          <p className="mt-2 text-3xl tracking-normal normal-case">
            {Math.round(rates.fillRate * 100)}%
          </p>
          <p className="text-sm text-[#5c574c]">
            {rates.filled} occupying / {rates.capacity} seats
          </p>
        </div>
        <div className="border border-[#d7d0c2] bg-white p-5">
          <p className="hub-kicker">No-show rate</p>
          <p className="mt-2 text-3xl tracking-normal normal-case">
            {Math.round(rates.noShowRate * 100)}%
          </p>
          <p className="text-sm text-[#5c574c]">
            {rates.noShows} no-shows / {rates.completed + rates.noShows} closed
          </p>
        </div>
        <div className="border border-[#d7d0c2] bg-white p-5">
          <p className="hub-kicker">Draft shifts</p>
          <p className="mt-2 text-3xl tracking-normal normal-case">{unpublished}</p>
          <Link href="/admin/schedule" className="mt-2 inline-block underline">
            Open schedule
          </Link>
        </div>
      </div>
    </PageShell>
  );
}
