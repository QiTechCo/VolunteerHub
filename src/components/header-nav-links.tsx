"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  if (href === "/admin") return pathname === "/admin";
  if (href === "/shifts") return pathname === "/shifts" || pathname.startsWith("/shifts/");
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function HeaderNavLinks({
  links,
  campaignHome,
}: {
  links: { href: string; label: string }[];
  campaignHome: string;
}) {
  const pathname = usePathname();

  const baseClass =
    "hub-kicker border-b-2 px-1.5 py-1.5 transition-colors duration-150";
  const activeClass = "border-[#b11a2b] text-[#1e3a6e]";
  const inactiveClass =
    "border-transparent text-[#222] hover:border-[#b11a2b] hover:text-[#1e3a6e]";

  return (
    <>
      {links.map((link) => {
        const active = isActive(pathname, link.href);
        const cls = `${baseClass} ${active ? activeClass : inactiveClass}`;

        if (link.href === "/training") {
          return (
            <a
              key={link.href}
              href="/volunteer/training/index.html"
              className={cls}
              aria-current={active ? "page" : undefined}
            >
              {link.label}
            </a>
          );
        }

        return (
          <Link
            key={link.href}
            href={link.href}
            className={cls}
            aria-current={active ? "page" : undefined}
          >
            {link.label}
          </Link>
        );
      })}
      <a
        href={campaignHome}
        className={`${baseClass} ${inactiveClass}`}
      >
        Campaign home
      </a>
    </>
  );
}
