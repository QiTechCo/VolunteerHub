"use client";

import { useActionState } from "react";
import Link from "next/link";
import { registerVolunteer } from "@/app/actions/auth";
import { FormAlert } from "@/components/form-alert";
import { SubmitButton } from "@/components/submit-button";
import { Field, inputClass } from "@/components/ui-copy";
import { ROLE_COPY, ROLE_SLUGS } from "@/lib/constants";

export function RegisterForm() {
  const [state, action] = useActionState(registerVolunteer, {});
  return (
    <form action={action} className="space-y-5">
      <FormAlert state={state} />
      <Field label="Name">
        <input name="name" required className={inputClass} />
      </Field>
      <Field label="Email">
        <input
          name="email"
          type="email"
          required
          autoComplete="email"
          className={inputClass}
        />
      </Field>
      <Field label="Password">
        <input
          name="password"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          className={inputClass}
        />
      </Field>
      <Field label="Phone" hint="Optional. Used by staff for shift reminders later.">
        <input name="phone" type="tel" className={inputClass} />
      </Field>
      <Field label="ZIP">
        <input name="zip" className={inputClass} />
      </Field>
      <fieldset className="space-y-2">
        <legend className="hub-kicker">Role preferences (optional)</legend>
        {ROLE_SLUGS.map((slug) => (
          <label key={slug} className="flex items-start gap-2 text-[17px]">
            <input
              type="checkbox"
              name={`role_${slug}`}
              className="mt-2 size-4 accent-[#222]"
            />
            <span>
              <strong>{ROLE_COPY[slug].title}.</strong> {ROLE_COPY[slug].description}
            </span>
          </label>
        ))}
      </fieldset>
      <label className="flex items-start gap-2">
        <input
          type="checkbox"
          name="sms_transactional"
          className="mt-2 size-4 accent-[#222]"
        />
        <span className="text-sm leading-6">
          Send me shift reminders by text if the campaign later uses THE COMMITTEE TO
          ELECT DIMPLE AJMERA SMS program (STOP, no more than 2/day). Email is the
          default in this beta.
        </span>
      </label>
      <SubmitButton className="w-full min-[480px]:w-auto">Create account</SubmitButton>
      <p className="text-sm">
        Already registered?{" "}
        <Link href="/login" className="underline">
          Log in
        </Link>
      </p>
    </form>
  );
}
