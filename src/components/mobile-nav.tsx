"use client";

import Link from "next/link";
import { logoutAction } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";

export function MobileNav({
  links,
  campaignHome,
  signedIn,
}: {
  links: { href: string; label: string }[];
  campaignHome: string;
  signedIn: boolean;
}) {
  return (
    <details className="relative min-[641px]:hidden">
      <summary className="hub-kicker cursor-pointer list-none border border-[#222] px-3 py-2">
        Menu
      </summary>
      <div className="absolute right-0 z-50 mt-2 w-64 border border-[#d7d0c2] bg-[#f7f3ea] p-4 shadow-sm">
        <nav className="flex flex-col gap-3">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="hub-kicker text-[#222]">
              {link.label}
            </Link>
          ))}
          <a href={campaignHome} className="hub-kicker text-[#222]">
            Campaign home
          </a>
          {signedIn ? (
            <form action={logoutAction}>
              <Button type="submit" className="hub-btn h-11 w-full rounded-none bg-[#222] text-white">
                Log out
              </Button>
            </form>
          ) : (
            <>
              <Link href="/login" className="hub-kicker border border-[#222] px-3 py-2 text-center">
                Log in
              </Link>
              <Link
                href="/register"
                className="hub-kicker bg-[#222] px-3 py-2 text-center text-white"
              >
                Register
              </Link>
            </>
          )}
        </nav>
      </div>
    </details>
  );
}
