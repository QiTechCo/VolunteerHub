import Link from "next/link";
import { PageShell } from "@/components/ui-copy";

export default function InstallPage() {
  return (
    <PageShell
      kicker="App"
      title="Install Volunteer Hub"
      description="Add the Hub to your Home Screen. It opens as Volunteer Hub, not a second campaign homepage. Start URL is /volunteer."
    >
      <div className="space-y-6">
        <section className="border border-[#d7d0c2] bg-white p-5">
          <h2 className="text-lg">iPhone</h2>
          <ol className="mt-4 list-decimal space-y-2 pl-5">
            <li>Open this Hub in Safari (not in an in-app browser).</li>
            <li>Tap Share, then Add to Home Screen.</li>
            <li>Keep the name Volunteer Hub. Open it from the new icon.</li>
            <li>iOS only delivers Web Push from that Home Screen icon, not from a Safari tab.</li>
          </ol>
        </section>
        <section className="border border-[#d7d0c2] bg-white p-5">
          <h2 className="text-lg">Android</h2>
          <ol className="mt-4 list-decimal space-y-2 pl-5">
            <li>Open this Hub in Chrome.</li>
            <li>Tap the menu, then Install app or Add to Home Screen.</li>
            <li>Open Volunteer Hub from the icon. It runs standalone.</li>
          </ol>
        </section>
        <section className="border border-[#d7d0c2] bg-white p-5">
          <h2 className="text-lg">Computer</h2>
          <p className="mt-3">
            Chrome and Edge show an install icon in the address bar when the manifest and
            service worker are in place. Install keeps the same /volunteer start URL.
          </p>
        </section>
        <section className="border border-[#d7d0c2] bg-white p-5">
          <h2 className="text-lg">Shift notifications</h2>
          <p className="mt-3">
            After you log in, open Profile (volunteers) or Settings (coordinator). Turn on
            Shift notifications, allow the browser prompt, then send a test ping. That is
            the same path used for signup confirmations, waitlist seats, and reminders.
          </p>
          <p className="mt-3 text-sm text-[#5c574c]">
            If this preview has no VAPID keys, the Test ping still fires a local
            notification through the service worker so you can see the chrome. Production
            needs VAPID_PUBLIC_KEY and VAPID_PRIVATE_KEY.
          </p>
        </section>
        <section className="border border-[#d7d0c2] bg-white p-5">
          <h2 className="text-lg">What works offline</h2>
          <p className="mt-3">
            How-to-help, role cards, login/register chrome, and the Day 1 notebook
            excerpts stay on the phone. The shift board and signup need a connection — if
            you open them offline, Hub says so instead of pretending a stale private roster
            is current. Volunteer profile data is not written into the shared offline
            fallback.
          </p>
        </section>
        <p>
          <Link href="/login" className="hub-btn inline-flex h-11 items-center bg-[#222] px-5 text-white">
            Log in
          </Link>
        </p>
      </div>
    </PageShell>
  );
}
