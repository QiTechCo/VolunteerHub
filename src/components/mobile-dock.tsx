"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const volunteerTabs = [
  { href: "/dashboard", label: "Home" },
  { href: "/shifts", label: "Shifts" },
  { href: "/training", label: "Training" },
];

const staffTabs = [
  { href: "/admin", label: "Desk" },
  { href: "/admin/people", label: "People" },
  { href: "/admin/schedule", label: "Schedule" },
];

function active(pathname: string, href: string) {
  if (href === "/admin") return pathname === "/admin";
  if (href === "/shifts") return pathname === "/shifts" || pathname.startsWith("/shifts/");
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function MobileDock({ kind }: { kind: "volunteer" | "staff" }) {
  const pathname = usePathname();
  const tabs = kind === "staff" ? staffTabs : volunteerTabs;
  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-[#d7d0c2] bg-[#f7f3ea] min-[641px]:hidden"
      style={{ paddingBottom: "max(0.35rem, env(safe-area-inset-bottom))" }}
    >
      <ul className="mx-auto grid max-w-6xl grid-cols-3">
        {tabs.map((tab) => {
          const on = active(pathname, tab.href);
          return (
            <li key={tab.href}>
              <Link
                href={tab.href}
                className={`flex min-h-12 items-center justify-center px-1 py-3 text-center font-[family-name:var(--font-spartan)] text-[0.62rem] font-semibold uppercase tracking-[0.16em] ${on ? "text-navy" : "text-[#222]"}`}
              >
                {tab.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
