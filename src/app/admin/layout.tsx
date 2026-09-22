import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession, isStaff } from "@/lib/auth";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) redirect("/login?next=/admin");
  if (!isStaff(session)) {
    return children;
  }
  return (
    <div>
      <div className="border-b border-[#d7d0c2] bg-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-5 gap-y-2 px-4 py-3">
          <p className="hub-kicker text-navy">Coordinator desk</p>
          <span className="text-sm text-[#5c574c]">
            {session.name} · {session.role.replace("_", " ")}
          </span>
          <Link href="/" className="ml-auto text-sm underline">
            Public Hub
          </Link>
        </div>
      </div>
      {children}
    </div>
  );
}
