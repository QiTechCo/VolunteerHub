"use client";

import { useActionState } from "react";
import Link from "next/link";
import { loginAction } from "@/app/actions/auth";
import { FormAlert } from "@/components/form-alert";
import { SubmitButton } from "@/components/submit-button";
import { Field, inputClass } from "@/components/ui-copy";

export function LoginForm({ next }: { next?: string }) {
  const [state, action] = useActionState(loginAction, {});
  return (
    <form action={action} className="space-y-5">
      <FormAlert state={state} />
      {next ? <input type="hidden" name="next" value={next} /> : null}
      <Field label="Email">
        <input
          name="email"
          type="email"
          required
          autoComplete="email"
          className={inputClass}
        />
      </Field>
      <Field
        label="Password"
        hint="Email sign-in links are not enabled in this beta. Use the password on your account."
      >
        <input
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className={inputClass}
        />
      </Field>
      <SubmitButton className="w-full min-[480px]:w-auto">Log in</SubmitButton>
      <p className="text-sm">
        New volunteer?{" "}
        <Link href="/register" className="underline">
          Register
        </Link>
      </p>
    </form>
  );
}
