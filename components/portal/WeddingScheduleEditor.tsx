"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { Installment } from "@/lib/portal/types";
import { saveWeddingSchedule } from "@/app/portal/wedding-actions";
import { formatCad } from "@/lib/portal/money";
export default function WeddingScheduleEditor({
  bookingRef,
  schedule,
  total,
  locked,
}: {
  bookingRef: string;
  schedule: Installment[];
  total: number;
  locked: boolean;
}) {
  const router = useRouter(),
    [rows, setRows] = useState(
      schedule.map((i) => ({
        id: i.id,
        label: i.label,
        dueDate: i.dueDate,
        amount: (i.totalCents / 100).toFixed(2),
      })),
    ),
    [message, setMessage] = useState(""),
    [pending, start] = useTransition();
  const sum = rows.reduce((s, r) => s + Math.round(Number(r.amount) * 100), 0);
  return (
    <details className="wp-form-section" style={{ marginTop: 30 }}>
      <summary>Contract payment schedule</summary>
      <div className="wp-form-body">
        <p className="wp-muted">
          {locked
            ? "The agreement is issued. Payment terms require a signed change order."
            : "Set exact amounts and due dates before publishing the proposal and agreement."}
        </p>
        {rows.map((r, i) => (
          <div className="wp-form-grid wp-record-row" key={r.id}>
            <label className="wp-label">
              Payment label
              <input
                className="wp-input"
                disabled={locked}
                value={r.label}
                onChange={(e) =>
                  setRows((rs) =>
                    rs.map((x, j) =>
                      j === i ? { ...x, label: e.target.value } : x,
                    ),
                  )
                }
              />
            </label>
            <label className="wp-label">
              Due date
              <input
                type="date"
                className="wp-input"
                disabled={locked}
                value={r.dueDate}
                onChange={(e) =>
                  setRows((rs) =>
                    rs.map((x, j) =>
                      j === i ? { ...x, dueDate: e.target.value } : x,
                    ),
                  )
                }
              />
            </label>
            <label className="wp-label">
              Amount including tax (CAD)
              <input
                type="number"
                min="0"
                step="0.01"
                className="wp-input"
                disabled={locked}
                value={r.amount}
                onChange={(e) =>
                  setRows((rs) =>
                    rs.map((x, j) =>
                      j === i ? { ...x, amount: e.target.value } : x,
                    ),
                  )
                }
              />
            </label>
          </div>
        ))}
        <p className="wp-message">
          Schedule total: {formatCad(sum)} · contract total: {formatCad(total)}
        </p>
        <button
          className="wp-button"
          disabled={locked || pending || sum !== total}
          onClick={() =>
            start(async () => {
              const r = await saveWeddingSchedule(
                bookingRef,
                rows.map(({ amount, ...r }) => ({
                  ...r,
                  totalCents: Math.round(Number(amount) * 100),
                })),
              );
              setMessage(r.ok ? r.message || "Saved" : r.error);
              router.refresh();
            })
          }
        >
          Save payment schedule
        </button>
        {message && (
          <p role="status" className="wp-message">
            {message}
          </p>
        )}
      </div>
    </details>
  );
}
