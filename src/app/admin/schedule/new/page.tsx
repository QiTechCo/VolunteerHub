import { requireStaff } from "@/app/actions/auth";
import { ShiftForm } from "@/components/admin-schedule-forms";
import { PageShell } from "@/components/ui-copy";

export default async function NewShiftPage() {
  await requireStaff();
  return (
    <PageShell kicker="Schedule" title="New shift">
      <div className="max-w-2xl border border-[#d7d0c2] bg-white p-6">
        <ShiftForm />
      </div>
    </PageShell>
  );
}
