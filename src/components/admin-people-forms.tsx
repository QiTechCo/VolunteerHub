"use client";

import { useActionState } from "react";
import {
  addStaffNoteAction,
  overrideHoursAction,
  setTrainingAction,
  setVolunteerStatusAction,
} from "@/app/actions/admin";
import { FormAlert } from "@/components/form-alert";
import { SubmitButton } from "@/components/submit-button";
import { inputClass, textareaClass } from "@/components/ui-copy";
import { ROLE_SLUGS, ROLE_COPY } from "@/lib/constants";

export function StatusForm({
  volunteerId,
  status,
}: {
  volunteerId: string;
  status: string;
}) {
  const [state, action] = useActionState(setVolunteerStatusAction, {});
  return (
    <form action={action} className="flex flex-wrap items-end gap-3">
      <FormAlert state={state} />
      <input type="hidden" name="volunteerId" value={volunteerId} />
      <select name="status" defaultValue={status} className={`${inputClass} w-40`}>
        <option value="active">Active</option>
        <option value="paused">Paused</option>
        <option value="blocked">Blocked</option>
      </select>
      <SubmitButton>Update status</SubmitButton>
    </form>
  );
}

export function NoteForm({ volunteerId }: { volunteerId: string }) {
  const [state, action] = useActionState(addStaffNoteAction, {});
  return (
    <form action={action} className="space-y-3">
      <FormAlert state={state} />
      <input type="hidden" name="volunteerId" value={volunteerId} />
      <textarea name="body" required className={textareaClass} />
      <SubmitButton>Add note</SubmitButton>
    </form>
  );
}

export function HoursOverrideForm({ volunteerId }: { volunteerId: string }) {
  const [state, action] = useActionState(overrideHoursAction, {});
  return (
    <form action={action} className="space-y-3">
      <FormAlert state={state} />
      <input type="hidden" name="volunteerId" value={volunteerId} />
      <input name="minutes" type="number" min={1} placeholder="Minutes" className={inputClass} />
      <input name="staffNote" placeholder="Why" className={inputClass} />
      <SubmitButton>Add confirmed hours</SubmitButton>
    </form>
  );
}

export function TrainingForm({
  volunteerId,
  trained,
}: {
  volunteerId: string;
  trained: string[];
}) {
  const [state, action] = useActionState(setTrainingAction, {});
  return (
    <div className="space-y-3">
      <FormAlert state={state} />
      {ROLE_SLUGS.map((slug) => (
        <form key={slug} action={action} className="flex items-center justify-between gap-3">
          <input type="hidden" name="volunteerId" value={volunteerId} />
          <input type="hidden" name="roleSlug" value={slug} />
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              name="enabled"
              defaultChecked={trained.includes(slug)}
              className="size-4 accent-[#222]"
            />
            {ROLE_COPY[slug].title}
          </label>
          <SubmitButton variant="outline">Save</SubmitButton>
        </form>
      ))}
    </div>
  );
}
