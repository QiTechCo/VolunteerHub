import Link from "next/link";
import {
  Footprints,
  Handshake,
  House,
  MessageSquare,
  Phone,
  Signpost,
  type LucideIcon,
} from "lucide-react";
import { ROLE_COPY, ROLE_SLUGS, type RoleSlug } from "@/lib/constants";

const ROLE_ICONS: Record<RoleSlug, LucideIcon> = {
  canvassing: Footprints,
  poll_greeting: Handshake,
  sign_posting: Signpost,
  event_hosting: House,
  phone_banking: Phone,
  text_banking: MessageSquare,
};

export function RoleHelpCards() {
  return (
    <div className="mt-8 grid gap-4 min-[641px]:grid-cols-2">
      {ROLE_SLUGS.map((slug) => {
        const Icon = ROLE_ICONS[slug];
        return (
          <Link
            key={slug}
            href={`/shifts?role=${slug}`}
            className="border border-[#d7d0c2] bg-white p-5 hover:border-[#222]"
          >
            <div className="flex items-start gap-4">
              <span
                className="flex size-32 shrink-0 items-center justify-center bg-[#f7f3ea] text-navy"
                aria-hidden
              >
                <Icon className="size-16" strokeWidth={1.5} />
              </span>
              <div className="min-w-0">
                <h3 className="text-base">{ROLE_COPY[slug].title}</h3>
                <p className="mt-2 normal-case tracking-normal">
                  {ROLE_COPY[slug].description}
                </p>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
