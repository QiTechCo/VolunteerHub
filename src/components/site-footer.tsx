import { CAMPAIGN_HOME, COMMITTEE_NAME, CONTACT_EMAIL, HQ_ADDRESS } from "@/lib/constants";

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-[#d7d0c2] bg-[#fcfcfc]">
      <div className="mx-auto max-w-6xl px-4 py-10 text-center text-[15px] leading-7 text-[#222]">
        <p>Paid for by {COMMITTEE_NAME}</p>
        <p className="mt-2">{HQ_ADDRESS}</p>
        <p>
          <a className="underline" href={`mailto:${CONTACT_EMAIL}`}>
            {CONTACT_EMAIL}
          </a>
        </p>
        <p className="mt-4">
          <a className="hub-kicker inline-block" href={CAMPAIGN_HOME}>
            Campaign home
          </a>
        </p>
      </div>
    </footer>
  );
}
