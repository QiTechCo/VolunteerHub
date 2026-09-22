"use client";

import { useActionState } from "react";
import { signupAction } from "@/app/actions/shifts";
import { FormAlert } from "@/components/form-alert";
import { SubmitButton } from "@/components/submit-button";

export function SignupForm({
  shiftId,
  roles,
}: {
  shiftId: string;
  roles: { slug: string; title: string; remaining: number }[];
}) {
  const [state, action] = useActionState(signupAction, {});
  return (
    <form action={action} className="space-y-4 border border-[#d7d0c2] bg-white p-5">
      <FormAlert state={state} />
      <input type="hidden" name="shiftId" value={shiftId} />
      <label className="block space-y-1.5">
        <span className="hub-kicker">Role</span>
        <select name="roleSlug" required className="h-11 w-full rounded-none border border-[#d7d0c2] bg-white px-3">
          {roles.map((role) => (
            <option key={role.slug} value={role.slug}>
              {role.title}
              {role.remaining === 0 ? " (waitlist)" : ` (${role.remaining} open)`}
            </option>
          ))}
        </select>
      </label>
      <SubmitButton>Sign up</SubmitButton>
      <p className="text-sm text-[#5c574c]">
        If the role is full, you are waitlisted in the order you signed up. A calendar
        invite can be downloaded from My shifts. Confirmation email is queued, not sent,
        in this beta.
      </p>
    </form>
  );
}
