import { requireVolunteer } from "@/app/actions/auth";
import { ProfileForm } from "@/components/profile-form";
import { PageShell } from "@/components/ui-copy";
import { prisma } from "@/lib/db";

export default async function ProfilePage() {
  const session = await requireVolunteer();
  const volunteer = await prisma.volunteer.findUnique({
    where: { id: session.id },
    include: { rolePrefs: true, availability: true },
  });
  if (!volunteer) return null;
  return (
    <PageShell
      kicker="Profile"
      title="Contact, availability, roles"
      description="Staff use this to match shifts. High-trust hosting still needs staff to publish the host shift."
    >
      <div className="max-w-2xl border border-[#d7d0c2] bg-white p-6">
        <ProfileForm volunteer={volunteer} />
      </div>
    </PageShell>
  );
}
