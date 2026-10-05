"use client";
import Link from "next/link";
import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { Booking } from "@/lib/portal/types";
import {
  contractIsLocked,
  initialContractDetails,
  missingContractDetails,
  contractDetailsSchema,
  WEDDING_COLLECTIONS,
  collectionFor,
  collectionBookingFields,
  applyContractDetails,
  type ContractDetails,
} from "@/lib/portal/contract-details";
import {
  defaultDocumentFields,
  templateFor,
  resolveBlocks,
} from "@/lib/portal/wedding";
import { PROVINCES, TIMEZONES } from "@/lib/portal/presets";
import {
  buildSchedule,
  todayInBusinessTz,
  computeTotals,
  formatCad,
} from "@/lib/portal/money";
import {
  saveWeddingContractDetails,
  approveWeddingContractDetails,
} from "@/app/portal/contract-actions";
import { useWeddingBooking, useWeddingPreview } from "./WeddingPreviewProvider";
import { buttonCls, ghostButtonCls } from "./Shell";

export default function WeddingContractDetails({
  booking,
  preview = false,
  admin = false,
  embedded = false,
}: {
  booking: Booking;
  preview?: boolean;
  admin?: boolean;
  embedded?: boolean;
}) {
  const b = useWeddingBooking(booking, preview),
    context = useWeddingPreview(),
    router = useRouter();
  const [v, setV] = useState<ContractDetails>(() => initialContractDetails(b)),
    [revision, setRevision] = useState(b.wedding?.intake?.updatedAt || null);
  const [dirty, setDirty] = useState(false),
    [message, setMessage] = useState(""),
    [error, setError] = useState(""),
    [pending, start] = useTransition();
  useEffect(() => {
    if (!dirty) {
      setV(initialContractDetails(b));
      setRevision(b.wedding?.intake?.updatedAt || null);
    }
  }, [b, dirty]);
  const locked = contractIsLocked(b),
    status = b.wedding?.intake?.status;
  const set = (key: keyof ContractDetails, value: string) => {
    setDirty(true);
    setV((old) => ({ ...old, [key]: value }));
  };
  const person = (i: number, key: string, value: string) => {
    setDirty(true);
    setV((old) => {
      const next = structuredClone(old);
      if (key.startsWith("address."))
        (next.people[i].address as Record<string, string>)[key.slice(8)] =
          value;
      else (next.people[i] as unknown as Record<string, string>)[key] = value;
      return next;
    });
  };
  function run(submit: boolean) {
    setError("");
    setMessage("");
    const parsed = contractDetailsSchema.safeParse(v);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message || "Check your details.");
      return;
    }
    if (submit && missingContractDetails(v).length) {
      setError(
        `Complete ${missingContractDetails(v).join(", ")}. Use Not applicable for a location you will not use.`,
      );
      return;
    }
    if (preview && context) {
      const updatedAt = new Date().toISOString();
      context.update((next) => {
        next.wedding!.intake = {
          values: parsed.data,
          status: submit ? "submitted" : "draft",
          updatedAt,
          actor: context.email,
        };
      });
      setRevision(updatedAt);
      setDirty(false);
      setMessage(
        submit
          ? "Sample details submitted. Open the studio preview to review them, then return here to initial and sign."
          : "Saved in this preview. No real booking or email was created.",
      );
      return;
    }
    start(async () => {
      try {
        const r = await saveWeddingContractDetails(
          b.ref,
          parsed.data,
          submit,
          revision,
        );
        if (!r.ok) {
          setError(r.error);
          return;
        }
        setRevision(r.updatedAt || null);
        setDirty(false);
        setMessage(r.message);
        router.refresh();
      } catch {
        setError(
          "Your entries remain here. Check your connection and try saving again.",
        );
      }
    });
  }
  function approve() {
    setError("");
    setMessage("");
    if (preview && context) {
      context.update((next) => {
        const intake = next.wedding!.intake!;
        applyContractDetails(next, intake.values);
        const tier = collectionFor(intake.values.collectionKey);
        if (tier) {
          next.packageKey = tier.slug;
          next.packageName = tier.name;
          const line = next.lines.find((l) => l.kind === "package")!;
          line.label = `${tier.name} — ${tier.coverage}`;
          line.cents = tier.price * 100;
          Object.assign(
            next.fields,
            collectionBookingFields(tier, intake.values.date),
          );
        }
        next.event.timezone = TIMEZONES[intake.values.province];
        next.totals = computeTotals(next.lines, next.taxes);
        next.schedule = buildSchedule(next, todayInBusinessTz());
        next.status = "draft";
        intake.status = "approved";
        intake.approvedAt = new Date().toISOString();
        intake.approvedBy = "studio@example.com";
        for (const d of next.wedding!.documents)
          if (
            ["proposal", "agreement"].includes(d.templateKey) &&
            !d.signatures.some((s) => s.party === "client")
          ) {
            d.status = "draft";
            d.signatures = [];
            d.fields = {
              ...d.fields,
              ...defaultDocumentFields(templateFor(d.templateKey, next), next),
            };
            d.blocks = resolveBlocks(
              templateFor(d.templateKey, next),
              d.fields,
            );
          }
      });
      setMessage(
        "Sample details approved. Customize Booking details, then prepare and publish the sample agreement in the document library.",
      );
      return;
    }
    start(async () => {
      const r = await approveWeddingContractDetails(b.ref, revision || "");
      if (!r.ok) setError(r.error);
      else {
        setMessage(r.message);
        router.refresh();
      }
    });
  }
  function input(
    key: keyof ContractDetails,
    label: string,
    type = "text",
    required = false,
  ) {
    return (
      <div className="wp-form-field">
        <label className="wp-label" htmlFor={`contract-${key}`}>
          {label}
          {required ? " *" : ""}
        </label>
        <input
          id={`contract-${key}`}
          className="wp-input"
          type={type}
          value={String(v[key])}
          maxLength={500}
          onChange={(e) => set(key, e.target.value)}
        />
      </div>
    );
  }
  const base = preview ? "/portal/preview" : `/portal/${b.ref}`;
  return (
    <div className="wp-contract-builder">
      {!embedded && (
        <>
          <p className="wp-eyebrow">Before you initial and sign</p>
          <h1>Your wedding details</h1>
          <p className="wp-lead">
            Add your names, venues and plans. Choose a collection, then Arman
            confirms the exact quote and agreement.
          </p>
        </>
      )}
      <div className="wp-message">
        {locked
          ? "Your signed agreement stays fixed. Use Cancellation or date change to request a revision."
          : status === "approved"
            ? "Your details are approved. Review the studio’s issued agreement before initialing and signing. Edits go back for review."
            : status === "submitted"
              ? "Your details are with Arman for review. He confirms the quote before you initial and sign."
              : "1. Complete your details  ·  2. Arman confirms your collection  ·  3. Each partner initials and signs"}
      </div>
      {locked && (
        <Link className={ghostButtonCls} href={`${base}/planning/request`}>
          Request a change →
        </Link>
      )}
      <fieldset disabled={locked || pending}>
        <section className="wp-card wp-builder-section">
          <h2>The two of you</h2>
          <p>
            Names and addresses appear on your agreement. Sign-in email
            addresses stay linked to each person’s account.
          </p>
          <div className="wp-form-grid" style={{ marginTop: 22 }}>
            {v.people.map((p, i) => (
              <div key={i} className="wp-person-fields">
                <h3>{i === 0 ? "Bride / partner 1" : "Groom / partner 2"}</h3>
                <p className="wp-muted">{b.clients[i].email}</p>
                {[
                  ["legalName", "Full legal name"],
                  ["preferredName", "Preferred name and pronouns"],
                  ["phone", "Phone"],
                  ["address.line1", "Mailing street address"],
                  ["address.line2", "Apartment or unit (optional)"],
                  ["address.city", "City"],
                  ["address.postalCode", "Postal code"],
                ].map(([key, label]) => (
                  <label className="wp-label" key={key}>
                    {label}
                    <input
                      className="wp-input"
                      value={
                        key.startsWith("address.")
                          ? (p.address as Record<string, string>)[key.slice(8)]
                          : (p as unknown as Record<string, string>)[key]
                      }
                      maxLength={500}
                      onChange={(e) => person(i, key, e.target.value)}
                    />
                  </label>
                ))}
                <label className="wp-label">
                  Province or territory of residence
                  <select
                    className="wp-input"
                    value={p.address.province}
                    onChange={(e) =>
                      person(i, "address.province", e.target.value)
                    }
                  >
                    {PROVINCES.map((p) => (
                      <option key={p.code} value={p.code}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            ))}
          </div>
        </section>
        <section className="wp-card wp-builder-section">
          <h2>Your event and locations</h2>
          <p>
            Add the venue name and full address. If you are not using a
            location, write “Not applicable”.
          </p>
          <div className="wp-form-grid" style={{ marginTop: 22 }}>
            {input("date", "Wedding date", "date", true)}
            {input("serviceDates", "All service dates (if more than one)")}
            {input("municipality", "Event municipality", "text", true)}
            <label className="wp-label">
              Event province or territory
              <select
                className="wp-input"
                value={v.province}
                onChange={(e) => set("province", e.target.value)}
              >
                {PROVINCES.map((p) => (
                  <option key={p.code} value={p.code}>
                    {p.name}
                  </option>
                ))}
              </select>
            </label>
            {input("eventVenue", "Main event venue and address", "text", true)}
            {input(
              "preparationLocation",
              "Preparation location and address",
              "text",
              true,
            )}
            {input(
              "ceremonyLocation",
              "Ceremony location and address",
              "text",
              true,
            )}
            {input(
              "receptionLocation",
              "Reception location and address",
              "text",
              true,
            )}
            {input("ceremonyTime", "Ceremony time")}
            {input("receptionTime", "Reception time")}
            {input("guestCount", "Estimated guest count")}
          </div>
        </section>
        <section className="wp-card wp-builder-section">
          <h2>Your photography collection</h2>
          <p>
            The same three collections offered on{" "}
            <a
              className="wp-inline-link"
              href="https://www.armanarai.ca/pricing"
              target="_blank"
              rel="noreferrer"
            >
              the website
            </a>
            . Canadian dollars, before tax and separately quoted travel. Arman
            can adjust your exact coverage, deliverables and quote before you
            sign.
          </p>
          <div className="wp-collection-grid">
            {WEDDING_COLLECTIONS.map((t) => (
              <label
                key={t.slug}
                className={`wp-collection ${v.collectionKey === t.slug ? "is-selected" : ""}`}
              >
                <span className="wp-collection-choice">
                  <input
                    type="radio"
                    name="contract-collection"
                    checked={v.collectionKey === t.slug}
                    onChange={() => set("collectionKey", t.slug)}
                  />
                  {t.name}
                </span>
                <strong>{formatCad(t.price * 100)}</strong>
                <p>{t.coverage}</p>
                <details>
                  <summary>Everything included</summary>
                  <ul>
                    {t.includes.map((line) => (
                      <li key={line}>{line}</li>
                    ))}
                  </ul>
                </details>
              </label>
            ))}
          </div>
          {v.collectionKey === "custom" && (
            <p className="wp-message">
              Your studio-prepared custom quote is selected. You can request one
              of the published collections above.
            </p>
          )}
          <label className="wp-label">
            Coverage, additions or changes you would like to discuss
            <textarea
              className="wp-input"
              rows={3}
              maxLength={4000}
              value={v.requests}
              onChange={(e) => set("requests", e.target.value)}
              placeholder="For example, a different start time, an extra location or an album upgrade"
            />
          </label>
        </section>
      </fieldset>
      {!locked && (
        <div className="wp-sticky-actions">
          <p>
            {dirty
              ? "You have unsaved details."
              : "Save now and finish together later."}
          </p>
          <div className="wp-toolbar">
            <button
              className={ghostButtonCls}
              disabled={pending}
              onClick={() => run(false)}
            >
              Save details
            </button>
            <button
              className={buttonCls}
              disabled={pending}
              onClick={() => run(true)}
            >
              {pending
                ? "Saving…"
                : admin
                  ? "Save for review"
                  : "Send details to Arman →"}
            </button>
          </div>
        </div>
      )}
      {admin && status === "submitted" && !dirty && !locked && (
        <div className="wp-card wp-builder-section">
          <h2>Studio review</h2>
          <p>
            Confirm the couple’s entries, then customize the exact coverage,
            inclusions, price lines and taxes before publishing the documents.
          </p>
          <button className={buttonCls} disabled={pending} onClick={approve}>
            Approve details and prepare drafts
          </button>
        </div>
      )}
      {admin && status === "approved" && (
        <div className="wp-toolbar">
          <Link
            className={buttonCls}
            href={
              preview
                ? `${base}/admin/settings`
                : `/admin/bookings/${b.ref}/settings`
            }
          >
            Customize collection and quote →
          </Link>
          <Link
            className={ghostButtonCls}
            href={
              preview
                ? `${base}/admin/documents`
                : `/admin/bookings/${b.ref}/documents`
            }
          >
            Prepare documents →
          </Link>
        </div>
      )}
      {message && (
        <div role="status" className="wp-message">
          {message}
        </div>
      )}
      {error && (
        <div role="alert" className="wp-message wp-message-error">
          {error}
        </div>
      )}
      {preview && (
        <p className="wp-muted">
          Practice preview only. These entries stay in this browser preview; no
          real agreement or email is created.
        </p>
      )}
    </div>
  );
}
