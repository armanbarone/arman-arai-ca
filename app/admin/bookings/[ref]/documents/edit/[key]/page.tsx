import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getBooking } from "@/lib/portal/store";
import {
  WEDDING_TEMPLATES,
  templateFor,
  weddingData,
  defaultDocumentFields,
  commercialFingerprint,
} from "@/lib/portal/wedding";
import { sha256Hex } from "@/lib/portal/token";
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

  /* The agreement cannot be issued until an accepted proposal exists and still
     matches the booking's commercial terms. That was only discovered on
     pressing Publish, after the whole contract had been filled in, and the
     message named no place to go. It is said here instead, before the work. */
  let proposalNotice: { text: string; cta: string } | null = null;
  if (key === "agreement") {
    const accepted = weddingData(b)
      .documents.filter((d) => d.templateKey === "proposal" && d.status === "executed")
      .at(-1);
    if (!accepted) {
      const open = weddingData(b).documents.find(
        (d) => d.templateKey === "proposal" && d.status !== "executed" && !d.deletedAt,
      );
      proposalNotice = {
        text: open
          ? `The proposal is ${open.status} and both clients have to accept it before this agreement can be issued. Everything here can be filled in and saved meanwhile.`
          : "This agreement is issued with the accepted proposal attached as its appendix, so the proposal has to be published and signed by both clients first. You can fill this in and save it meanwhile.",
        cta: open ? "Open the proposal" : "Write the proposal",
      };
    } else if (accepted.bookingHash !== (await sha256Hex(commercialFingerprint(b)))) {
      proposalNotice = {
        text: "The accepted proposal no longer matches this booking's dates, price or payment schedule. Issue a fresh proposal and have both clients accept it before issuing the agreement.",
        cta: "Issue a new proposal",
      };
    }
  }
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
      {proposalNotice && (
        <div className="wp-message">
          {proposalNotice.text}{" "}
          <Link className="wp-back" href={`/admin/bookings/${ref}/documents/edit/proposal`}>
            {proposalNotice.cta} →
          </Link>
        </div>
      )}
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
        blockedReason={proposalNotice ? "an accepted proposal from both clients" : undefined}
      />
    </>
  );
}
