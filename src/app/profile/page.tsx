import Link from "next/link";
import { requireVolunteer } from "@/app/actions/auth";
import { ProfileForm } from "@/components/profile-form";
import { PushOptIn } from "@/components/push-opt-in";
import { PageShell } from "@/components/ui-copy";
import { prisma } from "@/lib/db";
import { formatInZone } from "@/lib/datetime";

export default async function ProfilePage() {
  const session = await requireVolunteer();
  const volunteer = await prisma.volunteer.findUnique({
    where: { id: session.id },
    include: {
      rolePrefs: true,
      availability: true,
      trainings: {
        include: { role: true },
        orderBy: { completedAt: "desc" },
      },
    },
  });
  if (!volunteer) return null;

  return (
    <PageShell
      kicker="Profile"
      title="Contact, availability, roles"
      description="Staff use this to match shifts. High-trust hosting still needs staff to publish the host shift."
    >
      <div className="max-w-2xl border border-[#d7d0c2] bg-white p-5 min-[641px]:p-6">
        <ProfileForm volunteer={volunteer} />
      </div>

      <div className="mt-6 max-w-2xl border border-[#d7d0c2] bg-white p-5 min-[641px]:p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl">Accreditations & Training</h2>
          <a href="/volunteer/training/index.html" className="hub-btn bg-[#222] px-3 py-1.5 text-xs text-white hover:bg-navy">
            Training Hub
          </a>
        </div>
        <p className="mt-1 text-sm text-[#5c574c]">
          Badges earned through the People, Power, Purpose organizing curriculum.
        </p>

        {volunteer.trainings.length > 0 ? (
          <div className="mt-4 divide-y divide-[#eeeae0] border-t border-[#eeeae0]">
            {volunteer.trainings.map((t) => (
              <div key={t.id} className="flex items-center justify-between py-3">
                <div>
                  <p className="font-semibold text-sm">{t.role.title}</p>
                  <p className="text-xs text-[#5c574c]">{t.role.description}</p>
                </div>
                <span className="text-xs font-semibold text-[#2e7d4f]">
                  ✓ {formatInZone(t.completedAt).split(" · ")[0]}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-4 border border-dashed border-[#d7d0c2] p-4 text-center">
            <p className="text-sm text-[#5c574c]">No training modules completed yet.</p>
            <a href="/volunteer/training/index.html" className="mt-2 inline-block text-sm font-semibold underline">
              Start Module 1: People
            </a>
          </div>
        )}
      </div>

      <div className="mt-6 max-w-2xl">
        <PushOptIn />
      </div>
    </PageShell>
  );
}
