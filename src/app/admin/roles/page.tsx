import { requireStaff } from "@/app/actions/auth";
import { RoleEditForm } from "@/components/role-edit-form";
import { PageShell } from "@/components/ui-copy";
import { prisma } from "@/lib/db";

export default async function RolesPage() {
  await requireStaff();
  const roles = await prisma.roleCatalog.findMany({ orderBy: { sortOrder: "asc" } });
  return (
    <PageShell
      kicker="Roles & screening"
      title="Role catalog"
      description="Canvassing, poll greeting, yard sign posting, and event hosting are the v1 roles. High-trust hosting stays pending until staff assign or approve."
    >
      <div className="grid gap-4">
        {roles.map((role) => (
          <div key={role.slug} className="border border-[#d7d0c2] bg-white p-5">
            <h2 className="text-lg">{role.title}</h2>
            <div className="mt-4">
              <RoleEditForm
                slug={role.slug}
                description={role.description}
                trustLevel={role.trustLevel}
                requiresTraining={role.requiresTraining}
              />
            </div>
          </div>
        ))}
      </div>
    </PageShell>
  );
}
