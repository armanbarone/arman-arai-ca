# Studio dashboard audit

Crawled 2026-10-15 against the live booking store, signed in as the owner.
Nineteen admin pages, every one loaded and inspected in a real browser.

## What is already sound

| check | result |
|---|---|
| HTTP status, all 19 pages | 200 |
| Console errors | 0 |
| Broken links from `/admin` | 0 |
| Broken images | 0 |
| Pages rendering an app error | 0 |
| Empty pages | 0 |
| Placeholder text left on screen (`undefined`, `NaN`, `[object Object]`) | 0 |
| Server actions with no UI wired to them | 0 |
| Data integrity: statuses, schedule sums, payments vs instalments, email casing | 0 problems |

The structure is not the problem. The faults below are ones a page-load check
cannot see, which is why they survived.

## Findings

### 1. A failed delivery is invisible where it matters — BROKEN

`deliveryError` is written onto a document when its signed PDF cannot be
emailed. It is rendered inside the booking's own document list
(`WeddingAdminDocuments`) and in the invoice list (`WeddingBilling`), and
**nowhere on the studio dashboard**.

On 14 October both clients signed `AA-CA-2027-072` and neither received their
contract. The PDF built correctly and sat in storage for a day. The only trace
was a `deliveryError` string two screens inside the booking, and the owner found
out when the client told him.

A document that was signed but never delivered is the single most urgent thing
that can happen in this system. It belongs at the top of the dashboard.

**Recommendation.** Add it to `studioDashboard()` as an overdue action, naming
the document and the booking, linking to the document list.

### 2. `/admin/clients` is a duplicate of `/admin` — TIDY

`app/admin/clients/page.tsx` is `export { default } from "../page"`. It renders
the whole studio dashboard a second time at a second URL. Nothing links to it;
the sidebar's "Weddings & clients" points at `/admin`.

Two URLs rendering one dashboard is how a dashboard starts feeling patched
together. It also means any future per-client view has to fight an existing
route for its name.

**Recommendation.** Redirect it to `/admin` rather than deleting it, so an old
bookmark still lands somewhere.

### 3. Eighty-five form controls carry no label — RISK

| page | unlabelled controls |
|---|---|
| Inquiries | 25 |
| Prepare revision | 30 |
| Settings | 30 |

Every checkbox, value box and stage dropdown in the inquiry table is a bare
control. Sighted use is fine because the column header explains it; a screen
reader reads twenty-five anonymous checkboxes, and so does any automated check.
The inquiry table is the worst of the three because its controls are the ones
that change money.

**Recommendation.** Label the inquiry table's controls, which are the newest
code and the easiest to put right. The revision and settings forms are older and
larger; note them rather than rewrite them in the same pass.

## Not findings

- Dynamic routes under `/admin/bookings/[ref]/…` show as unreferenced by a
  naive grep because their paths are built at runtime. They are reachable.
- `Clients` and `Studio home` reporting identical character counts is finding 2,
  not two separate pages coincidentally matching.

## Order of work

1. Failed deliveries on the dashboard. It has already cost a client email.
2. The duplicate route, which is a two-line change.
3. Labels on the inquiry table.

---

# Second pass: the dashboard as something to use

The first pass asked whether every page worked. This one asks whether the owner
can do the thing he came to do. The method was different too: a script walked
all nineteen admin pages signed in as the owner and listed every button, link
and form control on each, so a missing control shows up as an absence rather
than having to be imagined.

Absence is what it found. Nothing on these pages is broken. Things that should
be possible simply had no control attached to them.

## Findings

### 4. A hand-recorded payment was permanent — FIXED

`recordWeddingPayment` adds a receipt, adds to `paidCents` and flips the
instalment to paid. There was no counterpart. Type $1,795.50 against the wrong
instalment, or type 17955.00, and the booking's balance is wrong for the rest
of its life. There was no reversal anywhere in the codebase.

This is the worst of the set because it is silent. The schedule says paid, the
client's dashboard says paid, and the only way back was to edit storage by hand.

**Done.** `reverseWeddingPayment` removes the receipt, returns `paidCents`,
recomputes the instalment status from its due date, and drops a wedding back
from booked to signed if the reversal took the deposit with it. It refuses a
Stripe card charge outright: that is money that actually moved, so it gets
refunded in Stripe and the refund comes back on its own. A reason is required
and is written into the audit trail. It is on each row of Received payments.

### 5. The payment schedule could not gain or lose an instalment — FIXED

`saveWeddingSchedule` accepts between one and twelve instalments. The editor
rendered exactly the rows the package created and offered no way to add or
remove one. Going from three payments to two was impossible through the
dashboard, although the server had always allowed it.

**Done.** Add an instalment, and Remove this instalment per row. A row that has
taken money cannot be removed and says why, since a receipt points at it.

### 6. Buttons greyed themselves out without saying why — FIXED

Save payment schedule was `disabled={locked || pending || sum !== total}`. Three
separate reasons, no words. This is the same trap as the Publish & countersign
button: the dashboard knows exactly what is wrong and shows a grey rectangle.

**Done.** The editor lists its blockers in full, and the money one does the
arithmetic: "The instalments add up to $3,739.84; the contract is $4,986.45. The
difference is $1,246.61."

### 7. An inquiry's contact details could not be corrected — FIXED

The inquiry table could edit stage, consult, booked, value, booking reference,
wedding date, lost reason and notes. It could not edit the name, the partner's
name, the email, the phone or the source. A typo in an email address meant
deleting the inquiry, losing its message and its history, and retyping it.

**Done.** All five are editable in the detail panel. The email is validated and
lower-cased on the way in, which is the same casing bug that once stopped a
client receiving his login link.

### 8. "Remove this unsaved entry" removed saved entries too — FIXED

The operations workbook's remove button filtered the row out of state, and
saving the register wrote the shortened list. It always worked on saved
entries. The label said it did not, so it read as unusable for the only case
anyone cares about.

**Done.** It says Remove this entry, confirms when the row has content, and
says that saving the register is what makes it stick.

### 9. Void was a line of prose — FIXED

Cancelling an invoice sat behind a bare `<summary>Void this invoice`, with no
styling, so it read as a heading. It was also offered on an already-void
invoice.

**Done.** It reads Cancel this invoice, is styled as a control, states what
voiding does, explains that the reason field is mandatory, confirms, and is
gone once the invoice is void or paid.

## Checked and already fine

| could he…? | where |
|---|---|
| delete a test wedding | Delete on each row of the weddings table, guarded against anything with real history |
| delete a fake inquiry | per row, plus tick-boxes and a bulk delete |
| delete a follow-up | on the row in What needs you |
| withdraw a document | draft deletion, and withdrawal of an issued-but-unsigned one |
| remove a moodboard photo | Remove photo on each tile |
| cancel an invoice | finding 9 |
| archive rather than delete | archive and restore, with a reason |

`/admin/library` and `/admin/invoices` have no action buttons of their own and
that is correct: one is the source pack to read, the other an index that hands
off to the booking.

## Verified, not assumed

Every fix above was checked in a real browser against live booking data, not
inferred from the diff.

- Reverse appears on the receipt for `AA-CA-2027-072`.
- That wedding's schedule is locked and says the agreement is issued.
- A draft wedding shows four Remove this instalment buttons and Add an
  instalment; removing one produces the arithmetic above and disables the save.
- An inquiry's name and phone were edited through the UI, confirmed changed in
  storage, then restored to their original values.
- Receipts reconcile against the schedule across all three bookings: 0
  discrepancies.

One thing worth recording about the method. The first run of this verification
appeared to show the new controls missing. The server on port 3300 was
`next start`, a production server, which serves a build and never recompiles,
so for one round of checks I was testing the old code and reading it as a
defect in the new. The schedule-editor absences in findings 5 and 6 were found
by reading the component, not by trusting that screen.
