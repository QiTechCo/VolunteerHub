"use client";

import { useActionState } from "react";
import {
  saveShiftAction,
  setShiftStatusAction,
  staffAssignAction,
} from "@/app/actions/admin";
import { FormAlert } from "@/components/form-alert";
import { SubmitButton } from "@/components/submit-button";
import { Field, inputClass, textareaClass } from "@/components/ui-copy";
import { ROLE_COPY, ROLE_SLUGS } from "@/lib/constants";

export function ShiftForm({
  shift,
}: {
  shift?: {
    id: string;
    title: string;
    locationName: string;
    startsAtLocal: string;
    endsAtLocal: string;
    timezone: string;
    visibility: string;
    status: string;
    whatToBring: string | null;
    notes: string | null;
    registrationClosesLocal: string;
    caps: { roleSlug: string; capacity: number }[];
  };
}) {
  const [state, action] = useActionState(saveShiftAction, {});
  const capMap = new Map(shift?.caps.map((c) => [c.roleSlug, c.capacity]));
  return (
    <form action={action} className="space-y-5">
      <FormAlert state={state} />
      {shift ? <input type="hidden" name="id" value={shift.id} /> : null}
      <Field label="Title">
        <input name="title" required defaultValue={shift?.title} className={inputClass} />
      </Field>
      <Field label="Meeting point" hint="Neighborhood or public landmark. No home addresses.">
        <input
          name="locationName"
          required
          defaultValue={shift?.locationName}
          className={inputClass}
        />
      </Field>
      <Field label="Starts">
        <input
          type="datetime-local"
          name="startsAt"
          required
          defaultValue={shift?.startsAtLocal}
          className={inputClass}
        />
      </Field>
      <Field label="Ends">
        <input
          type="datetime-local"
          name="endsAt"
          required
          defaultValue={shift?.endsAtLocal}
          className={inputClass}
        />
      </Field>
      <Field label="Registration closes (optional)">
        <input
          type="datetime-local"
          name="registrationClosesAt"
          defaultValue={shift?.registrationClosesLocal}
          className={inputClass}
        />
      </Field>
      <input type="hidden" name="timezone" value={shift?.timezone ?? "America/New_York"} />
      <Field label="Visibility">
        <select name="visibility" defaultValue={shift?.visibility ?? "public"} className={inputClass}>
          <option value="public">Public board</option>
          <option value="private">Staff only</option>
        </select>
      </Field>
      <Field label="Status">
        <select name="status" defaultValue={shift?.status ?? "draft"} className={inputClass}>
          <option value="draft">Draft</option>
          <option value="published">Published</option>
          <option value="closed">Closed</option>
          <option value="canceled">Canceled</option>
        </select>
      </Field>
      <fieldset className="space-y-2">
        <legend className="hub-kicker">Seats by role</legend>
        {ROLE_SLUGS.map((slug) => (
          <label key={slug} className="flex flex-wrap items-center gap-3">
            <input
              type="checkbox"
              name={`role_${slug}`}
              defaultChecked={capMap.has(slug) || !shift}
              className="size-4 accent-[#222]"
            />
            <span className="w-40">{ROLE_COPY[slug].title}</span>
            <input
              type="number"
              min={1}
              name={`cap_${slug}`}
              defaultValue={capMap.get(slug) ?? 8}
              className={`${inputClass} w-24`}
            />
          </label>
        ))}
      </fieldset>
      <Field label="What to bring">
        <textarea name="whatToBring" defaultValue={shift?.whatToBring ?? ""} className={textareaClass} />
      </Field>
      <Field label="Staff notes">
        <textarea name="notes" defaultValue={shift?.notes ?? ""} className={textareaClass} />
      </Field>
      <SubmitButton>{shift ? "Save shift" : "Create shift"}</SubmitButton>
    </form>
  );
}

export function ShiftStatusForm({ id, status }: { id: string; status: string }) {
  const [state, action] = useActionState(setShiftStatusAction, {});
  return (
    <form action={action} className="flex flex-wrap gap-3">
      <FormAlert state={state} />
      <input type="hidden" name="id" value={id} />
      {["draft", "published", "closed", "canceled"]
        .filter((s) => s !== status)
        .map((s) => (
          <button
            key={s}
            name="status"
            value={s}
            className="hub-btn h-11 border border-[#222] px-4"
          >
            Mark {s}
          </button>
        ))}
    </form>
  );
}

export function AssignForm({
  shiftId,
  roles,
  volunteers,
}: {
  shiftId: string;
  roles: { slug: string; title: string }[];
  volunteers: { id: string; name: string; email: string }[];
}) {
  const [state, action] = useActionState(staffAssignAction, {});
  return (
    <form action={action} className="space-y-3">
      <FormAlert state={state} />
      <input type="hidden" name="shiftId" value={shiftId} />
      <select name="volunteerId" required className={inputClass}>
        <option value="">Volunteer</option>
        {volunteers.map((v) => (
          <option key={v.id} value={v.id}>
            {v.name} ({v.email})
          </option>
        ))}
      </select>
      <select name="roleSlug" required className={inputClass}>
        {roles.map((r) => (
          <option key={r.slug} value={r.slug}>
            {r.title}
          </option>
        ))}
      </select>
      <SubmitButton>Assign</SubmitButton>
    </form>
  );
}
