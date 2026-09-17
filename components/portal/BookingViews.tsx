import type { Booking, Installment, Lang, PlanningItem } from "@/lib/portal/types";
import { formatCad, formatDate, formatRate } from "@/lib/portal/money";
import { StatusPill } from "./Shell";

export function PriceSummary({ booking, lang = "en", showAllocation = false }: { booking: Booking; lang?: Lang; showAllocation?: boolean }) {
  const { totals } = booking;
  return (
    <div className="text-sm">
      <table className="w-full">
        <tbody>
          {booking.lines.map((l) => (
            <tr key={l.id} className="border-b border-dust/60">
              <td className="py-2 pr-4 text-blush">{l.label}</td>
              <td className="py-2 text-right tabular-nums">{formatCad(l.cents, lang)}</td>
            </tr>
          ))}
          <tr className="border-b border-dust/60">
            <td className="py-2 pr-4">Subtotal</td>
            <td className="py-2 text-right tabular-nums">{formatCad(totals.subtotalCents, lang)}</td>
          </tr>
          {booking.taxes.map((t) => (
            <tr key={t.code} className="border-b border-dust/60">
              <td className="py-2 pr-4 text-blush">
                {t.label} {formatRate(t.rateBps, lang)} <span className="text-xs text-slate">· {t.registration}</span>
              </td>
              <td className="py-2 text-right tabular-nums">{formatCad(totals.taxCents[t.code] ?? 0, lang)}</td>
            </tr>
          ))}
          <tr>
            <td className="pt-3 font-serif text-lg">Total</td>
            <td className="pt-3 text-right font-serif text-lg tabular-nums text-rose">{formatCad(totals.totalCents, lang)}</td>
          </tr>
        </tbody>
      </table>
      {showAllocation && (
        <div className="mt-6">
          <p className="mb-2 text-[11px] uppercase tracking-[0.16em] text-blush">How the subtotal is allocated</p>
          <ul className="space-y-1 text-xs text-blush">
            {booking.allocation.map((a) => (
              <li key={a.key} className="flex justify-between gap-4">
                <span>{a.label} ({formatRate(a.bps, lang)})</span>
                <span className="tabular-nums">{formatCad(Math.round((totals.subtotalCents * a.bps) / 10000), lang)}</span>
              </li>
            ))}
            <li className="flex justify-between gap-4 text-slate">
              <span>Drone coverage, where legally permitted</span><span>No separate value</span>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}

export function ScheduleTable({ schedule, lang = "en" }: { schedule: Installment[]; lang?: Lang }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[520px] text-sm">
        <thead>
          <tr className="border-b border-dust text-left text-[11px] uppercase tracking-[0.14em] text-blush">
            <th className="py-2 pr-3 font-normal">Payment</th>
            <th className="py-2 pr-3 font-normal">Due</th>
            <th className="py-2 pr-3 text-right font-normal">Amount</th>
            <th className="py-2 text-right font-normal">Status</th>
          </tr>
        </thead>
        <tbody>
          {schedule.map((i) => (
            <tr key={i.id} className="border-b border-dust/60 align-top">
              <td className="py-3 pr-3">
                {i.label}
                <div className="text-xs text-slate">{i.dueRule}</div>
              </td>
              <td className="py-3 pr-3 whitespace-nowrap text-blush">{formatDate(i.dueDate, lang)}</td>
              <td className="py-3 pr-3 text-right tabular-nums">{formatCad(i.totalCents, lang)}</td>
              <td className="py-3 text-right"><StatusPill status={i.status} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function PlanningProgress({ items, lang = "en" }: { items: PlanningItem[]; lang?: Lang }) {
  const visible = items.filter((i) => i.clientVisible).sort((a, b) => a.sortOrder - b.sortOrder);
  const applicable = visible.filter((i) => i.status !== "not_applicable");
  const done = applicable.filter((i) => i.status === "done").length;
  const pct = applicable.length ? Math.round((done / applicable.length) * 100) : 0;
  const sections = Array.from(new Set(visible.map((i) => i.section)));
  return (
    <div>
      <div className="mb-2 flex justify-between text-xs text-blush">
        <span>{done} of {applicable.length} done</span><span>{pct}%</span>
      </div>
      <div className="mb-6 h-1.5 w-full overflow-hidden rounded-full bg-dust">
        <div className="h-full bg-rose" style={{ width: `${pct}%` }} />
      </div>
      <div className="space-y-6">
        {sections.map((s) => (
          <div key={s}>
            <p className="mb-2 text-[11px] uppercase tracking-[0.2em] text-rose">{s}</p>
            <ul className="space-y-2">
              {visible.filter((i) => i.section === s).map((i) => (
                <li key={i.id} className="flex items-start justify-between gap-4 text-sm">
                  <span className={i.status === "done" ? "text-cream" : i.status === "not_applicable" ? "text-slate line-through" : "text-blush"}>
                    <span className="mr-2 inline-block w-4 text-center">{i.status === "done" ? "✓" : i.status === "in_progress" ? "◐" : "○"}</span>
                    {lang === "fr" ? i.titleFr : i.titleEn}
                    {i.clientNote && <span className="mt-0.5 block pl-6 text-xs text-slate">{i.clientNote}</span>}
                  </span>
                  <span className="whitespace-nowrap text-xs text-slate">
                    {i.status === "done" && i.completedAt ? formatDate(i.completedAt, lang) : i.dueDate ? `by ${formatDate(i.dueDate, lang)}` : ""}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
