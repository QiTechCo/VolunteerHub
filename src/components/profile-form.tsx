"use client";

import { useActionState } from "react";
import { updateProfile } from "@/app/actions/profile";
import { FormAlert } from "@/components/form-alert";
import { SubmitButton } from "@/components/submit-button";
import { Field, inputClass } from "@/components/ui-copy";
import { ROLE_COPY, ROLE_SLUGS, WEEKDAYS } from "@/lib/constants";
import { formatPhone } from "@/lib/phone";

export function ProfileForm({
  volunteer,
}: {
  volunteer: {
    name: string;
    phone: string | null;
    zip: string | null;
    address: string | null;
    willingToHost: boolean;
    smsTransactionalOptIn: boolean;
    maxShiftsPerWeek: number | null;
    rolePrefs: { roleSlug: string }[];
    availability: { weekday: number; startLocal: string; endLocal: string }[];
  };
}) {
  const [state, action] = useActionState(updateProfile, {});
  const prefSet = new Set(volunteer.rolePrefs.map((p) => p.roleSlug));
  const availMap = new Map(volunteer.availability.map((a) => [a.weekday, a]));

  return (
    <form action={action} className="space-y-6">
      <FormAlert state={state} />
      <Field label="Name">
        <input name="name" defaultValue={volunteer.name} required className={inputClass} />
      </Field>
      <Field label="Phone">
        <input
          name="phone"
          defaultValue={formatPhone(volunteer.phone)}
          className={inputClass}
        />
      </Field>
      <Field label="ZIP">
        <input name="zip" defaultValue={volunteer.zip ?? ""} className={inputClass} />
      </Field>
      <Field
        label="Street address"
        hint="Staff only. Never shown on the public shift board."
      >
        <input name="address" defaultValue={volunteer.address ?? ""} className={inputClass} />
      </Field>
      <Field label="Max shifts per week" hint="Optional cap so we do not overbook you.">
        <input
          name="maxShiftsPerWeek"
          type="number"
          min={1}
          defaultValue={volunteer.maxShiftsPerWeek ?? ""}
          className={inputClass}
        />
      </Field>
      <fieldset className="space-y-2">
        <legend className="hub-kicker">Role preferences</legend>
        {ROLE_SLUGS.map((slug) => (
          <label key={slug} className="flex items-start gap-2">
            <input
              type="checkbox"
              name={`role_${slug}`}
              defaultChecked={prefSet.has(slug)}
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
          name="willingToHost"
          defaultChecked={volunteer.willingToHost}
          className="mt-2 size-4 accent-[#222]"
        />
        <span>Willing to host a house gathering. Staff will publish the host shift.</span>
      </label>
      <label className="flex items-start gap-2">
        <input
          type="checkbox"
          name="sms_transactional"
          defaultChecked={volunteer.smsTransactionalOptIn}
          className="mt-2 size-4 accent-[#222]"
        />
        <span>OK to text shift reminders on the committee SMS program later.</span>
      </label>
      <fieldset className="space-y-3">
        <legend className="hub-kicker">Availability</legend>
        {WEEKDAYS.map((label, weekday) => {
          const slot = availMap.get(weekday);
          return (
            <div key={weekday} className="grid gap-2 min-[641px]:grid-cols-[9rem_1fr_1fr] min-[641px]:items-center">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name={`avail_${weekday}`}
                  defaultChecked={Boolean(slot)}
                  className="size-4 accent-[#222]"
                />
                {label}
              </label>
              <input
                type="time"
                name={`avail_start_${weekday}`}
                defaultValue={slot?.startLocal ?? "09:00"}
                className={inputClass}
              />
              <input
                type="time"
                name={`avail_end_${weekday}`}
                defaultValue={slot?.endLocal ?? "17:00"}
                className={inputClass}
              />
            </div>
          );
        })}
      </fieldset>
      <SubmitButton>Save profile</SubmitButton>
    </form>
  );
}
