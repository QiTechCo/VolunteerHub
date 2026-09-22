import { requireVolunteer } from "@/app/actions/auth";
import { DeleteDocumentButton, UploadForm } from "@/components/document-forms";
import { EmptyState, PageShell } from "@/components/ui-copy";
import { prisma } from "@/lib/db";
import { BASE_PATH } from "@/lib/constants";
import { formatInZone } from "@/lib/datetime";

export default async function DocumentsPage() {
  const session = await requireVolunteer();
  const docs = await prisma.document.findMany({
    where: { volunteerId: session.id },
    orderBy: { uploadedAt: "desc" },
  });

  return (
    <PageShell
      kicker="Documents"
      title="Resume, CV, bio"
      description="PDF, Word, or plain text, 5 MB or smaller. Staff can open these from your people record. No virus scan in this beta."
    >
      <div className="grid gap-8 min-[641px]:grid-cols-2">
        <div className="border border-[#d7d0c2] bg-white p-5">
          <h2 className="text-lg">Upload</h2>
          <div className="mt-4">
            <UploadForm />
          </div>
        </div>
        <div>
          {docs.length === 0 ? (
            <EmptyState
              title="No documents yet"
              body="Add a resume, CV, or short bio if staff asked for one. Waivers are not collected here yet."
            />
          ) : (
            <ul className="space-y-3">
              {docs.map((doc) => (
                <li key={doc.id} className="border border-[#d7d0c2] bg-white p-4">
                  <p className="hub-kicker">{doc.kind}</p>
                  <p className="mt-1">{doc.filename}</p>
                  <p className="text-sm text-[#5c574c]">{formatInZone(doc.uploadedAt)}</p>
                  <div className="mt-3 flex gap-3">
                    <a
                      href={`${BASE_PATH}/api/documents/${doc.id}`}
                      className="underline"
                    >
                      Download
                    </a>
                    <DeleteDocumentButton id={doc.id} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </PageShell>
  );
}
