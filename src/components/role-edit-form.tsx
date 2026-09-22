"use client";

import { useActionState } from "react";
import { updateRoleCatalogAction } from "@/app/actions/admin";
import { FormAlert } from "@/components/form-alert";
import { SubmitButton } from "@/components/submit-button";
import { inputClass, textareaClass } from "@/components/ui-copy";

export function RoleEditForm({
  slug,
  description,
  trustLevel,
  requiresTraining,
}: {
  slug: string;
  description: string;
  trustLevel: string;
  requiresTraining: boolean;
}) {
  const [state, action] = useActionState(updateRoleCatalogAction, {});
  return (
    <form action={action} className="space-y-3">
      <FormAlert state={state} />
      <input type="hidden" name="slug" value={slug} />
      <textarea name="description" defaultValue={description} className={textareaClass} />
      <select name="trustLevel" defaultValue={trustLevel} className={inputClass}>
        <option value="low">Low trust — open signup</option>
        <option value="high">High trust — pending staff approval</option>
      </select>
      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          name="requiresTraining"
          defaultChecked={requiresTraining}
          className="size-4 accent-[#222]"
        />
        Requires a staff training flag before signup
      </label>
      <SubmitButton>Save role</SubmitButton>
    </form>
  );
}
