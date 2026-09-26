"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { loginAction } from "@/app/actions/auth";
import { FormAlert } from "@/components/form-alert";
import { SubmitButton } from "@/components/submit-button";
import { Field, inputClass } from "@/components/ui-copy";

export function LoginForm({ next }: { next?: string }) {
  const [state, action] = useActionState(loginAction, {});
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const fillVolunteer = () => {
    setEmail("maya.chen@volunteerhub.local");
    setPassword("Volunteer!26");
  };

  const fillStaff = () => {
    setEmail("coordinator@volunteerhub.local");
    setPassword("CharlotteHub!26");
  };

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
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="e.g. maya.chen@volunteerhub.local"
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
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={inputClass}
        />
      </Field>
      <SubmitButton className="w-full min-[480px]:w-auto">Log in</SubmitButton>

      <div className="mt-6 border-t border-[#d7d0c2] pt-4">
        <p className="hub-kicker text-xs text-navy mb-2">Demo Accounts (Click to Autofill)</p>
        <div className="space-y-2">
          <button
            type="button"
            onClick={fillVolunteer}
            className="w-full text-left bg-[#f7f3ea] hover:bg-[#ede7da] border border-[#d7d0c2] p-2.5 transition-colors cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-[#1e3a6e]">Maya Chen (Volunteer)</span>
              <span className="text-[10px] uppercase font-bold tracking-wider text-navy bg-white border border-[#d7d0c2] px-1.5 py-0.5">Click to fill</span>
            </div>
            <div className="text-[11px] text-[#555] font-mono mt-1">maya.chen@volunteerhub.local</div>
            <div className="text-[10px] text-[#888] font-mono">Password: Volunteer!26</div>
          </button>

          <button
            type="button"
            onClick={fillStaff}
            className="w-full text-left bg-[#f7f3ea] hover:bg-[#ede7da] border border-[#d7d0c2] p-2.5 transition-colors cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-[#1e3a6e]">Staff Coordinator (Director)</span>
              <span className="text-[10px] uppercase font-bold tracking-wider text-navy bg-white border border-[#d7d0c2] px-1.5 py-0.5">Click to fill</span>
            </div>
            <div className="text-[11px] text-[#555] font-mono mt-1">coordinator@volunteerhub.local</div>
            <div className="text-[10px] text-[#888] font-mono">Password: CharlotteHub!26</div>
          </button>
        </div>
      </div>

      <p className="text-sm">
        New volunteer?{" "}
        <Link href="/register" className="underline">
          Register
        </Link>
      </p>
    </form>
  );
}
