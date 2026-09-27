import Link from "next/link";
import { CAMPAIGN_HOME, COMMITTEE_NAME } from "@/lib/constants";

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-[#d7d0c2] bg-white">
      <div className="mx-auto max-w-6xl px-4 py-10 text-center text-[15px] leading-7 text-[#222]">
        <p>Paid for by {COMMITTEE_NAME}</p>
        <p className="mt-4 flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
          <Link href="/install" className="hub-kicker inline-block">
            Install app
          </Link>
          <a className="hub-kicker inline-block" href={CAMPAIGN_HOME}>
            Campaign home
          </a>
        </p>
      </div>
    </footer>
  );
}
