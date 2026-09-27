import Link from "next/link";
import { RoleHelpCards } from "@/components/role-help-cards";
import { prisma } from "@/lib/db";

export default async function HubHomePage() {
  const upcoming = await prisma.shift.count({
    where: { status: "published", visibility: "public", startsAt: { gte: new Date() } },
  });

  return (
    <div>
      <section className="border-b border-[#d7d0c2] bg-white">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 min-[641px]:grid-cols-[1.1fr_0.9fr] min-[641px]:items-center">
          <div>
            <p className="hub-kicker text-navy">Volunteer Hub</p>
            <h1 className="mt-4 text-3xl min-[641px]:text-4xl">
              Volunteers are a critical part of our campaign.
            </h1>
            <p className="mt-5 max-w-xl">
              A single, passionate volunteer can help more than the world&apos;s largest
              check. You can really make a difference.
            </p>
            <div className="mt-8 flex flex-col gap-3 min-[641px]:flex-row">
              <Link
                href="/register"
                className="hub-btn inline-flex h-12 items-center justify-center bg-[#222] px-6 text-white"
              >
                Register to volunteer
              </Link>
              <Link
                href="/shifts"
                className="hub-btn inline-flex h-12 items-center justify-center border border-[#222] px-6"
              >
                Open the shift board
              </Link>
            </div>
            <p className="mt-4 text-sm text-[#5c574c]">
              {upcoming === 0
                ? "Shifts will appear when the campaign publishes them."
                : `${upcoming} published shift${upcoming === 1 ? "" : "s"} on the board.`}{" "}
              <Link href="/install" className="underline">
                Install the app
              </Link>
              .
            </p>
          </div>
          <div className="border border-[#d7d0c2] bg-white p-6">
            <p className="hub-kicker">How to volunteer</p>
            <ol className="mt-4 list-decimal space-y-3 pl-5">
              <li>Create your volunteer account with your name, email, and a password.</li>
              <li>Complete the training modules and choose your preferred roles.</li>
              <li>Sign up for an upcoming shift on the shift board.</li>
              <li>Log and track your confirmed service hours on your dashboard.</li>
            </ol>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12">
        <p className="hub-kicker text-navy">Roles</p>
        <h2 className="mt-3 text-2xl">How you can help</h2>
        <RoleHelpCards />
      </section>
    </div>
  );
}
