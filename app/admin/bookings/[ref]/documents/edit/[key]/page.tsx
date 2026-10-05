import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getBooking } from "@/lib/portal/store";
import {
  WEDDING_TEMPLATES,
  templateFor,
  weddingData,
  defaultDocumentFields,
} from "@/lib/portal/wedding";
import NativeWeddingForm from "@/components/portal/NativeWeddingForm";
import WeddingDocumentAdminActions from "@/components/portal/WeddingDocumentAdminActions";
import WeddingDeletedDrafts from "@/components/portal/WeddingDeletedDrafts";
export default async function Editor({
  params,
}: {
  params: Promise<{ ref: string; key: string }>;
}) {
  const { ref, key } = await params,
    b = await getBooking(ref);
  if (!b) notFound();
  if (!WEDDING_TEMPLATES.some((t) => t.key === key)) notFound();
  if (key === "invoice") redirect(`/admin/bookings/${ref}/payments`);
  const draft = weddingData(b).documents.find(
    (d) => d.templateKey === key && d.status === "draft",
  );
  const t = templateFor(key, b, draft?.amendment);
  return (
    <>
      <Link className="wp-back" href={`/admin/bookings/${ref}/documents`}>
        ← Document system
      </Link>
      <h1>{t.title}</h1>
      <p className="wp-lead">
        Complete exact details. Save, open the review PDF, and publish the
        completed version.
      </p>
      {draft && (
        <div className="wp-toolbar">
          <WeddingDocumentAdminActions
            bookingRef={ref}
            documentId={draft.id}
            status={draft.status}
            clientSigned={false}
            expectedUpdatedAt={b.updatedAt}
          />
        </div>
      )}
      <WeddingDeletedDrafts booking={b} templateKey={key} />
      {key === "change" && !draft?.amendment && (
        <div className="wp-message">
          Prepare the exact booking revision before publishing this change
          order.{" "}
          <Link className="wp-back" href={`/admin/bookings/${ref}/amend`}>
            Prepare revision →
          </Link>
        </div>
      )}
      <NativeWeddingForm
        key={draft?.id || `new-${key}`}
        template={t}
        initial={{ ...defaultDocumentFields(t, b), ...draft?.fields }}
        bookingRef={ref}
        admin
        draftId={draft?.id}
        initialDue={draft?.dueDate}
        canPublishChange={key !== "change" || !!draft?.amendment}
      />
    </>
  );
}
