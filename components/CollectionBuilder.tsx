"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import { leadAttribution } from "@/lib/attribution";
import { REFERRAL_OPTIONS } from "@/lib/contact-form";
import { ADDONS, ADDON_GROUPS, QUOTED_ADDONS, TERMS, TIERS } from "@/lib/site";
import {
  blockedBy,
  buildTotal,
  emptySelection,
  isIncluded,
  maxQuantity,
  money,
  priceBuild,
  type Selection,
} from "@/lib/custom-collection";

/* The custom collection builder (owner, 2026-11-18).
 *
 * Two deliberate choices, both his:
 *
 *  1. Submitting does NOT navigate. There is no /thank-you page and no
 *     router.push, because a thank-you URL is what the Meta pixel fires a
 *     conversion on and this form is not a tracked lead. A modal says thank
 *     you in place, the page stays where it is, and nothing is reported to any
 *     ad platform from here. Do not "fix" this by routing to a confirmation.
 *  2. The name is required, because the whole point of the submission is that
 *     he knows whose build it is.
 *
 * Every price shown is read from lib/site.ts through lib/custom-collection.ts,
 * and the server prices the same selection again from the slugs when it builds
 * his email, so nothing a browser posts can change a figure.
 */

const label = "block text-[0.66rem] tracking-[0.18em] uppercase text-blush mb-2";

export default function CollectionBuilder() {
  const [selection, setSelection] = useState<Selection>(() => emptySelection());
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    referral: "",
    weddingDate: "",
    location: "",
    message: "",
    company: "",
  });
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState("");
  const sending = useRef(false);

  const build = useMemo(() => priceBuild(selection), [selection]);

  const setField =
    (field: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [field]: e.target.value }));

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
        setError(data.error || "Something went wrong. Please email me directly at i@armanarai.com");
        setStatus("error");
        sending.current = false;
        return;
      }
      setStatus("sent");
    } catch {
      setError("Something went wrong. Please email me directly at i@armanarai.com");
      setStatus("error");
      sending.current = false;
    }
  }

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
        {/* ── THE BUILD ── */}
        <div className="lg:col-span-7">
          <fieldset>
            <legend className="text-[0.6rem] tracking-[0.3em] uppercase text-rose mb-5">
              Step one · Start from a collection
            </legend>
            <div className="space-y-px bg-dust/25">
              {TIERS.map((tier) => {
                const chosen = selection.base === tier.slug;
                return (
                  <label
                    key={tier.slug}
                    className={`flex gap-4 items-start bg-ivory px-5 py-5 cursor-pointer transition-colors ${
                      chosen ? "bg-parchment" : "hover:bg-parchment/60"
                    }`}
                  >
                    <input
                      type="radio"
                      name="base"
                      value={tier.slug}
                      checked={chosen}
                      onChange={() => setSelection((s) => ({ ...s, base: tier.slug }))}
                      className="mt-1.5 accent-[#B8956A] shrink-0"
                    />
                    <span className="flex-1">
                      <span className="flex flex-wrap items-baseline justify-between gap-x-4">
                        <span className="font-serif text-cream text-[1.15rem]">{tier.name}</span>
                        <span className="font-serif text-rose text-[1.15rem]">{money(tier.price)}</span>
                      </span>
                      <span className="block text-[0.72rem] tracking-[0.12em] uppercase text-slate mt-1.5">
                        {tier.coverage} · {tier.images}
                      </span>
                      <span className="block text-slate text-[0.84rem] leading-relaxed mt-2">
                        {tier.bestFor}
                      </span>
                    </span>
                  </label>
                );
              })}
            </div>
            <p className="text-slate text-[0.82rem] leading-relaxed mt-4">
              Travel is inside every one of those figures, anywhere in Canada. A wedding outside
              Canada is quoted per wedding, so build what you want below and tell me where it is.
            </p>
          </fieldset>

          <fieldset className="mt-14">
            <legend className="text-[0.6rem] tracking-[0.3em] uppercase text-rose mb-5">
              Step two · Add what you actually want
            </legend>

            {ADDON_GROUPS.map((group) => (
              <div key={group} className="mb-8 last:mb-0">
                <p className="text-[0.6rem] tracking-[0.26em] uppercase text-slate mb-3">{group}</p>
                <ul className="divide-y divide-dust/50 border-y border-dust/50">
                  {ADDONS.filter((a) => a.group === group).map((addon) => {
                    const included = isIncluded(addon.name, selection.base);
                    const gate = blockedBy(addon.name, selection);
                    const max = maxQuantity(addon.name);
                    const quantity = selection.items[addon.name] ?? 0;
                    const price = addon.priceMax
                      ? `${money(addon.price)}–${addon.priceMax.toLocaleString("en-CA")}`
                      : money(addon.price);
                    return (
                      <li key={addon.name} className="py-4">
                        <div className="flex items-start gap-4">
                          {included ? (
                            <span
                              aria-hidden
                              className="mt-1 text-rose text-[0.66rem] w-4 shrink-0 text-center"
                            >
                              ✦
                            </span>
                          ) : (
                            <input
                              type="checkbox"
                              id={`a-${addon.name}`}
                              checked={quantity > 0}
                              disabled={Boolean(gate)}
                              onChange={(e) => setQuantity(addon.name, e.target.checked ? 1 : 0)}
                              className="mt-1 w-4 h-4 shrink-0 accent-[#B8956A] cursor-pointer disabled:cursor-not-allowed disabled:opacity-30"
                            />
                          )}
                          <div className="flex-1">
                            <div className="flex flex-wrap items-baseline justify-between gap-x-5 gap-y-1">
                              <label
                                htmlFor={included || gate ? undefined : `a-${addon.name}`}
                                className={`text-cream text-[0.92rem] ${included || gate ? "" : "cursor-pointer"}`}
                              >
                                {addon.name}
                              </label>
                              <span
                                className={`text-[0.82rem] tracking-[0.1em] ${
                                  included ? "text-rose uppercase text-[0.66rem]" : "text-slate"
                                }`}
                              >
                                {included ? "Already yours" : price}
                              </span>
                            </div>
                            <p className="text-slate text-[0.8rem] leading-relaxed mt-1.5">
                              {gate ? gate.why : addon.note}
                            </p>
                            {quantity > 0 && max > 1 && (
                              <div className="flex items-center gap-3 mt-3">
                                <span className="text-[0.6rem] tracking-[0.2em] uppercase text-blush">
                                  How many
                                </span>
                                <select
                                  aria-label={`How many: ${addon.name}`}
                                  value={quantity}
                                  onChange={(e) => setQuantity(addon.name, Number(e.target.value))}
                                  className="bg-transparent border border-dust text-cream text-[0.82rem] px-2.5 py-1 cursor-pointer outline-none focus:border-rose"
                                >
                                  {Array.from({ length: max }, (_, i) => i + 1).map((n) => (
                                    <option key={n} value={n} className="bg-parchment">
                                      {n}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            )}
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}

            <div className="mt-9">
              <p className="text-[0.6rem] tracking-[0.26em] uppercase text-slate mb-3">
                Quoted against the job
              </p>
              <ul className="divide-y divide-dust/50 border-y border-dust/50">
                {QUOTED_ADDONS.map((item) => (
                  <li key={item.name} className="py-4 flex items-start gap-4">
                    <input
                      type="checkbox"
                      id={`q-${item.name}`}
                      checked={selection.quoted.includes(item.name)}
                      onChange={() => toggleQuoted(item.name)}
                      className="mt-1 w-4 h-4 shrink-0 accent-[#B8956A] cursor-pointer"
                    />
                    <div className="flex-1">
                      <div className="flex flex-wrap items-baseline justify-between gap-x-5">
                        <label htmlFor={`q-${item.name}`} className="text-cream text-[0.92rem] cursor-pointer">
                          {item.name}
                        </label>
                        <span className="text-slate text-[0.66rem] tracking-[0.18em] uppercase">
                          No published figure
                        </span>
                      </div>
                      <p className="text-slate text-[0.8rem] leading-relaxed mt-1.5">{item.note}</p>
                    </div>
                  </li>
                ))}
              </ul>
              <p className="text-slate text-[0.82rem] leading-relaxed mt-4">
                Those two depend on the brief, so there is no number to publish and I will not
                invent one. Tick them and I will price them with the rest.
              </p>
            </div>
          </fieldset>
        </div>

        {/* ── THE RUNNING TOTAL AND THE FORM ── */}
        <div className="lg:col-span-5">
          <div className="lg:sticky lg:top-24">
            <div className="bg-parchment border border-dust px-7 py-8">
              <p className="text-[0.6rem] tracking-[0.3em] uppercase text-rose mb-5">Your collection</p>

              <div className="flex items-baseline justify-between gap-4 pb-4 border-b border-dust">
                <span className="font-serif text-cream text-[1.05rem]">
                  {build.base.name}
                  <span className="block text-[0.68rem] tracking-[0.14em] uppercase text-slate mt-1">
                    {build.base.coverage}
                  </span>
                </span>
                <span className="font-serif text-cream text-[1.05rem] whitespace-nowrap">
                  {money(build.base.price)}
                </span>
              </div>

              {build.lines.length > 0 && (
                <ul className="divide-y divide-dust/60">
                  {build.lines.map((line) => (
                    <li key={line.name} className="py-3 flex items-baseline justify-between gap-4">
                      <span className="text-slate text-[0.84rem] leading-snug">
                        {line.name}
                        {line.quantity > 1 && <span className="text-blush"> ×{line.quantity}</span>}
                      </span>
                      <span className="text-cream text-[0.84rem] whitespace-nowrap">
                        {line.max === line.min
                          ? money(line.min)
                          : `${money(line.min)}–${line.max.toLocaleString("en-CA")}`}
                      </span>
                    </li>
                  ))}
                </ul>
              )}

              {build.quoted.length > 0 && (
                <ul className="divide-y divide-dust/60 border-t border-dust/60">
                  {build.quoted.map((name) => (
                    <li key={name} className="py-3 flex items-baseline justify-between gap-4">
                      <span className="text-slate text-[0.84rem] leading-snug">{name}</span>
                      <span className="text-blush text-[0.66rem] tracking-[0.16em] uppercase whitespace-nowrap">
                        Quoted
                      </span>
                    </li>
                  ))}
                </ul>
              )}

              <div className="flex items-baseline justify-between gap-4 mt-5 pt-5 border-t border-rose/40">
                <span className="text-[0.66rem] tracking-[0.22em] uppercase text-blush">
                  Before tax
                </span>
                <span className="font-serif text-rose leading-none" style={{ fontSize: "2rem" }}>
                  {buildTotal(build)}
                </span>
              </div>

              <p className="text-slate text-[0.78rem] leading-relaxed mt-4">
                Travel included, sales tax on top at your province&rsquo;s rate.
                {build.quoted.length > 0 && " The ticked quote-only lines are not in that figure."}{" "}
                {TERMS.schedule}
              </p>
            </div>

            {/* ── WHO IT IS FROM ── */}
            <form onSubmit={submit} id="send-it" className="mt-10 space-y-5 scroll-mt-24 pb-24 lg:pb-0">
              <p className="text-[0.6rem] tracking-[0.3em] uppercase text-rose">
                Step three · Send it to me
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label htmlFor="b-first" className={label}>First name</label>
                  <input id="b-first" type="text" required maxLength={60} autoComplete="given-name" placeholder="Sarah" className="form-input" value={form.firstName} onChange={setField("firstName")} />
                </div>
                <div>
                  <label htmlFor="b-last" className={label}>Last name</label>
                  <input id="b-last" type="text" required maxLength={60} autoComplete="family-name" placeholder="Chen" className="form-input" value={form.lastName} onChange={setField("lastName")} />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label htmlFor="b-email" className={label}>Email</label>
                  <input id="b-email" type="email" required maxLength={100} autoComplete="email" placeholder="you@email.com" className="form-input" value={form.email} onChange={setField("email")} />
                </div>
                <div>
                  <label htmlFor="b-phone" className={label}>Mobile</label>
                  <input id="b-phone" type="tel" required maxLength={40} autoComplete="tel" placeholder="604 555 0142" className="form-input" value={form.phone} onChange={setField("phone")} />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label htmlFor="b-date" className={label}>
                    Wedding date <span className="text-slate normal-case tracking-normal">(optional)</span>
                  </label>
                  <input id="b-date" type="text" maxLength={40} placeholder="20 June 2027, or still deciding" className="form-input" value={form.weddingDate} onChange={setField("weddingDate")} />
                </div>
                <div>
                  <label htmlFor="b-where" className={label}>Where</label>
                  <input id="b-where" type="text" required maxLength={120} placeholder="City and province, or the venue" className="form-input" value={form.location} onChange={setField("location")} />
                </div>
              </div>

              <div>
                <label htmlFor="b-referral" className={label}>How did you hear about me?</label>
                <select id="b-referral" required className="form-input cursor-pointer" value={form.referral} onChange={setField("referral")}>
                  <option value="">Choose one</option>
                  {REFERRAL_OPTIONS.map((option) => (
                    <option key={option} value={option} className="bg-parchment">{option}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="b-message" className={label}>
                  Anything else <span className="text-slate normal-case tracking-normal">(optional)</span>
                </label>
                <textarea id="b-message" rows={3} maxLength={4000} placeholder="Two ceremonies, 140 guests, and we care most about the dancing." className="form-input resize-none" value={form.message} onChange={setField("message")} />
              </div>

              {/* Never seen by a human. Anything that fills it is a bot and the
                  API answers 200 without sending. */}
              <input
                type="text"
                name="company"
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
                value={form.company}
                onChange={setField("company")}
                style={{ position: "absolute", left: "-9999px", width: 1, height: 1, opacity: 0 }}
              />

              {error && <p className="text-rose text-[0.82rem] leading-relaxed">{error}</p>}

              <button
                type="submit"
                disabled={status === "sending"}
                className="w-full bg-rose text-ivory text-[0.68rem] tracking-[0.22em] uppercase px-8 py-4 hover:bg-rose-dark transition-colors cursor-pointer border-none disabled:opacity-50 disabled:cursor-wait"
              >
                {status === "sending" ? "Sending…" : "Send me this collection"}
              </button>

              <p className="text-slate text-[0.78rem] leading-relaxed">
                Nothing is booked and nothing is charged. I read what you built and reply myself
                with what I would actually recommend, which is not always what you ticked.
              </p>
            </form>
          </div>
        </div>
      </div>

      {/* On a phone the running total sits below a long list of options, so
          nothing the couple ticks visibly changes anything. This bar is the
          total, pinned, and it scrolls to the form. Desktop has the sticky
          panel instead and hides it. */}
      {status !== "sent" && (
        <div className="lg:hidden fixed inset-x-0 bottom-0 z-40 bg-parchment border-t border-dust px-5 py-3 flex items-center justify-between gap-4">
          <span>
            <span className="block text-[0.56rem] tracking-[0.22em] uppercase text-blush">
              Your collection, before tax
            </span>
            <span className="font-serif text-rose text-[1.3rem] leading-tight">{buildTotal(build)}</span>
          </span>
          <a
            href="#send-it"
            className="shrink-0 bg-rose text-ivory text-[0.6rem] tracking-[0.18em] uppercase px-5 py-3"
          >
            Send it to me
          </a>
        </div>
      )}

      {/* The thank-you is a modal, in place. There is deliberately no
          confirmation page: see the note at the top of this file. */}
      {status === "sent" && (
        <div
          className="modal-backdrop"
          role="dialog"
          aria-modal="true"
          aria-labelledby="builder-thanks"
          onClick={(e) => { if (e.target === e.currentTarget) setStatus("idle"); }}
        >
          <div className="modal-panel text-center">
            <button
              type="button"
              className="modal-close"
              onClick={() => setStatus("idle")}
              aria-label="Close"
            >
              ✕
            </button>
            <span className="font-script text-5xl text-rose block mb-5">Thank you</span>
            <p className="font-serif italic text-slate text-sm leading-relaxed">
              Thank you for the effort, {form.firstName || "truly"}. Your collection is in my
              inbox exactly as you built it, at {buildTotal(build)} before tax, and I have your
              name on it. I will come back to you myself with what I would recommend and what I
              would leave out.
            </p>
            <p className="text-slate text-[0.8rem] leading-relaxed mt-5">
              If my reply is not in your inbox, look in spam and promotions. That is where new
              senders land.
            </p>
            <div className="mt-8 flex flex-col items-center gap-4">
              <button
                type="button"
                onClick={() => setStatus("idle")}
                className="text-[0.62rem] tracking-[0.2em] uppercase text-rose hover:text-rose-dark transition-colors border-b border-rose/30 pb-1 cursor-pointer"
              >
                Close
              </button>
              <Link
                href="/galleries"
                className="text-[0.62rem] tracking-[0.2em] uppercase text-slate hover:text-rose transition-colors"
              >
                See three complete weddings →
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
