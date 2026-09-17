"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { saveBookingAction, type BookingInput } from "@/app/admin/actions";
import { buildSchedule, computeTotals, formatCad, formatDate, formatRate, parseCadToCents, todayInBusinessTz } from "@/lib/portal/money";
import { PACKAGES, PROVINCES, TAX_PRESETS, defaultTaxesFor, packageByKey } from "@/lib/portal/presets";
import { FIELD_GROUPS, missingRequiredFields } from "@/lib/portal/workOrderFields";
import type { PriceLine } from "@/lib/portal/types";
import { Card, Eyebrow, buttonCls, ghostButtonCls, inputCls, labelCls } from "./Shell";

let lineCounter = 100;

export default function BookingForm({ initial, bookingRef, locked }: { initial: BookingInput; bookingRef: string | null; locked?: boolean }) {
  const router = useRouter();
  const [b, setB] = useState<BookingInput>(initial);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [pending, start] = useTransition();
  const [priceText, setPriceText] = useState<Record<string, string>>(() =>
    Object.fromEntries(initial.lines.map((l) => [l.id, l.cents ? (Math.abs(l.cents) / 100).toFixed(2) : ""])),
  );

  const update = (fn: (draft: BookingInput) => void) => {
    setSaved(false);
    setB((prev) => {
      const next = structuredClone(prev);
      fn(next);
      return next;
    });
  };

  const totals = useMemo(() => computeTotals(b.lines as PriceLine[], b.taxes), [b.lines, b.taxes]);
  const schedule = useMemo(
    () => buildSchedule({ ref: bookingRef ?? "AA-CA-YYYY-###", event: { ...b.event, timezone: "" } as never, totals, taxes: b.taxes }, todayInBusinessTz()),
    [b.event, totals, b.taxes, bookingRef],
  );
  const allocationSum = (b.allocation ?? []).reduce((s, a) => s + a.bps, 0);
  const missing = missingRequiredFields(b.fields);

  function save() {
    setError(null);
    start(async () => {
      const res = await saveBookingAction(bookingRef, b);
      if (!res.ok) { setError(res.error); return; }
      setSaved(true);
      if (!bookingRef) router.push(`/admin/bookings/${res.ref}`);
      else router.refresh();
    });
  }

  const priceLocked = !!locked;

  return (
    <div className="space-y-6">
      <Card>
        <Eyebrow>Package and date</Eyebrow>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelCls}>Package</label>
            <select
              className={inputCls}
              value={b.packageKey}
              disabled={priceLocked}
              onChange={(e) => update((d) => {
                const p = packageByKey(e.target.value);
                d.packageKey = p.key;
                d.packageName = p.name;
                d.allocation = p.allocation;
                const pkgLine = d.lines!.find((l) => l.kind === "package");
                if (pkgLine) pkgLine.label = p.name;
              })}
            >
              {PACKAGES.map((p) => <option key={p.key} value={p.key}>{p.name}</option>)}
            </select>
          </div>
          <div>
            <label className={labelCls}>Package name as printed</label>
            <input className={inputCls} value={b.packageName} disabled={priceLocked} onChange={(e) => update((d) => { d.packageName = e.target.value; })} />
          </div>
          <div>
            <label className={labelCls}>Elopement date</label>
            <input type="date" className={inputCls} value={b.event.date} disabled={priceLocked} onChange={(e) => update((d) => { d.event.date = e.target.value; })} />
          </div>
          <div>
            <label className={labelCls}>Backup date (weather or closure)</label>
            <input type="date" className={inputCls} value={b.event.backupDate} disabled={priceLocked} onChange={(e) => update((d) => { d.event.backupDate = e.target.value; })} />
          </div>
          <div>
            <label className={labelCls}>All service dates</label>
            <input className={inputCls} placeholder="e.g. June 12 to 13, 2027" value={b.event.serviceDates} onChange={(e) => update((d) => { d.event.serviceDates = e.target.value; })} />
          </div>
          <div>
            <label className={labelCls}>Ceremony</label>
            <select className={inputCls} value={b.event.ceremonyType} onChange={(e) => update((d) => { d.event.ceremonyType = e.target.value as "legal" | "symbolic"; })}>
              <option value="legal">Legal marriage</option>
              <option value="symbolic">Symbolic vows</option>
            </select>
          </div>
          <div>
            <label className={labelCls}>Location (municipality and places)</label>
            <input className={inputCls} value={b.event.location} onChange={(e) => update((d) => { d.event.location = e.target.value; })} />
          </div>
          <div>
            <label className={labelCls}>Province or territory of the elopement</label>
            <select
              className={inputCls}
              value={b.event.province}
              disabled={priceLocked}
              onChange={(e) => update((d) => { d.event.province = e.target.value; d.taxes = defaultTaxesFor(e.target.value); })}
            >
              {PROVINCES.map((p) => <option key={p.code} value={p.code}>{p.name}</option>)}
            </select>
          </div>
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {[0, 1].map((i) => {
          const c = b.clients[i];
          const set = (fn: (cl: typeof c) => void) => update((d) => fn(d.clients[i]));
          return (
            <Card key={i}>
              <Eyebrow>Partner {i + 1}</Eyebrow>
              <div className="grid gap-3">
                <div><label className={labelCls}>Full legal name</label><input className={inputCls} value={c.legalName} onChange={(e) => set((x) => { x.legalName = e.target.value; })} /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className={labelCls}>Preferred name</label><input className={inputCls} value={c.preferredName ?? ""} onChange={(e) => set((x) => { x.preferredName = e.target.value; })} /></div>
                  <div><label className={labelCls}>Phone</label><input className={inputCls} value={c.phone} onChange={(e) => set((x) => { x.phone = e.target.value; })} /></div>
                </div>
                <div><label className={labelCls}>Email</label><input type="email" className={inputCls} value={c.email} onChange={(e) => set((x) => { x.email = e.target.value; })} /></div>
                <div><label className={labelCls}>Street address</label><input className={inputCls} value={c.address.line1} onChange={(e) => set((x) => { x.address.line1 = e.target.value; })} /></div>
                <div><label className={labelCls}>Unit / line 2</label><input className={inputCls} value={c.address.line2 ?? ""} onChange={(e) => set((x) => { x.address.line2 = e.target.value; })} /></div>
                <div className="grid grid-cols-3 gap-3">
                  <div><label className={labelCls}>City</label><input className={inputCls} value={c.address.city} onChange={(e) => set((x) => { x.address.city = e.target.value; })} /></div>
                  <div>
                    <label className={labelCls}>Province</label>
                    <select className={inputCls} value={c.address.province} onChange={(e) => set((x) => { x.address.province = e.target.value; })}>
                      {PROVINCES.map((p) => <option key={p.code} value={p.code}>{p.code}</option>)}
                    </select>
                  </div>
                  <div><label className={labelCls}>Postal code</label><input className={inputCls} value={c.address.postalCode} onChange={(e) => set((x) => { x.address.postalCode = e.target.value.toUpperCase(); })} /></div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <Card>
        <Eyebrow>Price (CAD, before tax)</Eyebrow>
        {priceLocked && <p className="mb-4 text-xs text-rose">The agreement has been sent, so the price, taxes and dates are locked. Changes need a signed amendment.</p>}
        <div className="space-y-3">
          {b.lines!.map((l, idx) => (
            <div key={l.id} className="grid grid-cols-[110px_1fr_140px_auto] items-end gap-3">
              <div>
                {idx === 0 && <label className={labelCls}>Type</label>}
                <select className={inputCls} value={l.kind} disabled={priceLocked || l.kind === "package" && idx === 0}
                  onChange={(e) => update((d) => {
                    const line = d.lines![idx];
                    line.kind = e.target.value as PriceLine["kind"];
                    line.cents = line.kind === "discount" ? -Math.abs(line.cents) : Math.abs(line.cents);
                  })}>
                  <option value="package">Package</option>
                  <option value="addon">Upgrade</option>
                  <option value="discount">Discount</option>
                </select>
              </div>
              <div>
                {idx === 0 && <label className={labelCls}>Label</label>}
                <input className={inputCls} value={l.label} disabled={priceLocked} onChange={(e) => update((d) => { d.lines![idx].label = e.target.value; })} />
              </div>
              <div>
                {idx === 0 && <label className={labelCls}>Amount</label>}
                <input
                  className={`${inputCls} text-right tabular-nums`}
                  inputMode="decimal"
                  disabled={priceLocked}
                  value={priceText[l.id] ?? ""}
                  onChange={(e) => {
                    const text = e.target.value;
                    setPriceText((p) => ({ ...p, [l.id]: text }));
                    update((d) => {
                      const cents = parseCadToCents(text);
                      d.lines![idx].cents = d.lines![idx].kind === "discount" ? -Math.abs(cents) : Math.abs(cents);
                    });
                  }}
                />
              </div>
              <button type="button" className={ghostButtonCls} disabled={priceLocked || idx === 0} onClick={() => update((d) => { d.lines!.splice(idx, 1); })}>✕</button>
            </div>
          ))}
          {!priceLocked && (
            <button type="button" className={ghostButtonCls} onClick={() => {
              const id = `l${++lineCounter}`;
              update((d) => { d.lines!.push({ id, kind: "addon", label: "", cents: 0 }); });
            }}>+ Add upgrade or discount</button>
          )}
        </div>

        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <div>
            <p className={labelCls}>Taxes (on top of the price)</p>
            <div className="space-y-1.5">
              {TAX_PRESETS.map((t) => {
                const on = b.taxes!.some((x) => x.code === t.code);
                return (
                  <label key={t.code} className="flex items-center gap-2 text-sm text-blush">
                    <input type="checkbox" checked={on} disabled={priceLocked} onChange={() => update((d) => {
                      d.taxes = on ? d.taxes!.filter((x) => x.code !== t.code) : [...d.taxes!, t];
                    })} />
                    {t.label} {formatRate(t.rateBps)}
                  </label>
                );
              })}
            </div>
            <p className="mt-2 text-xs text-slate">Defaults to the province of the elopement. GST/HST 767392145RT0001.</p>
          </div>
          <div className="text-sm">
            <div className="flex justify-between border-b border-dust py-1.5"><span className="text-blush">Subtotal</span><span className="tabular-nums">{formatCad(totals.subtotalCents)}</span></div>
            {b.taxes!.map((t) => (
              <div key={t.code} className="flex justify-between border-b border-dust py-1.5"><span className="text-blush">{t.label}</span><span className="tabular-nums">{formatCad(totals.taxCents[t.code] ?? 0)}</span></div>
            ))}
            <div className="flex justify-between py-2 font-serif text-xl"><span>Total</span><span className="tabular-nums text-rose">{formatCad(totals.totalCents)}</span></div>
          </div>
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <Eyebrow>Allocation of the subtotal</Eyebrow>
          <p className="mb-4 text-xs leading-relaxed text-slate">
            Only used to value a part that could not be delivered. The couple pays the same total either way. Drone work has no separate value.
          </p>
          <div className="space-y-2">
            {(b.allocation ?? []).map((a, idx) => (
              <div key={a.key} className="grid grid-cols-[1fr_80px_110px] items-center gap-3 text-sm">
                <span className="text-blush">{a.label}</span>
                <input className={`${inputCls} text-right`} inputMode="decimal" value={a.bps / 100}
                  onChange={(e) => update((d) => { d.allocation![idx].bps = Math.round(Number(e.target.value || 0) * 100); })} />
                <span className="text-right tabular-nums text-xs">{formatCad(Math.round((totals.subtotalCents * a.bps) / 10000))}</span>
              </div>
            ))}
          </div>
          <p className={`mt-3 text-xs ${allocationSum === 10000 ? "text-slate" : "text-red-300"}`}>Adds up to {allocationSum / 100}%</p>
        </Card>
        <Card>
          <Eyebrow>Payment schedule preview</Eyebrow>
          <ul className="space-y-2 text-sm">
            {schedule.map((i) => (
              <li key={i.id} className="flex justify-between gap-3 border-b border-dust/60 pb-2">
                <span>{i.label}<span className="block text-xs text-slate">{i.dueDate ? formatDate(i.dueDate) : "set the date"}</span></span>
                <span className="tabular-nums">{formatCad(i.totalCents)}</span>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs text-slate">Four payments of 25% including tax. The deposit is non-refundable and locks the date and vendors.</p>
        </Card>
      </div>

      {FIELD_GROUPS.map((g) => (
        <Card key={g.key}>
          <Eyebrow>{g.title}</Eyebrow>
          {g.note && <p className="mb-4 text-xs text-slate">{g.note}</p>}
          <div className="grid gap-4 md:grid-cols-2">
            {g.fields.map((f) => {
              const wide = f.type === "textarea";
              const value = b.fields[f.id] ?? "";
              const setField = (id: string, v: string) => update((d) => { d.fields[id] = v; });
              return (
                <div key={f.id} className={wide ? "md:col-span-2" : ""}>
                  <label className={labelCls}>
                    {f.label}{f.requiredToSend && <span className="text-rose"> *</span>}
                    {f.hint && <span className="ml-1 normal-case tracking-normal text-slate">({f.hint})</span>}
                  </label>
                  {wide ? (
                    <textarea rows={3} className={inputCls} value={value} onChange={(e) => setField(f.id, e.target.value)} />
                  ) : (
                    <input type={f.type === "date" ? "date" : "text"} inputMode={f.type === "number" ? "numeric" : undefined} className={inputCls} value={value} onChange={(e) => setField(f.id, e.target.value)} />
                  )}
                  {f.translatable && (
                    <details className="mt-1">
                      <summary className="cursor-pointer text-[11px] text-slate">French version {b.fields[`${f.id}_fr`] ? "✓" : "(optional)"}</summary>
                      {wide ? (
                        <textarea rows={3} className={`${inputCls} mt-1`} value={b.fields[`${f.id}_fr`] ?? ""} onChange={(e) => setField(`${f.id}_fr`, e.target.value)} />
                      ) : (
                        <input className={`${inputCls} mt-1`} value={b.fields[`${f.id}_fr`] ?? ""} onChange={(e) => setField(`${f.id}_fr`, e.target.value)} />
                      )}
                    </details>
                  )}
                </div>
              );
            })}
          </div>
        </Card>
      ))}

      <Card>
        <Eyebrow>Internal notes (never shown to the couple)</Eyebrow>
        <textarea rows={4} className={inputCls} value={b.internalNotes} onChange={(e) => update((d) => { d.internalNotes = e.target.value; })} />
        <label className="mt-3 flex items-center gap-2 text-sm text-blush">
          <input type="checkbox" checked={!!b.remindersPaused} onChange={(e) => update((d) => { d.remindersPaused = e.target.checked; })} />
          Pause automatic reminders for this booking
        </label>
      </Card>

      <div className="sticky bottom-0 -mx-5 flex flex-wrap items-center gap-4 border-t border-dust bg-ivory/95 px-5 py-4 backdrop-blur">
        <button type="button" className={buttonCls} onClick={save} disabled={pending}>{pending ? "Saving…" : bookingRef ? "Save changes" : "Create booking"}</button>
        {saved && <span className="text-sm text-emerald-300">Saved</span>}
        {error && <span className="text-sm text-red-300">{error}</span>}
        {!error && missing.length > 0 && (
          <span className="text-xs text-slate">{missing.length} field{missing.length === 1 ? "" : "s"} marked * still needed before the agreement can be sent</span>
        )}
      </div>
    </div>
  );
}
