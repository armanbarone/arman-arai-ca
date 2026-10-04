"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  saveWeddingDraft,
  issueWeddingDocument,
  saveWeddingForm,
} from "@/app/portal/wedding-actions";
import {
  templateFields,
  missingDocumentFields,
  type WeddingTemplate,
  type WeddingBlock,
} from "@/lib/portal/wedding";
import { buttonCls, ghostButtonCls } from "./Shell";

export default function NativeWeddingForm({
  template: t,
  initial,
  bookingRef,
  admin = false,
  preview = false,
  draftId,
  initialDue = "",
  initialUpdatedAt = null,
  canPublishChange = true,
}: {
  template: WeddingTemplate;
  initial: Record<string, string>;
  bookingRef: string;
  admin?: boolean;
  preview?: boolean;
  draftId?: string;
  initialDue?: string;
  initialUpdatedAt?: string | null;
  canPublishChange?: boolean;
}) {
  const [updatedAt, setUpdatedAt] = useState(initialUpdatedAt);
  const router = useRouter(),
    [fields, setFields] = useState(initial),
    [due, setDue] = useState(initialDue),
    [name, setName] = useState(""),
    [consent, setConsent] = useState(false),
    [message, setMessage] = useState(""),
    [error, setError] = useState(""),
    [pending, start] = useTransition(),
    [dirty, setDirty] = useState(false);
  const specs = templateFields(t),
    remaining = missingDocumentFields(t, fields);
  const groups: { title: string; blocks: WeddingBlock[] }[] = [
    { title: "Project details", blocks: [] },
  ];
  for (const b of t.blocks) {
    if (b.kind === "h") groups.push({ title: b.text, blocks: [] });
    else groups.at(-1)!.blocks.push(b);
  }
  const set = (id: string, value: string) => {
    setFields((f) => ({ ...f, [id]: value }));
    setDirty(true);
  };
  async function run(mode: "save" | "submit" | "issue") {
    setError("");
    setMessage("");
    if (preview) {
      setMessage(
        "Sample saved in this preview only. No record or email was created.",
      );
      setDirty(false);
      return;
    }
    start(async () => {
      try {
        if (admin) {
          const r = await saveWeddingDraft(bookingRef, t.key, fields, due);
          if (!r.ok) {
            setError(r.error);
            return;
          }
          if (mode === "issue") {
            const x = await issueWeddingDocument(
              bookingRef,
              r.id!,
              name,
              consent,
              r.revision!,
            );
            if (!x.ok) {
              setError(x.error);
              return;
            }
            setMessage(x.message || "Issued");
          } else {
            setMessage("Draft saved. Review the saved copy before publishing.");
          }
        } else {
          const r = await saveWeddingForm(
            bookingRef,
            t.key,
            fields,
            mode === "submit",
            updatedAt,
          );
          if (!r.ok) {
            setError(r.error);
            return;
          }
          setMessage(r.message || "Saved");
          setUpdatedAt(r.updatedAt || null);
        }
        setDirty(false);
        router.refresh();
      } catch {
        setError(
          "The connection was interrupted. Your answers remain on this screen. Try saving again.",
        );
      }
    });
  }
  function field(id: string, label: string, hint?: string) {
    const required = admin && specs.find((f) => f.id === id)?.required;
    return (
      <div className="wp-form-field" key={id}>
        <label htmlFor={id} className="wp-label">
          {label
            .replace(/\[[^\]]*\]/g, "")
            .replace(/☐/g, "")
            .trim()}
          {required ? " *" : ""}
        </label>
        <textarea
          id={id}
          className="wp-input"
          value={fields[id] || ""}
          onChange={(e) => set(id, e.target.value)}
          rows={2}
          placeholder={
            admin
              ? "Enter exact details, or state Not included / Not applicable"
              : "Add details when you know them"
          }
        />
        {admin && hint && <small>Source field: {hint}</small>}
      </div>
    );
  }
  return (
    <div>
      <div className="wp-message">
        {admin
          ? `${remaining.length} required fields remain. Unused items must explicitly say Not included or Not applicable. Issued records cannot be silently edited.`
          : "Your answers are private to your booking and the studio. Share only details that help us plan your wedding."}
      </div>
      {groups
        .filter((g) => g.blocks.length)
        .map((g, gi) => (
          <details className="wp-form-section" key={gi} open={gi === 0}>
            <summary>{g.title}</summary>
            <div className="wp-form-body">
              {g.blocks.map((b, bi) =>
                b.kind === "question" ? (
                  <div className="wp-record-row" key={bi}>
                    {field(b.id, b.label, b.hint)}
                  </div>
                ) : b.kind === "table" ? (
                  <div key={bi}>
                    {b.id.startsWith("calculated") ? (
                      <div className="wp-table-wrap">
                        <table className="wp-table">
                          <tbody>
                            {b.rows.map((row, ri) => (
                              <tr key={ri}>
                                {row.map((c, ci) => (
                                  <td key={ci}>{c.text}</td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                        <p className="wp-muted">
                          Calculated from the booking and payment records. Edit
                          the booking details to change these amounts before
                          issuing.
                        </p>
                      </div>
                    ) : null}
                    {b.rows.map((row, ri) => {
                      const inputs = row.filter((c) => c.id);
                      if (!inputs.length) return null;
                      return (
                        <div className="wp-record-row" key={ri}>
                          <h3>{row[0].id ? `Entry ${ri + 1}` : row[0].text}</h3>
                          <div className="wp-form-grid">
                            {inputs.map((c) => field(c.id!, c.label!, c.hint))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : b.kind === "check" ? (
                  ["form", "request", "internal"].includes(t.action) && b.id ? (
                    <label className="wp-checkbox" key={bi}>
                      <input
                        type="checkbox"
                        checked={fields[b.id] === "yes"}
                        onChange={(e) =>
                          set(b.id!, e.target.checked ? "yes" : "no")
                        }
                      />
                      {b.text}
                    </label>
                  ) : (
                    <p
                      className="wp-muted"
                      style={{ marginBottom: 12 }}
                      key={bi}
                    >
                      • {b.text}
                    </p>
                  )
                ) : b.kind === "p" ? (
                  <p className="wp-muted" style={{ marginBottom: 16 }} key={bi}>
                    {b.text}
                  </p>
                ) : null,
              )}
            </div>
          </details>
        ))}
      {admin && (
        <div className="wp-card">
          <label className="wp-label" htmlFor="doc-due">
            Review deadline (optional)
          </label>
          <input
            id="doc-due"
            type="date"
            className="wp-input"
            value={due}
            onChange={(e) => setDue(e.target.value)}
          />
          {t.companySigns && (
            <>
              <label
                className="wp-label"
                htmlFor="company-name"
                style={{ marginTop: 20 }}
              >
                Countersign as Arman Arai for Arasaka Inc.
              </label>
              <input
                id="company-name"
                className="wp-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Arman Arai"
              />
              <label className="wp-checkbox">
                <input
                  type="checkbox"
                  checked={consent}
                  onChange={(e) => setConsent(e.target.checked)}
                />
                I reviewed the complete document and intend my typed name to be
                the Company’s electronic signature when I issue it.
              </label>
            </>
          )}
        </div>
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
      <div className="wp-sticky-actions">
        <p>
          {dirty
            ? "You have unsaved changes."
            : admin
              ? "Drafts are visible only to the studio."
              : "You can save now and finish later."}
        </p>
        <div className="wp-toolbar" style={{ margin: 0 }}>
          <button
            className={ghostButtonCls}
            disabled={pending}
            onClick={() => run("save")}
          >
            {pending ? "Saving…" : "Save draft"}
          </button>
          {admin ? (
            t.audience === "client" &&
            !["form", "request"].includes(t.action) ? (
              <button
                className={buttonCls}
                disabled={
                  pending ||
                  !canPublishChange ||
                  remaining.length > 0 ||
                  (t.companySigns &&
                    (!consent || name.trim().toLowerCase() !== "arman arai"))
                }
                onClick={() => run("issue")}
              >
                Publish {t.companySigns ? "& countersign" : "to couple"}
              </button>
            ) : null
          ) : (
            <button
              className={buttonCls}
              disabled={pending}
              onClick={() => run("submit")}
            >
              Send to Arman →
            </button>
          )}
          {admin && draftId && (
            <a
              className={ghostButtonCls}
              href={`/api/portal/wedding-pdf?ref=${bookingRef}&id=${draftId}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              Review saved PDF
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
