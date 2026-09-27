"use client";

import { useRef } from "react";
import Link from "next/link";
import { LogoutButton } from "@/components/logout-button";

export function MobileNav({
  links,
  campaignHome,
  signedIn,
}: {
  links: { href: string; label: string }[];
  campaignHome: string;
  signedIn: boolean;
}) {
  const detailsRef = useRef<HTMLDetailsElement>(null);
  const close = () => {
    if (detailsRef.current) detailsRef.current.open = false;
  };

  return (
    <details ref={detailsRef} className="relative min-[641px]:hidden">
      <summary className="hub-kicker flex min-h-11 min-w-11 cursor-pointer list-none items-center justify-center border border-[#222] px-3 py-2 [&::-webkit-details-marker]:hidden">
        Menu
      </summary>
      <div className="absolute right-0 z-50 mt-2 max-h-[min(70vh,28rem)] w-[min(18rem,calc(100vw-2rem))] overflow-y-auto border border-[#d7d0c2] bg-white p-4 shadow-sm">
        <nav className="flex flex-col gap-1">
          {links.map((link) =>
            link.href === "/training" ? (
              <a
                key={link.href}
                href="/volunteer/training/index.html"
                onClick={close}
                className="hub-kicker min-h-11 px-1 py-2 text-[#222]"
              >
                {link.label}
              </a>
            ) : (
              <Link
                key={link.href}
                href={link.href}
                onClick={close}
                className="hub-kicker min-h-11 px-1 py-2 text-[#222]"
              >
                {link.label}
              </Link>
            )
          )}
          <a href={campaignHome} className="hub-kicker min-h-11 px-1 py-2 text-[#222]">
            Campaign home
          </a>
          <Link href="/install" onClick={close} className="hub-kicker min-h-11 px-1 py-2 text-[#222]">
            Install app
          </Link>
          {signedIn ? (
            <LogoutButton filled className="mt-2" />
          ) : (
            <>
              <Link
                href="/login"
                onClick={close}
                className="hub-kicker mt-2 border border-[#222] px-3 py-3 text-center"
              >
                Log in
              </Link>
              <Link
                href="/register"
                onClick={close}
                className="hub-kicker bg-[#222] px-3 py-3 text-center text-white"
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
