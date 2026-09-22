import { LoginForm } from "@/components/login-form";
import { PageShell } from "@/components/ui-copy";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const session = await getSession();
  if (session?.kind === "staff") redirect("/admin");
  if (session?.kind === "volunteer") redirect("/dashboard");
  const params = await searchParams;
  const next = typeof params.next === "string" ? params.next : undefined;
  return (
    <PageShell
      kicker="Account"
      title="Log in"
      description="Use the email on your Volunteer Hub account. Staff and volunteers share this page; you land on the desk that matches your account."
    >
      <div className="max-w-md border border-[#d7d0c2] bg-white p-6">
        <LoginForm next={next} />
      </div>
    </PageShell>
  );
}
