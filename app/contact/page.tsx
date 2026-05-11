"use client";

import { useState } from "react";

export default function Contact() {
  const [form, setForm] = useState({
    name: "", partnerName: "", phone: "", email: "",
    weddingDate: "", collection: "", venue: "", guestCount: "", message: "", referral: "",
  });
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "full", ...form }),
      });
      setStatus(res.ok ? "sent" : "error");
    } catch {
      setStatus("error");
    }
  }

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  return (
    <>
      {/* ── HEADER ── */}
      <section className="pt-36 md:pt-40 pb-16 md:pb-20 px-8 md:px-12 lg:px-16 bg-ivory">
        <div className="max-w-screen-xl mx-auto">
          <p className="text-[0.6rem] tracking-[0.32em] uppercase text-blush mb-4">Begin here</p>
          <h1
            className="font-serif font-light text-cream leading-tight"
            style={{ fontSize: "clamp(2.8rem, 5vw, 5rem)" }}
          >
            Let&rsquo;s write
            <br />
            <em className="italic text-rose">your story</em>
          </h1>
        </div>
      </section>

      {/* ── BODY ── */}
      <section className="py-16 md:py-20 px-8 md:px-12 lg:px-16 bg-ivory">
        <div className="max-w-screen-xl mx-auto grid grid-cols-1 lg:grid-cols-5 gap-12 lg:gap-20">
          {/* Info */}
          <div className="lg:col-span-2">
            <h2 className="font-serif font-light text-cream text-2xl mb-4">
              I&rsquo;d love to hear from you
            </h2>
            <p className="text-slate text-sm leading-relaxed mb-4">
              Every great wedding album begins with a single conversation. Tell me about your day, your vision, and where in the world your love story is unfolding. I typically respond within 48 hours.
            </p>
            <p className="font-serif italic text-rose text-[0.9rem] leading-relaxed mb-10">
              Currently booking 2025 and 2026 weddings in Colombia, Canada, and internationally.
            </p>
            <div className="space-y-4">
              {[
                { label: "Email", value: "i@armanarai.com", href: "mailto:i@armanarai.com" },
                { label: "Based", value: "Medellín, Colombia" },
                { label: "Available", value: "Worldwide" },
                { label: "Instagram", value: "@iArmanArai", href: "https://instagram.com/iArmanArai" },
                { label: "Instagram", value: "@StillVows", href: "https://instagram.com/StillVows" },
              ].map(({ label, value, href }, i) => (
                <div key={i} className="flex gap-5 items-start">
                  <span className="text-[0.55rem] tracking-[0.22em] uppercase text-blush min-w-[70px] pt-0.5">
                    {label}
                  </span>
                  {href ? (
                    <a href={href} className="text-cream text-sm hover:text-rose transition-colors">
                      {value}
                    </a>
                  ) : (
                    <span className="text-cream text-sm">{value}</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Form */}
          <div className="lg:col-span-3">
            {status === "sent" ? (
              <div className="flex flex-col items-start justify-center h-full py-16">
                <span className="font-script text-rose block mb-4" style={{ fontSize: "3rem" }}>Thank you</span>
                <p className="font-serif italic text-slate text-lg leading-relaxed max-w-sm">
                  Your inquiry has been received. I will be in touch within 48 hours.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[0.56rem] tracking-[0.22em] uppercase text-blush mb-2">Your name</label>
                    <input type="text" required placeholder="Sofia" className="form-input" value={form.name} onChange={set("name")} />
                  </div>
                  <div>
                    <label className="block text-[0.56rem] tracking-[0.22em] uppercase text-blush mb-2">Partner&rsquo;s name</label>
                    <input type="text" placeholder="Mateo" className="form-input" value={form.partnerName} onChange={set("partnerName")} />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[0.56rem] tracking-[0.22em] uppercase text-blush mb-2">Phone number</label>
                    <input type="tel" placeholder="+1 604 000 0000" className="form-input" value={form.phone} onChange={set("phone")} />
                  </div>
                  <div>
                    <label className="block text-[0.56rem] tracking-[0.22em] uppercase text-blush mb-2">Email address</label>
                    <input type="email" required placeholder="hello@you.com" className="form-input" value={form.email} onChange={set("email")} />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[0.56rem] tracking-[0.22em] uppercase text-blush mb-2">Wedding date</label>
                    <input type="text" placeholder="October 2025" className="form-input" value={form.weddingDate} onChange={set("weddingDate")} />
                  </div>
                  <div>
                    <label className="block text-[0.56rem] tracking-[0.22em] uppercase text-blush mb-2">Guest count</label>
                    <select className="form-input cursor-pointer" value={form.guestCount} onChange={set("guestCount")}>
                      <option value="">Select one</option>
                      <option>Elopement (just us)</option>
                      <option>Micro-wedding (under 30)</option>
                      <option>Intimate (30 to 80)</option>
                      <option>Medium (80 to 150)</option>
                      <option>Large (150+)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[0.56rem] tracking-[0.22em] uppercase text-blush mb-2">Venue and location</label>
                  <input type="text" placeholder="Hacienda Santa Bárbara, Medellín" className="form-input" value={form.venue} onChange={set("venue")} />
                </div>

                <div>
                  <label className="block text-[0.56rem] tracking-[0.22em] uppercase text-blush mb-2">How did you hear about me?</label>
                  <select className="form-input cursor-pointer" value={form.referral} onChange={set("referral")}>
                    <option value="">Select one</option>
                    <option>Instagram (@iArmanArai)</option>
                    <option>Instagram (@TheVow)</option>
                    <option>Google</option>
                    <option>Referral from a friend</option>
                    <option>Wedding planner referral</option>
                    <option>Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[0.56rem] tracking-[0.22em] uppercase text-blush mb-2">Tell me your story</label>
                  <textarea
                    rows={5}
                    placeholder="How did you meet? What matters most to you about your wedding day? Where in the world is it happening?"
                    className="form-input resize-none"
                    value={form.message}
                    onChange={set("message")}
                  />
                </div>

                {status === "error" && (
                  <p className="text-red-500 text-xs">
                    Something went wrong. Please email me directly at i@armanarai.com
                  </p>
                )}

                <button
                  type="submit"
                  disabled={status === "sending"}
                  className="bg-rose text-ivory text-[0.62rem] tracking-[0.2em] uppercase px-10 py-4 hover:bg-rose-dark transition-colors duration-300 disabled:opacity-60 mt-2"
                >
                  {status === "sending" ? "Sending..." : "Send my inquiry"}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
