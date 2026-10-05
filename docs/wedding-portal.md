# Wedding portal

The private Canadian wedding portal uses Arasaka Inc. operating as Arman Arai. The .com portal was a design and code reference; its elopement terms, database and client accounts are not migrated.

## Client experience

The overview orders outstanding signatures, confirmed payment steps and planning forms. Documents, payments, planning and delivery each have their own navigation and clear status. Every partner signs from their own authenticated email; the studio cannot sign for a client. Typed signatures record the document hash, version, consent text, email, timestamp and request metadata. Optional publicity choices belong to each person and default to Private. Third-party consent is never inferred from the couple's signature.

Native forms preserve the supplied discovery, engagement, family and change-request questions. Drafts can be saved; shared-form updates use a revision check so a partner's changes cannot silently overwrite the other person's answers. Submitted answers appear in the studio workspace for review. Guest/minor, crew and vendor records remain studio-only; the portal does not authenticate those outside signers.

## Studio workflow

1. Create the couple's booking with distinct emails, exact coverage, tax and price lines.
2. The couple fills both partners' names, mailing details, event venue, preparation, ceremony, reception, timings and a requested website collection in Contract details. Draft/submission revisions protect newer partner changes. Review and approve their entries; this creates fresh proposal and agreement drafts, preserves completed records and withdraws obsolete unsigned versions. Customize the collection, price and exact deliverables in Booking details, then prepare and review the proposal. Publish and countersign it, then obtain both clients' acceptance.
3. Complete the agreement fields and review its saved PDF. Price and payment tables come from the booking; the accepted proposal and scope are attached to the exact issued snapshot. Publishing incomplete or stale documents is rejected.
4. Each partner initials every section and signs separately. Company initials and countersignature are required at issue. Initial requirements are included in the immutable document hash; completed PDFs include the section initials matrix and each signer's certificate. Completion stores the PDF privately and submits the same attachment to both partners and the studio using Resend. Delivery failures retain the signatures and appear as an admin action. Retry skips successful recipients and uses stable provider idempotency keys. Provider acceptance is recorded; inbox receipt is not claimed as independently verified.
5. Confirm Interac receipts in the payment workspace. A client's "sent" report does not count as money received. Duplicate references and overpayments are rejected. The date is reserved after the agreement is completed and the booking payment is confirmed.
6. Review planning answers, publish the creative/final dossier approvals, and manage the private operations registers imported from the workbook.
7. Prepare a structured change order for changes to issued commercial terms. The exact before/after scope, price, tax and revised balance are signed by the studio and both partners before the booking updates. Existing receipts are retained. A concurrent payment invalidates the outstanding change order. Reductions below money already received require a recorded refund/settlement process outside this revision flow.
8. Add secure gallery/film links and delivery dates. Complete the delivery and album approvals where contracted. Signing an older agreement never rewrites the stored PDF.

## Source provenance and limits

`lib/portal/wedding-templates.json` contains the 20 operational documents extracted from the supplied Canadian Wedding Client Document System. It retains source filenames and SHA-256 hashes. All 24 standard agreement clauses remain; template instructions and duplicate title tables are excluded from client views. Financial tables are generated from the actual booking. Each person's privacy answers are placed in the signature certificate instead of a shared editable preference field.

The complete 00 system guide is natively rendered from `lib/portal/wedding-source-guide.json`, with its source hash. The library accounts for all 21 Word documents: 15 client workflows, 5 private studio workflows and the system guide. Every client workflow is shown even before issue, with its current status.

`lib/portal/wedding-operations.json` contains the ten operational register definitions from the supplied workbook. Its Dashboard and Client Event tabs correspond to the native overview and booking record. No real client data or workbook sample rows are committed.

The source contains English documents only. Quebec agreements and Quebec change orders are blocked pending a reviewed French pack and language process. This is a source-completeness gate, not a claim of legal review. The studio still fills source-specific identity, coverage, deliverable and operational details before issue. Invoice records are prepared by the studio from the current ledger; this change does not add card processing, automatic reminders, externally authenticated guest/crew signatures or an automatic refund engine.

## Collections and creative planning

Signature (C$3,000), Legacy (C$4,200) and Photo + Film (C$5,900) are imported from the same `TIERS` catalogue used by the public website. Studio quotation fields remain editable before issue. New default payments match the website: 30% at booking, 35% at 60 days and 35% at 30 days before the wedding. Already-issued payment tables and signed PDFs are fixed snapshots.

Both partners can upload private profile photos and up to 24 moodboard images, with captions and shared creative notes. JPEG, PNG and WebP files are capped at 3 MB, decoded and re-encoded as WebP, with metadata stripped. Files remain in private Blob storage and are fetched through booking authorization. Removal is a private soft removal; one booking cannot read another's images.

## Configuration

Production uses the existing project's `BLOB_READ_WRITE_TOKEN`, `PORTAL_SECRET`, `RESEND_API_KEY` and `ADMIN_EMAILS`. `APP_URL` defaults to https://www.armanarai.ca. All booking files and PDF attachments remain in the private Blob store; non-production defaults to the `dev/` prefix. Do not use a production Blob prefix for development.

Magic links are single-use. Booking authorization is checked inside pages, PDF endpoints and mutations. Admin roles are rechecked against configured emails. Private routes carry no-store and noindex headers. Public-site typography keeps the same Jost family, self-hosted to avoid a Google font download failure during builds.

For a synthetic preview, set `PORTAL_DEMO=1` in a non-production environment and open `/portal/preview` or `/portal/preview/admin`. The preview uses fictitious couples. Editable details, studio approvals, forms, mock initials and signatures, and operations persist only in browser storage; uploaded preview images stay in IndexedDB. Client and studio tabs share the same local sample. A practice PDF exports the edited sample document and is marked SAMPLE / NON-BINDING on every page. The preview sends no email and creates no real booking, signature or payment. This flag is explicitly ignored in production and never bypasses real-booking authorization.

## Validation

Run `node --test scripts/wedding-portal.test.cjs scripts/wedding-auth.test.cjs`, `node scripts/test-wedding-booking.mjs`, `npx tsc --noEmit`, and `npm run build`. The action tests execute the real action code with explicit authentication, storage and email boundary doubles. They exercise document integrity, individual signatures and privacy, concurrency, receipts, schedule rounding, change application and email retry behavior. They do not send real email or prove inbox delivery.

Run `node scripts/wedding-pdf-qa.cjs` to produce a sample signed agreement under the checkout's parent directory. Inspect the resulting rendered PDF, including prices, legal clauses and the signature certificate. Fonts are bundled into deployed functions so server-action completion and admin delivery retries can generate the same PDF as the download endpoint.

The existing public-site test harness has unrelated failures: availability mocks omit the current pricing-request dependency, DateCheck refers to a retired route path, and tracking tests expect the previous Google account identifiers. Those public source files and harnesses are unchanged by this portal work.
