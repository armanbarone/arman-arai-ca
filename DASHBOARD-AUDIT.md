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
