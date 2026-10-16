"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { Installment } from "@/lib/portal/types";
import { saveWeddingSchedule } from "@/app/portal/wedding-actions";
import { formatCad } from "@/lib/portal/money";
import { randomId } from "@/lib/portal/token";
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
  /* What has already been received against each instalment. A row that took
     money cannot be removed: the receipt points at it. */
  const paidOn = (id: string) =>
    schedule.find((i) => i.id === id)?.paidCents ?? 0;
  // Say why the button is grey instead of leaving him to guess.
  const blockers = [
    locked ? "The agreement is issued, so terms need a signed change order." : "",
    rows.length === 0 ? "Add at least one instalment." : "",
    rows.some((r) => !r.label.trim()) ? "Every instalment needs a label." : "",
    rows.some((r) => !/^\d{4}-\d{2}-\d{2}$/.test(r.dueDate))
      ? "Every instalment needs a due date."
      : "",
    sum !== total
      ? `The instalments add up to ${formatCad(sum)}; the contract is ${formatCad(total)}. The difference is ${formatCad(Math.abs(sum - total))}.`
      : "",
  ].filter(Boolean);
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
            {!locked && (
              <div className="wp-form-field is-wide">
                <button
                  className="wp-text-button wp-danger"
                  disabled={paidOn(r.id) > 0 || rows.length < 2}
                  onClick={() =>
                    setRows((rs) => rs.filter((_, j) => j !== i))
                  }
                >
                  Remove this instalment
                </button>
                {paidOn(r.id) > 0 && (
                  <small>
                    {formatCad(paidOn(r.id))} has been received against this
                    one, so it has to stay.
                  </small>
                )}
                {rows.length < 2 && paidOn(r.id) === 0 && (
                  <small>A schedule needs at least one instalment.</small>
                )}
              </div>
            )}
          </div>
        ))}
        {!locked && (
          <button
            className="wp-button wp-button-secondary"
            onClick={() =>
              setRows((rs) => [
                ...rs,
                {
                  id: randomId(),
                  label: `Instalment ${rs.length + 1}`,
                  dueDate: rs[rs.length - 1]?.dueDate ?? "",
                  amount: "0.00",
                },
              ])
            }
          >
            Add an instalment
          </button>
        )}
        <p className="wp-message">
          Schedule total: {formatCad(sum)} · contract total: {formatCad(total)}
        </p>
        {blockers.length > 0 && (
          <p className="wp-message wp-message-error">
            {blockers.length === 1
              ? blockers[0]
              : `Before this can be saved: ${blockers.join(" ")}`}
          </p>
        )}
        <button
          className="wp-button"
          disabled={pending || blockers.length > 0}
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
