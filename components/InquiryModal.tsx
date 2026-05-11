"use client";

import { useState, useEffect } from "react";
import { useInquiry } from "./InquiryContext";

export default function InquiryModal() {
  const { isOpen, close } = useInquiry();
  const [form, setForm] = useState({ name: "", phone: "", email: "", bestTime: "" });
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

  return (
    <div className="modal-backdrop" onClick={(e) => { if (e.target === e.currentTarget) close(); }}>
      <div className="modal-panel">
        <button className="modal-close" onClick={close} aria-label="Close">✕</button>

        {status === "sent" ? (
          <div className="text-center py-8">
            <span className="font-script text-5xl text-rose block mb-4">Thank you</span>
            <p className="font-serif italic text-slate text-sm leading-relaxed">
              Your inquiry has been received. I will be in touch within 48 hours.
            </p>
            <button
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
            <h2 className="font-serif font-light text-cream mb-1" style={{ fontSize: "1.6rem" }}>
              Inquire for Availability
            </h2>
            <p className="text-slate text-xs leading-relaxed mb-8">
              Share a few details and I will be in touch within 48 hours.
            </p>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-[0.56rem] tracking-[0.22em] uppercase text-blush mb-2">
                  Your name
                </label>
                <input
                  type="text"
                  required
                  placeholder="Sofia"
                  className="form-input"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-[0.56rem] tracking-[0.22em] uppercase text-blush mb-2">
                  Phone number
                </label>
                <input
                  type="tel"
                  placeholder="+1 604 000 0000"
                  className="form-input"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-[0.56rem] tracking-[0.22em] uppercase text-blush mb-2">
                  Email address
                </label>
                <input
                  type="email"
                  required
                  placeholder="hello@you.com"
                  className="form-input"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-[0.56rem] tracking-[0.22em] uppercase text-blush mb-3">
                  Best time to chat
                </label>
                <div className="flex gap-4">
                  {["Morning", "Afternoon", "Evening"].map((t) => (
                    <label
                      key={t}
                      className={`flex items-center gap-2 cursor-pointer text-xs transition-colors ${
                        form.bestTime === t ? "text-rose" : "text-slate"
                      }`}
                    >
                      <span
                        className={`w-4 h-4 border flex items-center justify-center transition-colors ${
                          form.bestTime === t
                            ? "border-rose bg-rose"
                            : "border-dust"
                        }`}
                        onClick={() => setForm({ ...form, bestTime: t })}
                      >
                        {form.bestTime === t && (
                          <span className="w-2 h-2 bg-cream block" />
                        )}
                      </span>
                      {t}
                    </label>
                  ))}
                </div>
              </div>

              {status === "error" && (
                <p className="text-red-500 text-xs">
                  Something went wrong. Please email me directly at i@armanarai.com
                </p>
              )}

              <button
                type="submit"
                disabled={status === "sending"}
                className="w-full bg-rose text-ivory text-[0.62rem] tracking-[0.2em] uppercase py-4 hover:bg-rose transition-colors duration-300 disabled:opacity-60 mt-2"
              >
                {status === "sending" ? "Sending..." : "Send Inquiry"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
