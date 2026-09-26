import Image from "next/image";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { BASE_PATH, CAMPAIGN_HOME } from "@/lib/constants";
import { MobileNav } from "@/components/mobile-nav";
import { LogoutButton } from "@/components/logout-button";
import { HeaderNavLinks } from "@/components/header-nav-links";

const publicLinks = [
  { href: "/", label: "How to help" },
  { href: "/shifts", label: "Shift board" },
  { href: "/training", label: "Training" },
];

export async function SiteHeader() {
  const session = await getSession();
  const volunteerLinks = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/training", label: "Training" },
    { href: "/shifts", label: "Shift board" },
    { href: "/my-shifts", label: "My shifts" },
    { href: "/hours", label: "Hours" },
    { href: "/profile", label: "Profile" },
    { href: "/documents", label: "Documents" },
  ];
  const staffLinks = [
    { href: "/admin", label: "Desk" },
    { href: "/training", label: "Training" },
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
    <header className="border-b border-[#d7d0c2] bg-[#f7f3ea]" style={{ paddingTop: "env(safe-area-inset-top)" }}>
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 max-[640px]:py-2">
        <Link href="/" className="flex shrink-0 items-center">
          <Image
            src={`${BASE_PATH}/volunteer-hub-logo.jpg`}
            alt="Volunteer Hub, Dimple Ajmera for Charlotte campaign"
            width={168}
            height={140}
            className="h-[72px] w-auto max-[640px]:h-[56px]"
            priority
            unoptimized
          />
        </Link>
        <nav className="hidden min-[641px]:flex min-[641px]:flex-wrap min-[641px]:items-center min-[641px]:justify-end min-[641px]:gap-x-3 min-[641px]:gap-y-2">
          <HeaderNavLinks links={links} campaignHome={CAMPAIGN_HOME} />
          {session ? (
            <LogoutButton />
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
