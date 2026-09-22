import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-xl px-4 py-16 text-center">
      <p className="hub-kicker text-navy">Not found</p>
      <h1 className="mt-3 text-2xl">That Volunteer Hub page is not here</h1>
      <p className="mt-4">The shift may be private, unpublished, or the link is wrong.</p>
      <Link href="/" className="hub-btn mt-6 inline-flex h-11 items-center bg-[#222] px-5 text-white">
        Hub home
      </Link>
    </div>
  );
}
