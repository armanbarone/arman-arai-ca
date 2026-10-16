"use client";

import { useState } from "react";
import { leadAttribution } from "@/lib/attribution";
import { PROMISE_LABEL, PROMISE_NOTE, PROMISE_OPTIONS, REFERRAL_OPTIONS } from "@/lib/contact-form";

/* The contact page form. The same nine questions as the quick modal and the
 * landing pages (lib/contact-form.ts), so the first reply has the same facts
 * whichever button a couple happened to press. */
export default function ContactForm() {
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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    setError("");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "full", subjectLabel: "Contact page inquiry", ...form, ...leadAttribution() }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || data.success !== true) {
        setError(data.error || "Something went wrong. Email me directly at i@armanarai.com and I will pick it up there.");
        setStatus("error");
        return;
      }
      setStatus("sent");
    } catch {
      setError("Something went wrong. Email me directly at i@armanarai.com and I will pick it up there.");
      setStatus("error");
    }
  }

  const set =
    (field: string) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [field]: e.target.value }));

  const label = "block text-[0.68rem] tracking-[0.18em] uppercase text-blush mb-2";

  if (status === "sent") {
    return (
      <div className="flex flex-col items-start justify-center h-full py-16">
        <span className="font-script text-rose block mb-4" style={{ fontSize: "3rem" }}>
          Thank you
        </span>
        <p className="font-serif italic text-slate text-lg leading-relaxed max-w-sm">
          That is in. I reply personally within 60 minutes. Everything you asked for is already on
          its way to your inbox, so check your spam and promotions folders if it is not there in a
          few minutes.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <label htmlFor="firstName" className={label}>First name</label>
          <input id="firstName" name="firstName" type="text" required maxLength={60} autoComplete="given-name" placeholder="Enter your first name" className="form-input" value={form.firstName} onChange={set("firstName")} />
        </div>
        <div>
          <label htmlFor="lastName" className={label}>Last name</label>
          <input id="lastName" name="lastName" type="text" required maxLength={60} autoComplete="family-name" placeholder="Enter your last name" className="form-input" value={form.lastName} onChange={set("lastName")} />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <label htmlFor="email" className={label}>Email</label>
          <input id="email" name="email" type="email" required maxLength={100} autoComplete="email" placeholder="Enter your email" className="form-input" value={form.email} onChange={set("email")} />
        </div>
        <div>
          <label htmlFor="phone" className={label}>Mobile</label>
          <input id="phone" name="phone" type="tel" required maxLength={40} autoComplete="tel" placeholder="Enter your phone" className="form-input" value={form.phone} onChange={set("phone")} />
        </div>
      </div>

      <div>
        <label htmlFor="referral" className={label}>How did you hear about me?</label>
        <select id="referral" name="referral" required className="form-input cursor-pointer" value={form.referral} onChange={set("referral")}>
          <option value="" disabled>Choose your option</option>
          {REFERRAL_OPTIONS.map((option) => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <label htmlFor="weddingDate" className={label}>Wedding date <span className="text-slate normal-case tracking-normal">(optional)</span></label>
          <input id="weddingDate" name="weddingDate" type="text" maxLength={40} placeholder="20 June 2027, or still deciding" className="form-input" value={form.weddingDate} onChange={set("weddingDate")} />
        </div>
        <div>
          <label htmlFor="location" className={label}>Wedding location</label>
          <input id="location" name="location" type="text" required maxLength={120} placeholder="City and province, or the venue" className="form-input" value={form.location} onChange={set("location")} />
        </div>
      </div>

      <div>
        <label htmlFor="message" className={label}>Your message</label>
        <textarea
          id="message" name="message"
          rows={5}
          required
          maxLength={4000}
          placeholder="What the day looks like, how many events, whose traditions are in it, and the twenty minutes you would be heartbroken to lose."
          className="form-input resize-none"
          value={form.message}
          onChange={set("message")}
        />
      </div>

      <div>
        <label htmlFor="promise" className={label}>{PROMISE_LABEL}</label>
        <select id="promise" name="promise" required className="form-input cursor-pointer" value={form.promise} onChange={set("promise")}>
          <option value="" disabled>Say you promise</option>
          {PROMISE_OPTIONS.map((option) => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
        <p className="text-slate text-xs leading-relaxed mt-3">{PROMISE_NOTE}</p>
      </div>

      {status === "error" && <p role="alert" className="text-red-500 text-xs">{error}</p>}

      <button
        type="submit"
        disabled={status === "sending"}
        className="bg-rose text-ivory text-[0.62rem] tracking-[0.2em] uppercase px-10 py-4 hover:bg-rose-dark transition-colors duration-300 disabled:opacity-60 mt-2"
      >
        {status === "sending" ? "Sending..." : "Send my inquiry"}
      </button>
    </form>
  );
}
