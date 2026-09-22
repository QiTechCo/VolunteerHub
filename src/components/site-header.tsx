import Image from "next/image";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { CAMPAIGN_HOME } from "@/lib/constants";
import { logoutAction } from "@/app/actions/auth";
import { MobileNav } from "@/components/mobile-nav";
import { Button } from "@/components/ui/button";

const publicLinks = [
  { href: "/", label: "How to help" },
  { href: "/shifts", label: "Shift board" },
];

export async function SiteHeader() {
  const session = await getSession();
  const volunteerLinks = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/shifts", label: "Shift board" },
    { href: "/my-shifts", label: "My shifts" },
    { href: "/hours", label: "Hours" },
    { href: "/profile", label: "Profile" },
    { href: "/documents", label: "Documents" },
  ];
  const staffLinks = [
    { href: "/admin", label: "Desk" },
    { href: "/admin/people", label: "People" },
    { href: "/admin/schedule", label: "Schedule" },
    { href: "/admin/attendance", label: "Attendance" },
    { href: "/admin/roles", label: "Roles" },
    { href: "/admin/settings", label: "Settings" },
  ];
  const links =
    session?.kind === "staff"
      ? staffLinks
      : session?.kind === "volunteer"
        ? volunteerLinks
        : publicLinks;

  return (
    <header className="border-b border-[#d7d0c2] bg-[#f7f3ea]">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 max-[640px]:py-2">
        <Link href="/" className="flex shrink-0 items-center">
          <Image
            src="/volunteer-hub-logo.jpg"
            alt="Volunteer Hub, Dimple Ajmera for Charlotte campaign"
            width={168}
            height={140}
            className="h-[72px] w-auto max-[640px]:h-[56px]"
            priority
            unoptimized
          />
        </Link>
        <nav className="hidden items-center gap-5 min-[641px]:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="hub-kicker text-[#222] hover:text-navy"
            >
              {link.label}
            </Link>
          ))}
          <a
            href={CAMPAIGN_HOME}
            className="hub-kicker text-[#222] hover:text-navy"
          >
            Campaign home
          </a>
          {session ? (
            <form action={logoutAction}>
              <Button type="submit" variant="outline" className="hub-btn h-10 rounded-none px-4">
                Log out
              </Button>
            </form>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="hub-btn inline-flex h-10 items-center border border-[#222] px-4 text-[#222]"
              >
                Log in
              </Link>
              <Link
                href="/register"
                className="hub-btn inline-flex h-10 items-center bg-[#222] px-4 text-white hover:bg-[#272727]"
              >
                Register
              </Link>
            </div>
          )}
        </nav>
        <MobileNav
          links={links}
          campaignHome={CAMPAIGN_HOME}
          signedIn={Boolean(session)}
        />
      </div>
    </header>
  );
}
