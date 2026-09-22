"use client";

import { useActionState } from "react";
import { deleteDocument, uploadDocument } from "@/app/actions/documents";
import { FormAlert } from "@/components/form-alert";
import { SubmitButton } from "@/components/submit-button";
import { DOCUMENT_KINDS } from "@/lib/constants";

export function UploadForm() {
  const [state, action] = useActionState(uploadDocument, {});
  return (
    <form action={action} className="space-y-4">
      <FormAlert state={state} />
      <label className="block space-y-1.5">
        <span className="hub-kicker">Kind</span>
        <select name="kind" className="h-11 w-full rounded-none border border-[#d7d0c2] bg-white px-3">
          {DOCUMENT_KINDS.map((kind) => (
            <option key={kind} value={kind}>
              {kind === "cv" ? "CV" : kind[0].toUpperCase() + kind.slice(1)}
            </option>
          ))}
        </select>
      </label>
      <label className="block space-y-1.5">
        <span className="hub-kicker">File</span>
        <input type="file" name="file" required className="block w-full text-sm" />
      </label>
      <SubmitButton>Upload</SubmitButton>
    </form>
  );
}

export function DeleteDocumentButton({ id }: { id: string }) {
  const [state, action] = useActionState(deleteDocument, {});
  return (
    <form action={action}>
      <FormAlert state={state} />
      <input type="hidden" name="id" value={id} />
      <SubmitButton variant="outline">Remove</SubmitButton>
    </form>
  );
}
