"use client";
import { useState } from "react";
import Link from "next/link";
import { formatCad, formatDate } from "@/lib/portal/money";
import { Card, Eyebrow, StatusPill, buttonCls } from "./Shell";
import { useWeddingPreview } from "./WeddingPreviewProvider";
export interface StudioRow {
  ref: string;
  names: string;
  date: string;
  location: string;
  packageName: string;
  status: string;
  paid: number;
  total: number;
  action: string;
  attention: boolean;
  waiting: string;
  archived?: boolean;
  portalEnabled?: boolean;
}
export default function WeddingStudioOverview({
  rows,
  preview = false,
}: {
  rows: StudioRow[];
  preview?: boolean;
}) {
  const context = useWeddingPreview();
  const [q, setQ] = useState(""),
    [tab, setTab] = useState("all"),
    active = rows.filter((r) => r.status !== "cancelled" && !r.archived),
    attention = active.filter((r) => r.attention),
    paid = active.reduce((s, r) => s + r.paid, 0),
    total = active.reduce((s, r) => s + r.total, 0);
  const shown = rows.filter(
    (r) =>
      ((tab === "all" && !r.archived) ||
        (tab === "archived" && r.archived) ||
        (tab === "attention" && !r.archived && r.attention) ||
        (tab === "signing" &&
          !r.archived &&
          /signature|signed/.test(r.waiting))) &&
      `${r.names} ${r.ref} ${r.location}`
        .toLowerCase()
        .includes(q.toLowerCase()),
  );
  return (
    <>
      <div className="wp-heading-row">
        <div>
          <Eyebrow>Canadian weddings · studio</Eyebrow>
          <h1>Your weddings, at a glance.</h1>
          <p className="wp-lead">
            See what needs you, what needs the couple, and what’s already done.
          </p>
        </div>
        <Link
          className={buttonCls}
          href={preview ? "/portal/preview/admin/new" : "/admin/bookings/new"}
        >
          + New wedding
        </Link>
      </div>
      <div className="wp-toolbar">
        <Link
          className="wp-button wp-button-secondary"
          href={preview ? "/portal/preview/admin/invoices" : "/admin/invoices"}
        >
          Manage all invoices →
        </Link>
        <Link
          className="wp-button wp-button-secondary"
          href={
            preview
              ? "/portal/preview/admin/payment-settings"
              : "/admin/payment-settings"
          }
        >
          Stripe & email settings →
        </Link>
      </div>
      <div className="wp-stats">
        <div className="wp-stat">
          <span>Active weddings</span>
          <strong>{active.length}</strong>
          <small>One private record per couple</small>
        </div>
        <div className="wp-stat">
          <span>Needs your attention</span>
          <strong>{attention.length}</strong>
          <small>Drafts, submissions and payment checks</small>
        </div>
        <div className="wp-stat">
          <span>Received</span>
          <strong>{formatCad(paid)}</strong>
          <small>Confirmed client payments</small>
        </div>
        <div className="wp-stat">
          <span>Outstanding</span>
          <strong>{formatCad(Math.max(0, total - paid))}</strong>
          <small>Remaining across active bookings</small>
        </div>
      </div>
      {attention.length > 0 && (
        <Card className="wp-action-hero">
          <div>
            <span className="wp-action-number">STUDIO TO-DO</span>
            <h2>{attention[0].action}</h2>
            <p>
              {attention[0].names} · {formatDate(attention[0].date)}
            </p>
          </div>
          <Link
            onClick={() => preview && context?.selectBooking(attention[0].ref)}
            className={buttonCls}
            href={
              preview
                ? "/portal/preview/admin/booking"
                : `/admin/bookings/${attention[0].ref}`
            }
          >
            Open wedding →
          </Link>
        </Card>
      )}
      <div className="wp-filterbar">
        <div className="wp-tabs">
          {[
            ["all", `Weddings (${rows.filter((r) => !r.archived).length})`],
            ["attention", `Needs you (${attention.length})`],
            ["signing", "Awaiting signatures"],
            ["archived", `Archived (${rows.filter((r) => r.archived).length})`],
          ].map(([v, l]) => (
            <button
              key={v}
              className={tab === v ? "is-active" : ""}
              onClick={() => setTab(v)}
            >
              {l}
            </button>
          ))}
        </div>
        <input
          className="wp-input"
          aria-label="Search weddings"
          placeholder="Search couple, place or reference"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </div>
      {shown.length ? (
        <Card>
          <div className="wp-table-scroll">
            <table className="wp-table">
              <thead>
                <tr>
                  <th>Wedding</th>
                  <th>Status</th>
                  <th>Payments</th>
                  <th>Next action</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {shown.map((r) => (
                  <tr key={r.ref}>
                    <td>
                      <strong>{r.names}</strong>
                      <small>
                        {formatDate(r.date)} · {r.location}
                      </small>
                      <small>
                        {r.packageName} · {r.ref}
                      </small>
                    </td>
                    <td>
                      <StatusPill status={r.archived ? "archived" : r.status} />
                      {r.portalEnabled === false && (
                        <small>Client access closed</small>
                      )}
                      <small style={{ marginTop: 8 }}>{r.waiting}</small>
                    </td>
                    <td>
                      <strong>{formatCad(r.total - r.paid)}</strong>
                      <small>remaining · {formatCad(r.paid)} received</small>
                    </td>
                    <td style={{ maxWidth: 250 }}>{r.action}</td>
                    <td>
                      <Link
                        onClick={() => preview && context?.selectBooking(r.ref)}
                        className="wp-button wp-button-secondary"
                        href={
                          preview
                            ? "/portal/preview/admin/booking"
                            : `/admin/bookings/${r.ref}`
                        }
                      >
                        Manage →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      ) : (
        <div className="wp-empty">
          <h2>
            {rows.length
              ? "No weddings match this view"
              : "Start with a wedding"}
          </h2>
          <p>
            {rows.length
              ? "Try another filter or search."
              : "Create the couple’s booking, prepare their proposal, then publish the completed agreement for separate signatures."}
          </p>
          <Link
            className={buttonCls}
            href={preview ? "/portal/preview/admin/new" : "/admin/bookings/new"}
          >
            New wedding
          </Link>
        </div>
      )}
    </>
  );
}
