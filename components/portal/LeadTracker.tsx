"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { saveLead, removeLead, addLeadByHand } from "@/app/admin/lead-actions";
import { LEAD_STAGES, type Lead, type LeadStage } from "@/lib/portal/lead-types";
import { formatCad } from "@/lib/portal/money";
import { Card, Eyebrow, buttonCls, ghostButtonCls } from "./Shell";

/* The booking tracker. One row per inquiry, the columns Arman asked for, and
   the two numbers no ad platform can give him: close rate and value per
   source. Meta reports cost per lead; cost per booking only exists here. */

const money = (cents?: number) => (cents ? formatCad(cents) : "—");
const day = (iso?: string) => (iso ? iso.slice(0, 10) : "—");

function csv(rows: Lead[]): string {
  const head = [
    "Date", "Name", "Partner", "Email", "Phone", "Source", "Campaign",
    "Wedding date", "Market", "Consult", "Booked", "Value CAD", "Stage",
    "Booking ref", "Notes",
  ];
  const esc = (v: string) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  return [
    head.join(","),
    ...rows.map((l) =>
      [
        day(l.receivedAt), l.name, l.partnerName ?? "", l.email, l.phone ?? "",
        l.source,
        [l.attribution?.utmSource, l.attribution?.utmCampaign].filter(Boolean).join(" / "),
        l.weddingDate ?? "", l.market ?? "",
        l.consult ? "Y" : "N", l.booked ? "Y" : "N",
        l.valueCents ? (l.valueCents / 100).toFixed(2) : "",
        l.stage, l.bookingRef ?? "", l.notes ?? "",
      ].map(esc).join(","),
    ),
  ].join("\n");
}

export default function LeadTracker({ leads: initial }: { leads: Lead[] }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState("");
  const [stage, setStage] = useState<LeadStage | "all">("all");
  const [source, setSource] = useState("all");
  const [q, setQ] = useState("");
  const [open, setOpen] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState({
    name: "", email: "", receivedAt: new Date().toISOString().slice(0, 10),
    source: "Referral", phone: "", weddingDate: "", message: "",
  });

  const sources = useMemo(
    () => [...new Set(initial.map((l) => l.source || "Unknown"))].sort(),
    [initial],
  );
  const rows = useMemo(
    () =>
      initial.filter(
        (l) =>
          (stage === "all" || l.stage === stage) &&
          (source === "all" || l.source === source) &&
          (!q ||
            [l.name, l.partnerName, l.email, l.venue, l.market, l.notes]
              .filter(Boolean)
              .join(" ")
              .toLowerCase()
              .includes(q.toLowerCase())),
      ),
    [initial, stage, source, q],
  );

  const t = useMemo(() => {
    const booked = rows.filter((l) => l.booked);
    const decided = rows.filter((l) => l.booked || l.stage === "lost");
    return {
      leads: rows.length,
      consults: rows.filter((l) => l.consult).length,
      booked: booked.length,
      value: booked.reduce((s, l) => s + (l.valueCents ?? 0), 0),
      close: decided.length ? Math.round((booked.length / decided.length) * 100) : null,
    };
  }, [rows]);

  const patch = (id: string, p: Parameters<typeof saveLead>[1]) =>
    start(async () => {
      setError("");
      const r = await saveLead(id, p);
      if (!r.ok) setError(r.error);
      router.refresh();
    });

  function download() {
    const blob = new Blob([csv(rows)], { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `armanarai-inquiries-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  return (
    <>
      <div className="wp-stats">
        <div className="wp-stat"><span>Inquiries</span><strong>{t.leads}</strong><small>in this view</small></div>
        <div className="wp-stat"><span>Consults</span><strong>{t.consults}</strong><small>{t.leads ? Math.round((t.consults / t.leads) * 100) : 0}% of inquiries</small></div>
        <div className="wp-stat"><span>Booked</span><strong>{t.booked}</strong><small>{t.close === null ? "none decided yet" : `${t.close}% of decided`}</small></div>
        <div className="wp-stat"><span>Booked value</span><strong>{money(t.value)}</strong><small>{t.booked ? `${money(Math.round(t.value / t.booked))} average` : "no bookings yet"}</small></div>
      </div>

      <div className="wp-filterbar">
        <input className="wp-input" placeholder="Search name, email, venue, notes" value={q} onChange={(e) => setQ(e.target.value)} />
        <select className="wp-input" style={{ width: "auto" }} value={stage} onChange={(e) => setStage(e.target.value as LeadStage | "all")}>
          <option value="all">Every stage</option>
          {LEAD_STAGES.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
        </select>
        <select className="wp-input" style={{ width: "auto" }} value={source} onChange={(e) => setSource(e.target.value)}>
          <option value="all">Every source</option>
          {sources.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <button className={ghostButtonCls} onClick={download} disabled={!rows.length}>Export CSV</button>
        <button className={ghostButtonCls} onClick={() => setAdding((v) => !v)}>{adding ? "Close" : "Add one by hand"}</button>
      </div>

      {error && <div className="wp-message wp-message-error" role="alert">{error}</div>}

      {adding && (
        <Card>
          <Eyebrow>An inquiry that did not come through the website</Eyebrow>
          <div className="wp-form-grid">
            <label className="wp-label">Name<input className="wp-input" value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} /></label>
            <label className="wp-label">Email<input className="wp-input" value={draft.email} onChange={(e) => setDraft({ ...draft, email: e.target.value })} /></label>
            <label className="wp-label">Date it arrived<input type="date" className="wp-input" value={draft.receivedAt} onChange={(e) => setDraft({ ...draft, receivedAt: e.target.value })} /></label>
            <label className="wp-label">Source<input className="wp-input" value={draft.source} onChange={(e) => setDraft({ ...draft, source: e.target.value })} placeholder="Referral, Instagram, phone…" /></label>
            <label className="wp-label">Phone<input className="wp-input" value={draft.phone} onChange={(e) => setDraft({ ...draft, phone: e.target.value })} /></label>
            <label className="wp-label">Wedding date<input className="wp-input" value={draft.weddingDate} onChange={(e) => setDraft({ ...draft, weddingDate: e.target.value })} placeholder="2027-08-14 or August 2027" /></label>
            <label className="wp-label is-wide">What they asked<textarea className="wp-input" rows={2} value={draft.message} onChange={(e) => setDraft({ ...draft, message: e.target.value })} /></label>
          </div>
          <button className={`${buttonCls} wp-add-lead`} disabled={pending || draft.name.trim().length < 2}
            onClick={() => start(async () => {
              const r = await addLeadByHand(draft);
              if (!r.ok) { setError(r.error); return; }
              setDraft({ ...draft, name: "", email: "", phone: "", weddingDate: "", message: "" });
              setAdding(false);
              router.refresh();
            })}>
            {pending ? "Adding…" : "Add inquiry"}
          </button>
        </Card>
      )}

      {rows.length === 0 ? (
        <div className="wp-empty">
          <h2>No inquiries here</h2>
          <p>{initial.length ? "Nothing matches those filters." : "Every inquiry the website takes will land here from now on. Use the Gmail import to bring in the ones that came before."}</p>
        </div>
      ) : (
        <div className="wp-table-scroll">
          <table className="wp-table wp-lead-table">
            <thead>
              <tr>
                <th>Date</th><th>Name</th><th>Source</th><th>Wedding date</th>
                <th>Consult</th><th>Booked</th><th>Value</th><th>Stage</th><th />
              </tr>
            </thead>
            <tbody>
              {rows.map((l) => (
                <tr key={l.id} className={l.booked ? "is-booked" : l.stage === "lost" ? "is-lost" : undefined}>
                  <td>{day(l.receivedAt)}</td>
                  <td>
                    <strong>{l.name}{l.partnerName ? ` & ${l.partnerName}` : ""}</strong>
                    <small><a href={`mailto:${l.email}`}>{l.email}</a>{l.phone ? ` · ${l.phone}` : ""}</small>
                  </td>
                  <td>
                    {l.source}
                    {l.attribution?.utmCampaign && <small>{l.attribution.utmCampaign}</small>}
                  </td>
                  <td>{l.weddingDate || "—"}{l.market && <small>{l.market}</small>}</td>
                  <td><input type="checkbox" checked={l.consult} disabled={pending} onChange={(e) => patch(l.id, { consult: e.target.checked })} aria-label={`Consult with ${l.name}`} /></td>
                  <td><input type="checkbox" checked={l.booked} disabled={pending} onChange={(e) => patch(l.id, { booked: e.target.checked })} aria-label={`${l.name} booked`} /></td>
                  <td>
                    <input className="wp-input wp-value-input" defaultValue={l.valueCents ? (l.valueCents / 100).toFixed(0) : ""}
                      placeholder="—" inputMode="decimal" disabled={pending}
                      onBlur={(e) => { if (e.target.value !== (l.valueCents ? (l.valueCents / 100).toFixed(0) : "")) patch(l.id, { value: e.target.value }); }} />
                  </td>
                  <td>
                    <select className="wp-input wp-stage-input" value={l.stage} disabled={pending} onChange={(e) => patch(l.id, { stage: e.target.value as LeadStage })}>
                      {LEAD_STAGES.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
                    </select>
                  </td>
                  <td><button className="wp-text-button" onClick={() => setOpen(open === l.id ? null : l.id)}>{open === l.id ? "Close" : "Open"}</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {open && (() => {
        const l = rows.find((x) => x.id === open);
        if (!l) return null;
        return (
          <Card className="wp-lead-detail">
            <Eyebrow>{l.name}{l.partnerName ? ` & ${l.partnerName}` : ""} · {day(l.receivedAt)}</Eyebrow>
            {l.message && <p className="wp-lead-message">{l.message}</p>}
            <dl className="wp-lead-facts">
              {([
                ["Email", l.email], ["Phone", l.phone], ["Venue", l.venue],
                ["Guests", l.guestCount], ["Collection", l.collection],
                ["Form", l.formType], ["Landing page", l.attribution?.landingPage],
                ["Campaign", [l.attribution?.utmSource, l.attribution?.utmMedium, l.attribution?.utmCampaign].filter(Boolean).join(" / ")],
                ["Click id", l.attribution?.gclid ? "Google" : l.attribution?.fbclid ? "Meta" : undefined],
                ["Referrer", l.attribution?.referrer], ["Imported from", l.importedFrom],
              ] as [string, string | undefined][]).filter(([, v]) => v).map(([k, v]) => (
                <div key={k}><dt>{k}</dt><dd>{v}</dd></div>
              ))}
            </dl>
            <div className="wp-form-grid">
              <label className="wp-label">Wedding date<input className="wp-input" defaultValue={l.weddingDate ?? ""} onBlur={(e) => patch(l.id, { weddingDate: e.target.value })} /></label>
              <label className="wp-label">Booking reference<input className="wp-input" defaultValue={l.bookingRef ?? ""} placeholder="AA-CA-2027-072" onBlur={(e) => patch(l.id, { bookingRef: e.target.value })} /></label>
              {l.stage === "lost" && (
                <label className="wp-label is-wide">Why it was lost<input className="wp-input" defaultValue={l.lostReason ?? ""} onBlur={(e) => patch(l.id, { lostReason: e.target.value })} /></label>
              )}
              <label className="wp-label is-wide">Notes<textarea className="wp-input" rows={3} defaultValue={l.notes ?? ""} onBlur={(e) => patch(l.id, { notes: e.target.value })} /></label>
            </div>
            <div className="wp-toolbar">
              {l.bookingRef ? (
                <Link className={ghostButtonCls} href={`/admin/bookings/${l.bookingRef}`}>Open the wedding →</Link>
              ) : (
                /* The handover. Their names, email, phone, date and place go
                   across, and this inquiry is marked booked and linked to the
                   wedding the moment it is created. */
                <Link className={buttonCls} href={`/admin/bookings/new?from=${l.id}`}>
                  Start a wedding from this inquiry →
                </Link>
              )}
              <button className="wp-text-button" disabled={pending}
                onClick={() => start(async () => {
                  const r = await removeLead(l.id);
                  if (!r.ok) { setError(r.error); return; }
                  setOpen(null);
                  router.refresh();
                })}>
                Remove this inquiry
              </button>
            </div>
          </Card>
        );
      })()}
    </>
  );
}
