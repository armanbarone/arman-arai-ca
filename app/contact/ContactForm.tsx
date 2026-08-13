"use client";

import { useState } from "react";
import { MARKETS } from "@/lib/site";

const GUEST_COUNTS = [
  "Under 30",
  "30 to 80",
  "80 to 150",
  "150 to 250",
  "250+",
  "Multi-day, several events",
];

export default function ContactForm() {
  const [form, setForm] = useState({
    name: "",
    partnerName: "",
    phone: "",
    email: "",
    weddingDate: "",
    market: "",
    collection: "",
    venue: "",
    guestCount: "",
    message: "",
    referral: "",
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

  const set =
    (field: string) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [field]: e.target.value }));

  if (status === "sent") {
    return (
      <div className="flex flex-col items-start justify-center h-full py-16">
        <span className="font-script text-rose block mb-4" style={{ fontSize: "3rem" }}>
          Thank you
        </span>
        <p className="font-serif italic text-slate text-lg leading-relaxed max-w-sm">
          That is in. I answer inside two business hours, and I will tell you straight away whether
          the date is open.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <label htmlFor="name" className="block text-[0.56rem] tracking-[0.22em] uppercase text-blush mb-2">Your name</label>
          <input id="name" type="text" required autoComplete="given-name" className="form-input" value={form.name} onChange={set("name")} />
        </div>
        <div>
          <label htmlFor="partnerName" className="block text-[0.56rem] tracking-[0.22em] uppercase text-blush mb-2">Partner&rsquo;s name</label>
          <input id="partnerName" type="text" className="form-input" value={form.partnerName} onChange={set("partnerName")} />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <label htmlFor="phone" className="block text-[0.56rem] tracking-[0.22em] uppercase text-blush mb-2">Phone number</label>
          <input id="phone" type="tel" autoComplete="tel" placeholder="+1 416 000 0000" className="form-input" value={form.phone} onChange={set("phone")} />
        </div>
        <div>
          <label htmlFor="email" className="block text-[0.56rem] tracking-[0.22em] uppercase text-blush mb-2">Email address</label>
          <input id="email" type="email" required autoComplete="email" className="form-input" value={form.email} onChange={set("email")} />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <label htmlFor="weddingDate" className="block text-[0.56rem] tracking-[0.22em] uppercase text-blush mb-2">Wedding date</label>
          <input id="weddingDate" type="text" required placeholder="20 June 2027, or still deciding" className="form-input" value={form.weddingDate} onChange={set("weddingDate")} />
        </div>
        <div>
          <label htmlFor="market" className="block text-[0.56rem] tracking-[0.22em] uppercase text-blush mb-2">Where</label>
          <select id="market" required className="form-input cursor-pointer" value={form.market} onChange={set("market")}>
            <option value="">Select one</option>
            {MARKETS.map((m) => (
              <option key={m.slug}>{m.region}</option>
            ))}
            <option>Elsewhere in Canada</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <label htmlFor="guestCount" className="block text-[0.56rem] tracking-[0.22em] uppercase text-blush mb-2">Guest count</label>
          <select id="guestCount" className="form-input cursor-pointer" value={form.guestCount} onChange={set("guestCount")}>
            <option value="">Select one</option>
            {GUEST_COUNTS.map((g) => (
              <option key={g}>{g}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="collection" className="block text-[0.56rem] tracking-[0.22em] uppercase text-blush mb-2">Coverage you have in mind</label>
          <select id="collection" className="form-input cursor-pointer" value={form.collection} onChange={set("collection")}>
            <option value="">Not sure yet, advise me</option>
            <option>Essential — 6 hours</option>
            <option>Core — 8 hours</option>
            <option>Signature — 10 hours</option>
            <option>Multi-day, needs a custom quote</option>
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="venue" className="block text-[0.56rem] tracking-[0.22em] uppercase text-blush mb-2">Venue, or venues</label>
        <input id="venue" type="text" placeholder="Booked, on a shortlist, or wide open" className="form-input" value={form.venue} onChange={set("venue")} />
      </div>

      <div>
        <label htmlFor="referral" className="block text-[0.56rem] tracking-[0.22em] uppercase text-blush mb-2">How did you find me?</label>
        <select id="referral" className="form-input cursor-pointer" value={form.referral} onChange={set("referral")}>
          <option value="">Select one</option>
          <option>Google</option>
          <option>Instagram (@iArmanArai)</option>
          <option>Pinterest</option>
          <option>A friend</option>
          <option>My planner or venue</option>
          <option>Other</option>
        </select>
      </div>

      <div>
        <label htmlFor="message" className="block text-[0.56rem] tracking-[0.22em] uppercase text-blush mb-2">Tell me about the day</label>
        <textarea
          id="message"
          rows={5}
          placeholder="What the day looks like, how many events, whose traditions are in it, and the twenty minutes you would be heartbroken to lose."
          className="form-input resize-none"
          value={form.message}
          onChange={set("message")}
        />
      </div>

      {status === "error" && (
        <p className="text-red-500 text-xs">
          Something went wrong. Email me directly at i@armanarai.com and I will pick it up there.
        </p>
      )}

      <button
        type="submit"
        disabled={status === "sending"}
        className="bg-rose text-ivory text-[0.62rem] tracking-[0.2em] uppercase px-10 py-4 hover:bg-rose-dark transition-colors duration-300 disabled:opacity-60 mt-2"
      >
        {status === "sending" ? "Sending..." : "Check my date"}
      </button>
    </form>
  );
}
