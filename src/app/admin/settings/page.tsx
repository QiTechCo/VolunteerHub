import { requireStaff } from "@/app/actions/auth";
import { PageShell } from "@/components/ui-copy";
import { prisma } from "@/lib/db";
import { formatInZone } from "@/lib/datetime";
import { CAMPAIGN_HOME, CONTACT_EMAIL } from "@/lib/constants";

export default async function SettingsPage() {
  const staff = await requireStaff();
  const staffUsers = await prisma.staffUser.findMany({ orderBy: { createdAt: "asc" } });
  const mail = await prisma.outboundEmail.findMany({
    orderBy: { createdAt: "desc" },
    take: 8,
  });
  const audits = await prisma.auditEvent.findMany({
    orderBy: { at: "desc" },
    take: 12,
  });

  return (
    <PageShell
      kicker="Settings"
      title="Hub settings"
      description="This beta logs transactional mail instead of sending it. Invite-only staff accounts are seeded; there is no invite form yet."
    >
      <div className="grid gap-6 min-[641px]:grid-cols-2">
        <div className="border border-[#d7d0c2] bg-white p-5">
          <h2 className="text-lg">You</h2>
          <p className="mt-3">{staff.name}</p>
          <p>{staff.email}</p>
          <p className="hub-kicker mt-2">{staff.role.replaceAll("_", " ")}</p>
        </div>
        <div className="border border-[#d7d0c2] bg-white p-5">
          <h2 className="text-lg">Mail</h2>
          <p className="mt-3">
            From-address is not provisioned. Confirmations are stored below with status
            logged_not_sent. Campaign contact remains{" "}
            <a href={`mailto:${CONTACT_EMAIL}`} className="underline">
              {CONTACT_EMAIL}
            </a>
            . Primary site:{" "}
            <a href={CAMPAIGN_HOME} className="underline">
              dimpleajmera.com
            </a>
            .
          </p>
        </div>
        <div className="border border-[#d7d0c2] bg-white p-5">
          <h2 className="text-lg">Staff accounts</h2>
          <ul className="mt-3 space-y-2">
            {staffUsers.map((u) => (
              <li key={u.id}>
                {u.name} · {u.email} · {u.role.replaceAll("_", " ")}
              </li>
            ))}
          </ul>
        </div>
        <div className="border border-[#d7d0c2] bg-white p-5">
          <h2 className="text-lg">Recent queued mail</h2>
          {mail.length === 0 ? (
            <p className="mt-3">No messages queued yet.</p>
          ) : (
            <ul className="mt-3 space-y-2 text-sm">
              {mail.map((m) => (
                <li key={m.id}>
                  {m.kind}: {m.subject}
                  <br />
                  <span className="text-[#5c574c]">
                    {m.toEmail} · {m.status} · {formatInZone(m.createdAt)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
      <div className="mt-6 border border-[#d7d0c2] bg-white p-5">
        <h2 className="text-lg">Recent audit events</h2>
        <ul className="mt-3 space-y-1 text-sm">
          {audits.map((event) => (
            <li key={event.id}>
              {formatInZone(event.at)} · {event.action}
            </li>
          ))}
        </ul>
      </div>
    </PageShell>
  );
}
