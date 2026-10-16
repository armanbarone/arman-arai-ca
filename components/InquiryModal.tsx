"use client";

import { useState, useEffect } from "react";
import { useInquiry } from "./InquiryContext";
import { leadAttribution } from "@/lib/attribution";
import { PROMISE_LABEL, PROMISE_NOTE, PROMISE_OPTIONS, REFERRAL_OPTIONS } from "@/lib/contact-form";

/* The quick inquiry behind every "Inquire" button.
 *
 * It asks the same nine questions as the contact page and the landing pages
 * (lib/contact-form.ts). It used to ask four, which meant the reply to a modal
 * inquiry started from less than the reply to a contact-page inquiry, and the
 * lead email arrived in a different shape depending on which button was
 * pressed. The promise about the spam folder is the last field here too: it
 * is the one line that saves a lead whose first email lands in Promotions.
 *
 * The response promise is 60 minutes, the same number the auto-reply states
 * and the same one the contact page states. If that number changes, it
 * changes in all three places at once. */
export default function InquiryModal() {
  const { isOpen, close } = useInquiry();
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    referral: "",
    weddingDate: "",
    location: "",
    message: "",
    promise: "",
  });
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState("");

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") close(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, close]);

  // Prevent body scroll when open
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  if (!isOpen) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    setError("");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "quick", subjectLabel: "Quick inquiry", ...form, ...leadAttribution() }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || data.success !== true) {
        setError(data.error || "Something went wrong. Please email me directly at i@armanarai.com");
        setStatus("error");
        return;
      }
      setStatus("sent");
    } catch {
      setError("Something went wrong. Please email me directly at i@armanarai.com");
      setStatus("error");
    }
  }

  const set =
    (field: string) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [field]: e.target.value }));

  const field = "block text-[0.62rem] tracking-[0.2em] uppercase text-blush mb-2";

  return (
    <div
      className="modal-backdrop"
      onClick={(e) => { if (e.target === e.currentTarget) close(); }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="inquiry-modal-title"
    >
      <div className="modal-panel">
        <button type="button" className="modal-close" onClick={close} aria-label="Close">✕</button>

        {status === "sent" ? (
          <div className="text-center py-8">
            <span className="font-script text-5xl text-rose block mb-4">Thank you</span>
            <p className="font-serif italic text-slate text-sm leading-relaxed">
              Your inquiry is in. I reply personally within 60 minutes, and the pricing, the guide
              and my vendor list are already on their way to your inbox. If they are not there
              shortly, look in spam and promotions.
            </p>
            <button
              type="button"
              onClick={close}
              className="mt-8 text-[0.62rem] tracking-[0.2em] uppercase text-rose hover:text-rose-dark transition-colors border-b border-rose/30 pb-1"
            >
              Close
            </button>
          </div>
        ) : (
          <>
            <p className="text-[0.58rem] tracking-[0.28em] uppercase text-blush mb-2">
              Begin here
            </p>
            <h2 id="inquiry-modal-title" className="font-serif font-light text-cream mb-1" style={{ fontSize: "1.6rem" }}>
              Tell me about your wedding.
            </h2>
            <p className="text-blush text-xs leading-relaxed mb-8">
              I reply personally within 60 minutes. The full pricing, my welcome guide and my
              preferred vendor list come straight back to you by email.
            </p>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label htmlFor="q-first" className={field}>First name</label>
                  <input id="q-first" name="firstName" type="text" required maxLength={60} autoComplete="given-name" placeholder="Sarah" className="form-input" value={form.firstName} onChange={set("firstName")} />
                </div>
                <div>
                  <label htmlFor="q-last" className={field}>Last name</label>
                  <input id="q-last" name="lastName" type="text" required maxLength={60} autoComplete="family-name" placeholder="Chen" className="form-input" value={form.lastName} onChange={set("lastName")} />
                </div>
              </div>

              <div>
                <label htmlFor="q-email" className={field}>Email</label>
                <input id="q-email" name="email" type="email" required maxLength={100} autoComplete="email" placeholder="hello@you.com" className="form-input" value={form.email} onChange={set("email")} />
              </div>

              <div>
                <label htmlFor="q-phone" className={field}>Mobile</label>
                <input id="q-phone" name="phone" type="tel" required maxLength={40} autoComplete="tel" placeholder="+1 604 000 0000" className="form-input" value={form.phone} onChange={set("phone")} />
              </div>

              <div>
                <label htmlFor="q-referral" className={field}>How did you hear about me?</label>
                <select id="q-referral" name="referral" required className="form-input cursor-pointer" value={form.referral} onChange={set("referral")}>
                  <option value="" disabled>Choose your option</option>
                  {REFERRAL_OPTIONS.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="q-date" className={field}>Wedding date (optional)</label>
                <input id="q-date" name="weddingDate" type="text" maxLength={40} placeholder="20 June 2027, or still deciding" className="form-input" value={form.weddingDate} onChange={set("weddingDate")} />
              </div>

              <div>
                <label htmlFor="q-location" className={field}>Wedding location</label>
                <input id="q-location" name="location" type="text" required maxLength={120} placeholder="Vancouver, or the venue if it is booked" className="form-input" value={form.location} onChange={set("location")} />
              </div>

              <div>
                <label htmlFor="q-message" className={field}>Your message</label>
                <textarea id="q-message" name="message" rows={4} required maxLength={4000} placeholder="Tell me about the day, or ask me anything." className="form-input resize-none" value={form.message} onChange={set("message")} />
              </div>

              <div>
                <label htmlFor="q-promise" className={field}>{PROMISE_LABEL}</label>
                <select id="q-promise" name="promise" required className="form-input cursor-pointer" value={form.promise} onChange={set("promise")}>
                  <option value="" disabled>Say you promise</option>
                  {PROMISE_OPTIONS.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
                <p className="text-blush text-[0.68rem] leading-relaxed mt-3">{PROMISE_NOTE}</p>
              </div>

              {status === "error" && (
                <p role="alert" className="text-red-400 text-xs">{error}</p>
              )}

              <button
                type="submit"
                disabled={status === "sending"}
                className="w-full bg-rose text-ivory text-[0.62rem] tracking-[0.2em] uppercase py-4 hover:bg-rose transition-colors duration-300 disabled:opacity-60 mt-2"
              >
                {status === "sending" ? "Sending..." : "Send my inquiry"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
