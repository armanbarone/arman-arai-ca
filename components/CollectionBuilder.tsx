"use client";

import { useMemo, useRef, useState } from "react";
import { leadAttribution } from "@/lib/attribution";
import { QUOTED_ADDONS } from "@/lib/site";
import {
  blockedBy,
  buildTotal,
  emptySelection,
  GROUP_LABEL,
  HOURLY,
  lineAmount,
  maxQuantity,
  MAX_HOURS,
  MIN_HOURS,
  money,
  OPTIONS,
  priceBuild,
  STANDARD,
  type Selection,
} from "@/lib/custom-collection";

/* The custom collection builder.
 *
 * Built from scratch: hours first, then options. There is no collection to start
 * from (owner, 2026-11-19).
 *
 * Submitting does NOT navigate. No /thank-you page, because a thank-you URL is
 * what the Meta pixel converts on and this form is not a tracked lead. The
 * modal carries the reference the server returns, which is how an inquiry in
 * the inbox gets matched to the collection it belongs to.
 */

const GROUPS = ["Coverage", "Film and motion", "Prints", "Sessions", "Delivery"] as const;

export default function CollectionBuilder() {
  const [selection, setSelection] = useState<Selection>(emptySelection);
  const [form, setForm] = useState({ name: "", email: "", company: "" });
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState("");
  const [reference, setReference] = useState("");
  const sending = useRef(false);

  const build = useMemo(() => priceBuild(selection), [selection]);

  const setHours = (hours: number) =>
    setSelection((s) => ({ ...s, hours: Math.min(MAX_HOURS, Math.max(MIN_HOURS, hours)) }));

  const setQuantity = (name: string, quantity: number) =>
    setSelection((s) => {
      const items = { ...s.items };
      if (quantity > 0) items[name] = quantity;
      else delete items[name];
      return { ...s, items };
    });

  const toggleQuoted = (name: string) =>
    setSelection((s) => ({
      ...s,
      quoted: s.quoted.includes(name) ? s.quoted.filter((q) => q !== name) : [...s.quoted, name],
    }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (sending.current) return;
    sending.current = true;
    setStatus("sending");
    setError("");
    try {
      const res = await fetch("/api/custom-collection", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, selection, ...leadAttribution() }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || data.success !== true) {
        setError(data.error || "Something went wrong. Email me at i@armanarai.com.");
        setStatus("error");
        sending.current = false;
        return;
      }
      setReference(data.reference || "");
      setStatus("sent");
    } catch {
      setError("Something went wrong. Email me at i@armanarai.com.");
      setStatus("error");
      sending.current = false;
    }
  }

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-x-16 gap-y-14">
        {/* ── LEFT: THE BUILD ── */}
        <div className="lg:col-span-7 xl:col-span-8">
          {/* Hours */}
          <div className="border border-dust bg-parchment px-6 py-7 md:px-9 md:py-9">
            <div className="flex flex-wrap items-end justify-between gap-6">
              <div>
                <p className="text-[0.58rem] tracking-[0.3em] uppercase text-rose mb-3">Coverage</p>
                <p className="font-serif font-light text-cream leading-none" style={{ fontSize: "clamp(2.6rem,6vw,3.6rem)" }}>
                  {build.hours}
                  <span className="text-slate text-[0.9rem] tracking-[0.18em] uppercase ml-3 align-middle">hours</span>
                </p>
                <p className="text-slate text-[0.8rem] mt-3">
                  {money(HOURLY)} an hour · {MIN_HOURS} to {MAX_HOURS}
                </p>
              </div>
              <div className="flex items-stretch border border-dust">
                <button
                  type="button"
                  onClick={() => setHours(build.hours - 1)}
                  disabled={build.hours <= MIN_HOURS}
                  aria-label="One hour less"
                  className="w-14 h-14 text-cream text-xl hover:bg-ivory disabled:opacity-25 disabled:hover:bg-transparent transition-colors cursor-pointer disabled:cursor-not-allowed"
                >
                  −
                </button>
                <span className="w-px bg-dust" aria-hidden />
                <button
                  type="button"
                  onClick={() => setHours(build.hours + 1)}
                  disabled={build.hours >= MAX_HOURS}
                  aria-label="One hour more"
                  className="w-14 h-14 text-cream text-xl hover:bg-ivory disabled:opacity-25 disabled:hover:bg-transparent transition-colors cursor-pointer disabled:cursor-not-allowed"
                >
                  +
                </button>
              </div>
            </div>

            <input
              type="range"
              min={MIN_HOURS}
              max={MAX_HOURS}
              step={1}
              value={build.hours}
              onChange={(e) => setHours(Number(e.target.value))}
              aria-label="Hours of coverage"
              className="w-full mt-7 accent-[#B8956A] cursor-pointer"
            />
          </div>

          {/* What every build carries */}
          <div className="mt-5 border border-dust/60 px-6 py-6 md:px-9">
            <p className="text-[0.58rem] tracking-[0.3em] uppercase text-slate mb-4">In every build</p>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2">
              {STANDARD.map((item) => (
                <li key={item} className="text-slate text-[0.84rem] leading-relaxed flex gap-2.5">
                  <span className="text-rose text-[0.55rem] mt-[0.45rem] shrink-0" aria-hidden>✦</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Options */}
          {GROUPS.map((group) => {
            const options = OPTIONS.filter((o) => o.group === group);
            if (!options.length) return null;
            return (
              <div key={group} className="mt-12">
                <p className="text-[0.58rem] tracking-[0.3em] uppercase text-rose mb-5">
                  {GROUP_LABEL[group] ?? group}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {options.map((option) => {
                    const gate = blockedBy(option.name, selection);
                    const max = maxQuantity(option.name);
                    const quantity = selection.items[option.name] ?? 0;
                    const on = quantity > 0;
                    const price = option.priceMax
                      ? `${money(option.price)}–${option.priceMax.toLocaleString("en-CA")}`
                      : money(option.price);
                    return (
                      <button
                        key={option.name}
                        type="button"
                        disabled={Boolean(gate)}
                        aria-pressed={on}
                        onClick={() => setQuantity(option.name, on ? 0 : 1)}
                        className={`text-left px-5 py-5 border transition-colors ${
                          on ? "bg-parchment border-rose/60" : "bg-ivory border-dust hover:border-dust hover:bg-parchment/40"
                        } ${gate ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}`}
                      >
                        <span className="flex items-baseline justify-between gap-4">
                          <span className={`text-[0.93rem] leading-snug ${on ? "text-cream" : "text-blush"}`}>
                            {option.name}
                          </span>
                          <span className={`text-[0.84rem] whitespace-nowrap ${on ? "text-rose" : "text-slate"}`}>
                            {price}
                          </span>
                        </span>
                        <span className="block text-slate text-[0.78rem] leading-relaxed mt-2">
                          {gate ? gate.why : option.note}
                        </span>
                        {on && max > 1 && (
                          <span
                            className="flex items-center gap-3 mt-4"
                            onClick={(e) => e.stopPropagation()}
                            role="presentation"
                          >
                            <span className="text-[0.56rem] tracking-[0.22em] uppercase text-blush">Qty</span>
                            <span className="flex items-stretch border border-dust">
                              <span
                                role="button"
                                tabIndex={0}
                                aria-label={`One fewer: ${option.name}`}
                                onClick={() => setQuantity(option.name, quantity - 1)}
                                onKeyDown={(e) => e.key === "Enter" && setQuantity(option.name, quantity - 1)}
                                className="w-8 h-8 grid place-items-center text-cream hover:bg-ivory cursor-pointer"
                              >
                                −
                              </span>
                              <span className="w-10 h-8 grid place-items-center text-cream text-[0.84rem] border-x border-dust">
                                {quantity}
                              </span>
                              <span
                                role="button"
                                tabIndex={0}
                                aria-label={`One more: ${option.name}`}
                                onClick={() => quantity < max && setQuantity(option.name, quantity + 1)}
                                onKeyDown={(e) => e.key === "Enter" && quantity < max && setQuantity(option.name, quantity + 1)}
                                className={`w-8 h-8 grid place-items-center text-cream hover:bg-ivory ${
                                  quantity >= max ? "opacity-25" : "cursor-pointer"
                                }`}
                              >
                                +
                              </span>
                            </span>
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {/* Quote-only */}
          <div className="mt-12">
            <p className="text-[0.58rem] tracking-[0.3em] uppercase text-rose mb-5">Quoted against the job</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {QUOTED_ADDONS.map((item) => {
                const on = selection.quoted.includes(item.name);
                return (
                  <button
                    key={item.name}
                    type="button"
                    aria-pressed={on}
                    onClick={() => toggleQuoted(item.name)}
                    className={`text-left px-5 py-5 border cursor-pointer transition-colors ${
                      on ? "bg-parchment border-rose/60" : "bg-ivory border-dust hover:bg-parchment/40"
                    }`}
                  >
                    <span className="flex items-baseline justify-between gap-4">
                      <span className={`text-[0.93rem] leading-snug ${on ? "text-cream" : "text-blush"}`}>
                        {item.name}
                      </span>
                      <span className="text-slate text-[0.56rem] tracking-[0.2em] uppercase whitespace-nowrap">
                        Quoted
                      </span>
                    </span>
                    <span className="block text-slate text-[0.78rem] leading-relaxed mt-2">{item.note}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── RIGHT: THE TOTAL AND THE SEND ── */}
        <div className="lg:col-span-5 xl:col-span-4">
          <div className="lg:sticky lg:top-24">
            <div className="border border-dust bg-parchment px-6 py-7 md:px-8">
              <p className="text-[0.58rem] tracking-[0.3em] uppercase text-rose mb-5">Your collection</p>

              <ul className="divide-y divide-dust/60 border-y border-dust/60">
                <li className="py-3 flex items-baseline justify-between gap-4">
                  <span className="text-cream text-[0.86rem] leading-snug">
                    {build.hours} hours, one lead photographer
                  </span>
                  <span className="text-cream text-[0.86rem] whitespace-nowrap">{lineAmount(build.coverage)}</span>
                </li>
                {build.lines.map((line) => (
                  <li key={line.name} className="py-3 flex items-baseline justify-between gap-4">
                    <span className="text-slate text-[0.86rem] leading-snug">
                      {line.name}
                      {line.quantity > 1 && <span className="text-blush"> ×{line.quantity}</span>}
                    </span>
                    <span className="text-cream text-[0.86rem] whitespace-nowrap">{lineAmount(line)}</span>
                  </li>
                ))}
                {build.quoted.map((name) => (
                  <li key={name} className="py-3 flex items-baseline justify-between gap-4">
                    <span className="text-slate text-[0.86rem] leading-snug">{name}</span>
                    <span className="text-blush text-[0.56rem] tracking-[0.18em] uppercase whitespace-nowrap">
                      Quoted
                    </span>
                  </li>
                ))}
              </ul>

              <div className="mt-6 text-right">
                <p className="text-[0.56rem] tracking-[0.24em] uppercase text-blush mb-2">Before tax</p>
                <p className="font-serif text-rose leading-none whitespace-nowrap" style={{ fontSize: "clamp(1.7rem,3.4vw,2.2rem)" }}>
                  {buildTotal(build)}
                </p>
              </div>
            </div>

            <form onSubmit={submit} id="send-it" className="mt-6 space-y-5 scroll-mt-24 pb-28 lg:pb-0">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-5">
                <div>
                  <label htmlFor="b-name" className="block text-[0.58rem] tracking-[0.22em] uppercase text-blush mb-2">
                    Your name
                  </label>
                  <input id="b-name" type="text" required maxLength={120} autoComplete="name" placeholder="Sarah Chen" className="form-input" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
                </div>
                <div>
                  <label htmlFor="b-email" className="block text-[0.58rem] tracking-[0.22em] uppercase text-blush mb-2">
                    Email
                  </label>
                  <input id="b-email" type="email" required maxLength={100} autoComplete="email" placeholder="you@email.com" className="form-input" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
                </div>
              </div>

              <input
                type="text"
                name="company"
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
                value={form.company}
                onChange={(e) => setForm((f) => ({ ...f, company: e.target.value }))}
                style={{ position: "absolute", left: "-9999px", width: 1, height: 1, opacity: 0 }}
              />

              {error && <p className="text-rose text-[0.82rem] leading-relaxed">{error}</p>}

              <button
                type="submit"
                disabled={status === "sending"}
                className="w-full bg-rose text-ivory text-[0.66rem] tracking-[0.22em] uppercase px-8 py-4 hover:bg-rose-dark transition-colors cursor-pointer border-none disabled:opacity-50 disabled:cursor-wait"
              >
                {status === "sending" ? "Sending…" : "Send me this collection"}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* The running total, pinned, on a phone. */}
      {status !== "sent" && (
        <div className="lg:hidden fixed inset-x-0 bottom-0 z-40 bg-parchment border-t border-dust px-5 py-3 flex items-center justify-between gap-4">
          <span>
            <span className="block text-[0.54rem] tracking-[0.22em] uppercase text-blush">
              {build.hours} hours, before tax
            </span>
            <span className="font-serif text-rose text-[1.3rem] leading-tight">{buildTotal(build)}</span>
          </span>
          <a href="#send-it" className="shrink-0 bg-rose text-ivory text-[0.58rem] tracking-[0.18em] uppercase px-5 py-3">
            Send it
          </a>
        </div>
      )}

      {status === "sent" && (
        <div
          className="modal-backdrop"
          role="dialog"
          aria-modal="true"
          onClick={(e) => { if (e.target === e.currentTarget) setStatus("idle"); }}
        >
          <div className="modal-panel text-center">
            <button type="button" className="modal-close" onClick={() => setStatus("idle")} aria-label="Close">✕</button>
            <span className="font-script text-5xl text-rose block mb-5">Thank you</span>
            <p className="font-serif italic text-slate text-sm leading-relaxed">
              Thank you for the effort{form.name ? `, ${form.name.split(" ")[0]}` : ""}. Your collection is with me at{" "}
              {buildTotal(build)} before tax. I will reply myself.
            </p>
            {reference && (
              <p className="mt-7 border border-dust py-4 px-5">
                <span className="block text-[0.56rem] tracking-[0.24em] uppercase text-blush mb-2">Reference</span>
                <span className="font-serif text-cream text-[1.5rem] tracking-[0.1em]">{reference}</span>
              </p>
            )}
            <button
              type="button"
              onClick={() => setStatus("idle")}
              className="mt-7 text-[0.6rem] tracking-[0.2em] uppercase text-rose hover:text-rose-dark transition-colors border-b border-rose/30 pb-1 cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}
