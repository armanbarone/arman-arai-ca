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
const WITHDRAW_FIRST = "this version withdrawn first, using the button above";

/**
 * The next thing a human has to do, when what is missing is not the studio's
 * to supply.
 *
 * Four of an agreement's required fields are the couple's own: where they get
 * ready, where they marry, where they eat and how many guests. On a fresh
 * draft they are always blank, because nobody has asked the couple yet, so the
 * publish button is always shut and used to explain itself only by naming four
 * fields as though the studio had forgotten to type them.
 */
function coupleStep(b: Awaited<ReturnType<typeof getBooking>>, key: string) {
  if (!b || !["agreement", "proposal"].includes(key)) return undefined;
  const intake = b.wedding?.intake;
  const theirs = ["preparationLocation", "ceremonyLocation", "receptionLocation", "guestCount"];
  const stillMissing = theirs.some((f) => !(b.fields[f] ?? "").trim());
  if (!stillMissing) return undefined;
  if (!intake || intake.status === "draft") {
    const invited = b.events.some((e) => e.type === "portal_invite_sent");
    return invited
      ? "the couple to fill in their own details: the venue, ceremony and reception spaces and the guest count are theirs, and they have not submitted them yet"
      : "the couple to fill in their own details, which they cannot do yet because their portal invitation has not been sent";
  }
  if (intake.status === "submitted")
    return "your approval of the details the couple submitted, on their Contract details page";
  return undefined;
}

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
  /* A document that is issued but that nobody has signed is still editable in
     every sense that matters: it just has to be withdrawn first, so the couple
     are never looking at a version that quietly changed underneath them. The
     editor used to show an empty form in that case, with a Publish button that
     refused, and no way back. It now opens on the issued wording and offers
     the withdrawal. */
  const issuedUnsigned = draft
    ? undefined
    : weddingData(b).documents.find(
        (d) =>
          d.templateKey === key &&
          ["issued", "partial"].includes(d.status) &&
          !d.deletedAt &&
          !d.signatures.some((sig) => sig.party === "client"),
      );
  const t = templateFor(key, b, draft?.amendment);

  return (
    <>
      <Link className="wp-back" href={`/admin/bookings/${ref}/documents`}>
        ← Document system
      </Link>
      <h1>{t.title}</h1>
      <p className="wp-lead">
        {t.companySigns
          ? "Fill in the exact details and publish. Every party is emailed a copy to read and sign, you get a copy too, and once the last signature is in it is binding and the completed PDF goes to everyone."
          : "Complete exact details. Save, open the review PDF, and publish the completed version."}
      </p>
      {issuedUnsigned && (
        <div className="wp-message">
          This {t.title.toLowerCase()} is already with the couple and neither of
          them has signed it. Withdraw it to make changes; they are told nothing
          until you publish the new version. The wording below is the version
          they currently hold.
          <div className="wp-toolbar">
            <WeddingDocumentAdminActions
              bookingRef={ref}
              documentId={issuedUnsigned.id}
              status={issuedUnsigned.status}
              clientSigned={false}
              expectedUpdatedAt={b.updatedAt}
            />
          </div>
        </div>
      )}
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
        key={draft?.id || issuedUnsigned?.id || `new-${key}`}
        template={t}
        initial={{
          ...defaultDocumentFields(t, b),
          ...(draft?.fields ?? issuedUnsigned?.fields),
        }}
        bookingRef={ref}
        admin
        draftId={draft?.id}
        initialDue={draft?.dueDate}
        canPublishChange={key !== "change" || !!draft?.amendment}
        blockedReason={issuedUnsigned ? WITHDRAW_FIRST : coupleStep(b, key)}
      />
    </>
  );
}
