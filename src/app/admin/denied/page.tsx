import { PageShell } from "@/components/ui-copy";
import Link from "next/link";

export default function AdminDeniedPage() {
  return (
    <PageShell
      kicker="Staff only"
      title="You need a staff account to open the coordinator desk"
      description="This page is for campaign staff. Volunteer accounts use the dashboard instead."
    >
      <Link href="/dashboard" className="hub-btn inline-flex h-11 items-center bg-[#222] px-5 text-white">
        Volunteer dashboard
      </Link>
    </PageShell>
  );
}
