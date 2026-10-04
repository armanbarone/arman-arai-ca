"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  OPERATION_REGISTERS,
  calculateBudgetRow,
} from "@/lib/portal/operations";
import { saveWeddingOperations } from "@/app/portal/wedding-actions";
import { Card, buttonCls, ghostButtonCls } from "./Shell";
export default function WeddingOperations({
  bookingRef,
  initial,
  preview = false,
}: {
  bookingRef: string;
  initial: Record<string, string[][]>;
  preview?: boolean;
}) {
  const router = useRouter(),
    [key, setKey] = useState("venues-vendors"),
    [data, setData] = useState(initial),
    [message, setMessage] = useState(""),
    [pending, start] = useTransition();
  const register = OPERATION_REGISTERS.find((r) => r.key === key)!,
    rows = data[key] || [];
  function change(ri: number, ci: number, value: string) {
    setMessage("");
    setData((d) => {
      const next = structuredClone(d);
      const r = next[key][ri];
      r[ci] = value;
      next[key][ri] = key === "budget-payments" ? calculateBudgetRow(r) : r;
      return next;
    });
  }
  return (
    <>
      <div className="wp-tabs">
        {OPERATION_REGISTERS.map((r) => (
          <button
            className={r.key === key ? buttonCls : ghostButtonCls}
            key={r.key}
            onClick={() => {
              setKey(r.key);
              setMessage("");
            }}
          >
            {r.title}
          </button>
        ))}
      </div>
      <Card>
        <h2>{register.title}</h2>
        <p className="wp-muted">
          Studio records from the operations workbook. These records do not
          amend the signed agreement or mark client payments as received.
        </p>
        {key === "budget-payments" && (
          <p className="wp-message">
            Amounts are CAD. Total client charge, client balance and vendor
            balance calculate from each row. Official client receipts stay in
            Payments.
          </p>
        )}
        {rows.map((row, ri) => (
          <details
            className="wp-form-section"
            key={ri}
            open={ri === rows.length - 1}
          >
            <summary>
              Entry {ri + 1}
              {row[1] ? ` · ${row[1]}` : ""}
            </summary>
            <div className="wp-form-body">
              <div className="wp-form-grid">
                {register.columns.map((col, ci) => (
                  <div key={ci}>
                    <label
                      htmlFor={`operation-${key}-${ri}-${ci}`}
                      className="wp-label"
                    >
                      {col}
                    </label>
                    <textarea
                      id={`operation-${key}-${ri}-${ci}`}
                      className="wp-input"
                      rows={2}
                      value={row[ci] || ""}
                      readOnly={
                        key === "budget-payments" && [6, 8, 11].includes(ci)
                      }
                      onChange={(e) => change(ri, ci, e.target.value)}
                    />
                  </div>
                ))}
              </div>
              <button
                className={ghostButtonCls}
                style={{ marginTop: 20 }}
                onClick={() =>
                  setData((d) => ({
                    ...d,
                    [key]: d[key].filter((_, i) => i !== ri),
                  }))
                }
              >
                Remove this unsaved entry
              </button>
            </div>
          </details>
        ))}
        {!rows.length && (
          <p style={{ margin: "25px 0" }}>No entries recorded.</p>
        )}
        <div className="wp-toolbar">
          <button
            className={ghostButtonCls}
            onClick={() =>
              setData((d) => ({
                ...d,
                [key]: [
                  ...(d[key] || []),
                  Array(register.columns.length).fill(""),
                ],
              }))
            }
          >
            Add entry
          </button>
          <button
            className={buttonCls}
            disabled={pending}
            onClick={() => {
              setMessage("");
              if (preview) {
                setMessage("Saved only in this sample preview.");
                return;
              }
              start(async () => {
                const r = await saveWeddingOperations(bookingRef, key, rows);
                setMessage(r.ok ? "Register saved." : r.error);
                if (r.ok) router.refresh();
              });
            }}
          >
            {pending ? "Saving…" : "Save this register"}
          </button>
        </div>
        {message && (
          <p className="wp-message" role="status">
            {message}
          </p>
        )}
      </Card>
    </>
  );
}
