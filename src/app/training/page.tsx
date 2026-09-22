import Link from "next/link";
import { requireHubUser } from "@/app/actions/auth";
import { Day1Notebook } from "@/components/day1-notebook";
import { EmptyState, PageShell } from "@/components/ui-copy";

export default async function TrainingPage() {
  await requireHubUser();
  return (
    <PageShell
      kicker="Training"
      title="Day 1 notebook"
      description="Three short modules for new volunteers: Power, Purpose, and People. Read the leave-with lines, sit with the prompts, then take a published shift. This is a notebook, not the full packets."
    >
      <Day1Notebook />
      <div className="mt-10">
        <EmptyState
          title="Day 2 comes next"
          body="Only Day 1 is in Hub right now. Later days will land here when staff add them. Nothing is scheduled beyond this notebook."
          action={
            <Link href="/shifts" className="hub-btn inline-flex h-11 items-center bg-[#222] px-5 text-white">
              Shift board
            </Link>
          }
        />
      </div>
    </PageShell>
  );
}
