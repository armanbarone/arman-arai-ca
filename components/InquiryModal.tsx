"use client";

import { useState, useEffect } from "react";
import { useInquiry } from "./InquiryContext";

/* The quick inquiry. It asks the four things a first reply needs in order to
 * answer the question the couple actually came with: who you are, how to reach
 * you, when the wedding is, and where. Phone and best-time stay optional.
 *
 * The response promise here is the same two business hours promised on the
 * Contact page. It used to say 48 hours, which made the site contradict
 * itself on the one number a couple checks. */
export default function InquiryModal() {
  const { isOpen, close } = useInquiry();
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    weddingDate: "",
    venue: "",
    bestTime: "",
  });
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

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
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "quick", ...form }),
      });
      if (res.ok) {
        setStatus("sent");
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  }

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
              Your inquiry has been received. I answer inside two business hours.
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
              Is your date still open?
            </h2>
            <p className="text-blush text-xs leading-relaxed mb-8">
              Send the date and the city and I will tell you whether I am free, which
              collection I would actually recommend, and what travel comes to. Inside two
              business hours.
            </p>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="q-name" className={field}>Your name</label>
                <input
                  id="q-name"
                  name="name"
                  type="text"
                  required
                  autoComplete="name"
                  placeholder="Sofia"
                  className="form-input"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>

              <div>
                <label htmlFor="q-email" className={field}>Email address</label>
                <input
                  id="q-email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="hello@you.com"
                  className="form-input"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>

              <div>
                <label htmlFor="q-date" className={field}>Wedding date</label>
                <input
                  id="q-date"
                  name="weddingDate"
                  type="text"
                  required
                  placeholder="20 June 2027, or still deciding"
                  className="form-input"
                  value={form.weddingDate}
                  onChange={(e) => setForm({ ...form, weddingDate: e.target.value })}
                />
              </div>

              <div>
                <label htmlFor="q-venue" className={field}>City or venue</label>
                <input
                  id="q-venue"
                  name="venue"
                  type="text"
                  required
                  placeholder="Vancouver, or the venue if it is booked"
                  className="form-input"
                  value={form.venue}
                  onChange={(e) => setForm({ ...form, venue: e.target.value })}
                />
              </div>

              <div>
                <label htmlFor="q-phone" className={field}>Phone number (optional)</label>
                <input
                  id="q-phone"
                  name="phone"
                  type="tel"
                  autoComplete="tel"
                  placeholder="+1 604 000 0000"
                  className="form-input"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                />
              </div>

              <fieldset>
                <legend className={field}>Best time to chat (optional)</legend>
                <div className="flex gap-4">
                  {["Morning", "Afternoon", "Evening"].map((t) => (
                    <label
                      key={t}
                      className={`flex items-center gap-2 cursor-pointer text-xs transition-colors ${
                        form.bestTime === t ? "text-rose" : "text-blush"
                      }`}
                    >
                      <input
                        type="radio"
                        name="bestTime"
                        value={t}
                        checked={form.bestTime === t}
                        onChange={() => setForm({ ...form, bestTime: t })}
                        className="sr-only peer"
                      />
                      <span
                        aria-hidden="true"
                        className={`w-4 h-4 border flex items-center justify-center transition-colors peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-rose ${
                          form.bestTime === t ? "border-rose bg-rose" : "border-dust"
                        }`}
                      >
                        {form.bestTime === t && <span className="w-2 h-2 bg-cream block" />}
                      </span>
                      {t}
                    </label>
                  ))}
                </div>
              </fieldset>

              {status === "error" && (
                <p role="alert" className="text-red-400 text-xs">
                  Something went wrong. Please email me directly at i@armanarai.com
                </p>
              )}

              <button
                type="submit"
                disabled={status === "sending"}
                className="w-full bg-rose text-ivory text-[0.62rem] tracking-[0.2em] uppercase py-4 hover:bg-rose transition-colors duration-300 disabled:opacity-60 mt-2"
              >
                {status === "sending" ? "Sending..." : "Check my date"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
