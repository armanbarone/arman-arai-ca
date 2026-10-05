import Link from "next/link";
import { Card, Eyebrow, ghostButtonCls } from "./Shell";
export default function WeddingStudioGuide({
  bookingRef,
  preview = false,
}: {
  bookingRef?: string;
  preview?: boolean;
}) {
  const studio = preview ? "/portal/preview/admin" : "/admin";
  const base = preview
    ? studio
    : bookingRef
      ? `/admin/bookings/${bookingRef}`
      : null;
  const weddingLink = (path: string) => (base ? `${base}/${path}` : "/admin");
  const steps = [
    [
      "Check payments and email",
      "Open Payment settings. Verify invoice email is configured and connect the Canadian Stripe account if you want to offer cards. Interac receipts are confirmed manually after the transfer arrives.",
      `${studio}/payment-settings`,
      "Open payment settings",
    ],
    [
      "Create the wedding",
      "Choose New wedding. Enter both partners’ names and separate email addresses, the date, municipality and a starting website collection. The system creates a separate private wedding with proposal and service-agreement drafts.",
      preview ? `${studio}/new` : "/admin/bookings/new",
      "Create a wedding",
    ],
    [
      "Set the exact collection and quote",
      "Open Collection, pricing & details in that wedding. Customize coverage, inclusions, price lines, taxes and payment dates. Review the total before publishing. These saved amounts feed the proposal, agreement and invoices.",
      weddingLink("settings"),
      base ? "Customize this wedding" : "Choose a wedding",
    ],
    [
      "Invite the couple and choose their dashboard",
      "Open Client dashboard & access. Send each partner their own invitation. Set the welcome message, choose relevant optional planning sections, and add tasks and deadlines. The couple enters legal names, addresses, venues and timings in Your contract details.",
      weddingLink("portal"),
      base ? "Manage client dashboard" : "Choose a wedding",
    ],
    [
      "Review details, then publish and sign",
      "Review the couple’s submitted contract details and approve them. In Documents & signatures, complete and publish Proposal and scope. Wait for both partners to approve it. Then complete the Service agreement, fill every required field (use Not applicable for an unused item), enter your AA initials, Arman Arai signature and consent, and publish it. Each partner signs from their own account with the required initials. After the final signature, the completed PDF is saved and emailed to both partners.",
      weddingLink("documents"),
      base ? "Prepare documents" : "Choose a wedding",
    ],
    [
      "Plan the wedding together",
      "The couple saves their discovery, engagement and family-photo forms and uploads portraits and moodboard images. Review their answers in the wedding workspace; edit or mark them reviewed as needed. Prepare the creative brief, venues and permissions, final wedding plan and day summary when ready. Publish records that need the couple’s approval.",
      weddingLink(
        preview ? "booking#client-answers" : "#client-answers",
      ).replace("/#", "#"),
      base ? "Review client answers" : "Choose a wedding",
    ],
    [
      "Issue an invoice and record payment",
      "Open Invoices & payments. Choose an agreed instalment and issue the invoice. Both partners receive the PDF, amount, due date and a private payment link. Delivery failures have a retry control. Connected Stripe card payments update the balance through verified payment events. For Interac, check your bank and record the amount and reference; a client’s sent report is not a receipt.",
      weddingLink("payments"),
      base ? "Open invoices & payments" : "Choose a wedding",
    ],
    [
      "Deliver and close the wedding",
      "Add the gallery link, film link, delivery date and access expiry in the wedding workspace. Prepare the delivery acknowledgement and album proof approval when relevant. Keep the ten Operations workbook registers up to date. Use Client dashboard & access to complete, cancel or archive the wedding; archive closes access and can be restored.",
      preview ? `${studio}/booking` : base || "/admin",
      base ? "Open wedding workspace" : "Choose a wedding",
    ],
  ];
  return (
    <>
      <Eyebrow>Studio · Start here</Eyebrow>
      <h1>How to use your dashboard</h1>
      <p className="wp-lead">
        Run each wedding from its own workspace. The existing forms and document
        templates are reusable; fill them in, review them and publish when
        ready.
      </p>
      {preview && (
        <p className="wp-message">
          Practice preview: changes stay in this browser. No real signature,
          email or payment is created. Sign in to the live dashboard to manage
          clients.
        </p>
      )}
      <div className="wp-guide-grid">
        {steps.map(([title, detail, href, label], i) => (
          <Card key={title}>
            <Eyebrow>Step {i + 1}</Eyebrow>
            <h2>{title}</h2>
            <p>{detail}</p>
            <Link className={ghostButtonCls} href={href}>
              {label} →
            </Link>
          </Card>
        ))}
      </div>
      <Card className="wp-doc-section">
        <h2>Delete, withdraw or archive?</h2>
        <p>
          <strong>Delete draft</strong> moves a saved draft into Deleted drafts.
          Restore it to recover its contents, or prepare a fresh draft. Deleting
          a draft does not delete the couple or their other records.
        </p>
        <p>
          <strong>Withdraw unsigned version</strong> removes an issued document
          from the couple’s signing queue before either partner signs. Its
          stored version stays in the studio record.
        </p>
        <p>
          <strong>Signed records</strong> remain intact. Use a signed change
          order for agreed changes to a completed contract. Archive the wedding
          to close client access; archiving does not cancel or erase the signed
          agreement.
        </p>
      </Card>
      <Card className="wp-doc-section">
        <h2>What is integrated, and what is manual?</h2>
        <p>
          The supplied pack includes 15 client workflows, five private studio
          document templates, one system guide and the operations workbook.
          Client forms, approvals, initials and signatures, invoice PDFs, client
          payment pages, moodboard uploads and assigned tasks work inside the
          portal.
        </p>
        <p>
          You choose the relevant workflows, fill in studio records, review
          client answers and publish approvals. Planning submissions appear in
          the studio dashboard; they do not automatically write the creative
          brief or publish the final plan.
        </p>
        <p>
          Date-change and cancellation requests need your review. They do not
          automatically cancel a booking or issue a refund. Prepare the agreed
          change order when a completed contract needs a revision.
        </p>
        <p>
          The vendor call sheet, production plan, guest and minor consent, crew
          agreement and business compliance record are private editable studio
          records. Separate vendor, crew and guest invitation/signature accounts
          are not included. Maintain the workbook’s operating rows yourself;
          they are not automatically synchronized with every other record.
        </p>
        <p>
          Gallery and film delivery use links from your gallery/video host. The
          portal does not upload the full wedding gallery or operate an
          album-proof annotation service.
        </p>
        <p>
          You can use and customize each wedding’s existing documents without
          requesting new work. A brand new form, automatic action or connection
          to another service needs to be added to the system.
        </p>
        <Link
          className={ghostButtonCls}
          href={preview ? `${studio}/library` : "/admin/library"}
        >
          Explore every supplied document →
        </Link>
      </Card>
    </>
  );
}
