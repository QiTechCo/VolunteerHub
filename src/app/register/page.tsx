import { RegisterForm } from "@/components/register-form";
import { PageShell } from "@/components/ui-copy";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function RegisterPage() {
  const session = await getSession();
  if (session?.kind === "staff") redirect("/admin");
  if (session?.kind === "volunteer") redirect("/dashboard");
  return (
    <PageShell
      kicker="Account"
      title="Register to volunteer"
      description="Short signup. Add availability and documents after you are in. Email is your account key."
    >
      <div className="max-w-lg border border-[#d7d0c2] bg-white p-6">
        <RegisterForm />
      </div>
    </PageShell>
  );
}
