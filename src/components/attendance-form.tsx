"use client";

import { useActionState } from "react";
import { attendanceAction } from "@/app/actions/admin";
import { FormAlert } from "@/components/form-alert";
import { SubmitButton } from "@/components/submit-button";
import { inputClass } from "@/components/ui-copy";

export function AttendanceForm({
  assignmentId,
  status,
}: {
  assignmentId: string;
  status: string;
}) {
  const [state, action] = useActionState(attendanceAction, {});
  return (
    <form action={action} className="flex flex-wrap items-center gap-2">
      <FormAlert state={state} />
      <input type="hidden" name="assignmentId" value={assignmentId} />
      <select name="status" defaultValue={status} className={`${inputClass} w-44`}>
        <option value="registered">Registered</option>
        <option value="confirmed">Confirmed</option>
        <option value="completed">Completed</option>
        <option value="no_show">No-show</option>
        <option value="canceled">Canceled</option>
      </select>
      <SubmitButton>Save</SubmitButton>
    </form>
  );
}
