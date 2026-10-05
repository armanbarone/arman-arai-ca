"use client";
import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { signWeddingDocument } from "@/app/portal/wedding-actions";
import {
  ELECTRONIC_CONSENT,
  type WeddingDocument,
  type WeddingBlock,
} from "@/lib/portal/wedding";
import type { Booking } from "@/lib/portal/types";
import {
  documentSections,
  initialSectionsFor,
  initialsForName,
  normalizeInitials,
  validateInitials,
} from "@/lib/portal/document-sections";
import { useWeddingPreview } from "./WeddingPreviewProvider";
import Link from "next/link";
import { buttonCls, ghostButtonCls, StatusPill } from "./Shell";

export function WeddingBlockView({ blocks }: { blocks: WeddingBlock[] }) {
  return (
    <>
      {blocks.map((b, i) =>
        b.kind === "h" ? (
          <h2 key={i}>{b.text}</h2>
        ) : b.kind === "table" ? (
          <div className="wp-table-scroll" key={i}>
            <table>
              <tbody>
                {b.rows.map((row, j) => (
                  <tr key={j}>
                    {row.map((c, k) => (
                      <td key={k}>{c.text}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : b.kind === "question" ? (
          <p key={i}>{b.label}</p>
        ) : (
          <p key={i}>
            {b.kind === "check" ? "• " : ""}
            {b.text}
          </p>
        ),
      )}
    </>
  );
}
export default function WeddingDocumentReader({
  document: initial,
  booking,
  bookingRef,
  email,
  legalName,
  preview = false,
  admin = false,
}: {
  document: WeddingDocument;
  booking?: Booking;
  bookingRef: string;
  email: string;
  legalName?: string;
  preview?: boolean;
  admin?: boolean;
}) {
  const context = useWeddingPreview(),
    b = preview && context ? context.booking : booking;
  const d =
    preview && context
      ? context.booking.wedding?.documents.find((x) => x.id === initial.id) ||
        initial
      : initial;
  const activeEmail = preview && context ? context.email : email,
    activeName =
      b?.clients.find((c) => c.email === activeEmail)?.legalName || legalName;
  const [downloadUrl, setDownloadUrl] = useState("");
  useEffect(
    () => () => {
      if (downloadUrl) URL.revokeObjectURL(downloadUrl);
    },
    [downloadUrl],
  );
  const [initials, setInitials] = useState<Record<string, string>>({});
  useEffect(() => {
    setInitials({});
    setName("");
    setConsent(false);
    setMessage("");
    setError("");
  }, [activeEmail, d.id, d.hash]);
  const router = useRouter(),
    [step, setStep] = useState(0),
    [name, setName] = useState(""),
    [consent, setConsent] = useState(false),
    [answers, setAnswers] = useState<Record<string, string>>({
      portfolio: "private",
      paidAdvertising: "no",
      testimonial: "no",
      marketing: "no",
    }),
    [message, setMessage] = useState(""),
    [error, setError] = useState(""),
    [pending, start] = useTransition();
  const parts = useMemo(() => documentSections(d.blocks), [d.blocks]);
  const initialSections = initialSectionsFor(d),
    expectedInitials = initialsForName(activeName || ""),
    allInitialed = initialSections.every(
      (s) => normalizeInitials(initials[s.id] || "") === expectedInitials,
    );
  const detailsPending =
    ["agreement", "proposal"].includes(d.templateKey) &&
    b?.wedding?.intake &&
    b.wedding.intake.status !== "approved";
  const mine = d.signatures.find(
      (s) => s.party === "client" && s.email === activeEmail,
    ),
    canSign =
      !admin &&
      !!activeName &&
      d.requiredEmails.includes(activeEmail) &&
      !mine &&
      !detailsPending &&
      ["issued", "partial"].includes(d.status);
  const set = (key: string, value: string) =>
    setAnswers((a) => ({ ...a, [key]: value }));
  const sign = () => {
    setError("");
    if (preview && context) {
      try {
        const values = validateInitials(d, activeName || "", initials);
        if (
          !consent ||
          name.trim().toLowerCase() !== activeName?.trim().toLowerCase()
        )
          throw new Error(
            "Use your full legal name and consent before signing.",
          );
        context.update((next) => {
          const doc = next.wedding!.documents.find((x) => x.id === d.id)!;
          if (doc.signatures.some((x) => x.email === activeEmail)) return;
          doc.signatures.push({
            party: "client",
            email: activeEmail,
            legalName: activeName!,
            signedAt: new Date().toISOString(),
            consent: `SAMPLE ONLY. ${ELECTRONIC_CONSENT}`,
            hash: doc.hash || "sample-preview-hash",
            ip: "",
            userAgent: "",
            answers: { ...answers },
            initials: values,
          });
          doc.status = doc.requiredEmails.every((e) =>
            doc.signatures.some((s) => s.email === e),
          )
            ? "executed"
            : "partial";
        });
        setMessage(
          "Sample initials and signature recorded in this preview. No real contract or email was created.",
        );
      } catch (e) {
        setError(e instanceof Error ? e.message : "Check your initials.");
      }
      return;
    }
    start(async () => {
      try {
        const r = await signWeddingDocument(
          bookingRef,
          d.id,
          d.hash || "",
          name,
          consent,
          answers,
          initials,
        );
        if (!r.ok) {
          setError(r.error);
          return;
        }
        setMessage(r.message || "Signature recorded");
        router.refresh();
      } catch {
        setError(
          "Connection interrupted. Reload to check whether your signature was recorded before trying again.",
        );
      }
    });
  };
  const needsPrivacy = ["privacy", "agreement"].includes(d.templateKey),
    last = step === parts.length;
  return (
    <div className="wp-document">
      <div className="wp-heading-row">
        <div>
          <h1>{d.title}</h1>
          <p className="wp-lead">
            Version {d.version} · {bookingRef}
          </p>
        </div>
        <StatusPill status={d.status} />
      </div>
      <div className="wp-toolbar">
        {preview && d.templateKey === "agreement" && (
          <button
            className={ghostButtonCls}
            onClick={async () => {
              setError("");
              try {
                const r = await fetch("/portal/preview/pdf", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ document: d }),
                });
                if (!r.ok)
                  throw new Error("The practice PDF could not be created.");
                const url = URL.createObjectURL(await r.blob()),
                  link = window.document.createElement("a");
                link.href = url;
                setDownloadUrl(url);
                link.download = "sample-wedding-agreement.pdf";
                link.click();
                setMessage(
                  "Your practice PDF is ready. If your browser did not save it, open the generated PDF below.",
                );
              } catch (e) {
                setError(e instanceof Error ? e.message : "Try again.");
              }
            }}
          >
            Download{" "}
            {d.status === "executed" ? "completed practice" : "sample review"}{" "}
            PDF ↓
          </button>
        )}
        {!preview && (
          <a
            className={ghostButtonCls}
            href={`/api/portal/wedding-pdf?ref=${bookingRef}&id=${d.id}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            {d.status === "executed"
              ? "Download signed PDF"
              : "Save or print review copy"}{" "}
            ↓
          </a>
        )}
        <span className="wp-muted" style={{ fontSize: 14 }}>
          Questions or corrections?{" "}
          <a
            href="mailto:i@armanarai.com"
            style={{ textDecoration: "underline" }}
          >
            Ask Arman before signing
          </a>
          .
        </span>
      </div>
      {detailsPending && (
        <div className="wp-message">
          <h3>Complete your wedding details first</h3>
          <p>
            Your venues, personal details and collection need studio review
            before this version can be signed.
          </p>
          <Link
            className={buttonCls}
            href={
              preview
                ? "/portal/preview/agreement"
                : `/portal/${bookingRef}/agreement`
            }
          >
            Enter your contract details →
          </Link>
        </div>
      )}
      {d.templateKey === "agreement" && !detailsPending && (
        <div className="wp-toolbar">
          <Link
            href={
              preview
                ? "/portal/preview/agreement"
                : `/portal/${bookingRef}/agreement`
            }
          >
            Review your submitted wedding details →
          </Link>
        </div>
      )}
      {d.status === "draft" && (
        <div className="wp-message">
          Sample workflow preview. Arman completes and issues this record before
          signatures are available.
        </div>
      )}
      {parts.length > 1 && (
        <nav className="wp-reader-steps" aria-label="Document sections">
          {parts.map((p, i) => (
            <button
              key={i}
              onClick={() => setStep(i)}
              className={step === i ? "is-active" : ""}
              aria-current={step === i ? "step" : undefined}
            >
              {i + 1}. {p.title.replace(/^Part [A-D] /, "")}
            </button>
          ))}
          {canSign && (
            <button
              className={last ? "is-active" : ""}
              onClick={() => setStep(parts.length)}
            >
              Your signature
            </button>
          )}
        </nav>
      )}
      {!last && (
        <article className="wp-document-section">
          <WeddingBlockView blocks={parts[step]?.blocks || d.blocks} />
          {canSign && (
            <div className="wp-section-initial">
              <label
                className="wp-label"
                htmlFor={`initial-${parts[step]?.id}`}
              >
                Your initials for this section · {expectedInitials}
                <input
                  id={`initial-${parts[step]?.id}`}
                  className="wp-input wp-initial-input"
                  maxLength={30}
                  autoComplete="off"
                  value={initials[parts[step]?.id] || ""}
                  onChange={(e) =>
                    setInitials((old) => ({
                      ...old,
                      [parts[step].id]: e.target.value,
                    }))
                  }
                />
              </label>
              <p>
                {
                  Object.keys(initials).filter(
                    (id) =>
                      normalizeInitials(initials[id]) === expectedInitials,
                  ).length
                }{" "}
                of {initialSections.length} sections initialed
              </p>
            </div>
          )}
          <div className="wp-toolbar">
            {step > 0 && (
              <button
                className={ghostButtonCls}
                onClick={() => setStep((s) => s - 1)}
              >
                ← Previous section
              </button>
            )}
            {step < parts.length - 1 ? (
              <button
                className={buttonCls}
                onClick={() => setStep((s) => s + 1)}
              >
                Continue to next section →
              </button>
            ) : canSign ? (
              <button
                className={buttonCls}
                onClick={() => setStep(parts.length)}
              >
                Continue to your signature →
              </button>
            ) : null}
          </div>
        </article>
      )}
      {mine && (
        <div className="wp-message">
          Your signature was recorded on{" "}
          {new Date(mine.signedAt).toLocaleString("en-CA", {
            timeZone: "America/Vancouver",
          })}
          .{" "}
          {d.status === "executed"
            ? "Everyone has signed. Keep your completed PDF."
            : preview
              ? "Your partner still needs to add their practice signature. No real email is sent."
              : "Your partner still needs to sign. You’ll both receive the completed PDF afterward."}
        </div>
      )}
      {d.signatures.length > 0 && (
        <div className="wp-card">
          <h3>Signature record</h3>
          {d.signatures.map((s) => (
            <p key={s.email} style={{ marginTop: 12 }}>
              {s.legalName} ·{" "}
              {s.party === "company" ? "For Arasaka Inc." : "Client"} ·{" "}
              {new Date(s.signedAt).toLocaleString("en-CA", {
                timeZone: "America/Vancouver",
              })}
            </p>
          ))}
        </div>
      )}
      {canSign && last && (
        <div className="wp-signature">
          <h2>Sign as {activeName}</h2>
          <p className="wp-lead">
            You are signing for yourself. Your partner uses their own sign-in
            link.
          </p>
          <div className="wp-initial-checklist">
            <h3>Initial each section before signing</h3>
            <p>Enter {expectedInitials} after reviewing each section.</p>
            {initialSections.map((s, i) => (
              <div className="wp-initial-row" key={s.id}>
                <button className={ghostButtonCls} onClick={() => setStep(i)}>
                  {s.title} ↗
                </button>
                <label className="wp-label">
                  Initials · {s.title}
                  <input
                    className="wp-input wp-initial-input"
                    value={initials[s.id] || ""}
                    maxLength={30}
                    onChange={(e) =>
                      setInitials((old) => ({ ...old, [s.id]: e.target.value }))
                    }
                  />
                </label>
              </div>
            ))}
          </div>
          {needsPrivacy && (
            <>
              <fieldset className="wp-radio-set">
                <legend>Your optional publicity preference</legend>
                <p className="wp-muted" style={{ fontSize: 14 }}>
                  Choosing Private does not affect your price, service or
                  delivery.
                </p>
                {[
                  [
                    "private",
                    "Private — no identifiable portfolio or promotion",
                  ],
                  [
                    "portfolio_no_name",
                    "Portfolio and organic social — without my name",
                  ],
                  [
                    "portfolio_with_name",
                    "Portfolio and organic social — with an approved name",
                  ],
                ].map(([v, label]) => (
                  <label key={v}>
                    <input
                      type="radio"
                      name="portfolio"
                      value={v}
                      checked={answers.portfolio === v}
                      onChange={() => set("portfolio", v)}
                    />
                    {label}
                  </label>
                ))}
              </fieldset>
              {answers.portfolio === "portfolio_with_name" && (
                <label className="wp-label">
                  Approved first name or handle
                  <input
                    className="wp-input"
                    value={answers.approvedName || ""}
                    onChange={(e) => set("approvedName", e.target.value)}
                  />
                </label>
              )}
              {d.templateKey === "privacy" && (
                <>
                  <label className="wp-checkbox">
                    <input
                      type="checkbox"
                      checked={answers.crossBorderNotice === "read"}
                      onChange={(e) =>
                        set("crossBorderNotice", e.target.checked ? "read" : "")
                      }
                    />
                    I have read the data processing notice above and know how to
                    contact the studio about my information.
                  </label>
                  <label className="wp-label">
                    Privacy questions (optional)
                    <textarea
                      className="wp-input"
                      value={answers.questions || ""}
                      onChange={(e) => set("questions", e.target.value)}
                    />
                  </label>
                  {[
                    ["paidAdvertising", "Paid advertising"],
                    ["testimonial", "Attributed testimonials"],
                    ["marketing", "Optional promotional email or text"],
                  ].map(([key, label]) => (
                    <fieldset className="wp-radio-set" key={key}>
                      <legend>{label}</legend>
                      <label>
                        <input
                          type="radio"
                          name={key}
                          checked={answers[key] === "no"}
                          onChange={() => set(key, "no")}
                        />
                        No, I do not consent.
                      </label>
                      <label>
                        <input
                          type="radio"
                          name={key}
                          checked={answers[key] === "yes"}
                          onChange={() => set(key, "yes")}
                        />
                        Yes, within the specific permission recorded here.
                      </label>
                      {answers[key] === "yes" && key === "paidAdvertising" && (
                        <label className="wp-label">
                          Exact campaign, channels, territory and dates
                          <textarea
                            className="wp-input"
                            value={answers.advertisingScope || ""}
                            onChange={(e) =>
                              set("advertisingScope", e.target.value)
                            }
                          />
                        </label>
                      )}
                      {answers[key] === "yes" && key === "testimonial" && (
                        <label className="wp-label">
                          Approved testimonial name or handle
                          <input
                            className="wp-input"
                            value={answers.testimonialName || ""}
                            onChange={(e) =>
                              set("testimonialName", e.target.value)
                            }
                          />
                        </label>
                      )}
                    </fieldset>
                  ))}
                </>
              )}
            </>
          )}
          <label className="wp-checkbox">
            <input
              type="checkbox"
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
            />
            <span>{ELECTRONIC_CONSENT}</span>
          </label>
          <label className="wp-label" htmlFor="legal-signature">
            Your full legal name
          </label>
          <input
            id="legal-signature"
            autoComplete="name"
            className="wp-input"
            placeholder={activeName}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <p className="wp-muted" style={{ fontSize: 13, marginTop: 12 }}>
            Your section initials, typed name, authenticated email, document
            version and signing time form your signature record. The completed
            PDF includes each signer’s record.
          </p>
          <div className="wp-toolbar">
            <button
              className={buttonCls}
              disabled={
                pending ||
                !consent ||
                !allInitialed ||
                (d.templateKey === "privacy" &&
                  answers.crossBorderNotice !== "read") ||
                name.trim().toLowerCase() !== activeName!.trim().toLowerCase()
              }
              onClick={sign}
            >
              {pending ? "Recording signature…" : "Sign this document"}
            </button>
            <button className={ghostButtonCls} onClick={() => setStep(0)}>
              Review again
            </button>
          </div>
        </div>
      )}
      {downloadUrl && (
        <a
          className={ghostButtonCls}
          href={downloadUrl}
          download="sample-wedding-agreement.pdf"
          target="_blank"
          rel="noopener noreferrer"
        >
          Open generated practice PDF ↓
        </a>
      )}
      {message && (
        <div className="wp-message" role="status">
          {message}
        </div>
      )}
      {error && (
        <div className="wp-message wp-message-error" role="alert">
          {error}
        </div>
      )}
      {admin && (
        <div className="wp-message">
          Studio view. Client signatures can only be added through each client’s
          own authenticated account.
        </div>
      )}
    </div>
  );
}
