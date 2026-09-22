"use client";

import { useActionState } from "react";
import { cancelSignupAction } from "@/app/actions/shifts";
import { saveShiftFeedback } from "@/app/actions/profile";
import { FormAlert } from "@/components/form-alert";
import { SubmitButton } from "@/components/submit-button";
import { textareaClass } from "@/components/ui-copy";

export function CancelShiftButton({ assignmentId }: { assignmentId: string }) {
  const [state, action] = useActionState(cancelSignupAction, {});
  return (
    <form action={action} className="space-y-2">
      <FormAlert state={state} />
      <input type="hidden" name="assignmentId" value={assignmentId} />
      <SubmitButton variant="outline">Cancel this shift</SubmitButton>
    </form>
  );
}

export function FeedbackForm({
  assignmentId,
  defaultNote,
}: {
  assignmentId: string;
  defaultNote?: string | null;
}) {
  const [state, action] = useActionState(saveShiftFeedback, {});
  return (
    <form action={action} className="space-y-2">
      <FormAlert state={state} />
      <input type="hidden" name="assignmentId" value={assignmentId} />
      <textarea
        name="feedbackNote"
        defaultValue={defaultNote ?? ""}
        className={textareaClass}
        placeholder="Anything staff should know about this shift."
      />
      <SubmitButton variant="outline">Send thank-you note to staff</SubmitButton>
    </form>
  );
}
