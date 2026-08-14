import type { Metadata } from "next";
import Link from "next/link";
import ContactForm from "./ContactForm";
import { MARKETS, SITE, STARTING_FROM } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact — Check Your Wedding Date",
  description:
    "Send your date, city and rough guest count. I answer inside two business hours and tell you straight away whether the date is open. Toronto, Montréal, Vancouver and across Canada.",
  alternates: { canonical: "/contact" },
  openGraph: {
    title: "Contact Arman Arai",
    description: "Send your date and city. An answer inside two business hours.",
    url: `${SITE.url}/contact`,
  },
};

const FACTS = [
  { label: "Email", value: SITE.email, href: `mailto:${SITE.email}` },
  { label: "Instagram", value: SITE.instagramHandle, href: SITE.instagram },
  { label: "Pinterest", value: "iarmanarai", href: SITE.pinterest },
  { label: "Home markets", value: "Toronto · Montréal · Vancouver" },
  { label: "Also", value: "Anywhere in Canada, coast to coast" },
  { label: "Working language", value: "English" },
];

export default function Contact() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    url: `${SITE.url}/contact`,
    name: "Contact Arman Arai",
    mainEntity: { "@id": `${SITE.url}/#business` },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />

      <section className="pt-36 md:pt-40 pb-16 md:pb-20 bg-ivory">
        <div className="page-w page-px">
          <p className="text-[0.6rem] tracking-[0.32em] uppercase text-blush mb-4">Begin here</p>
          <h1 className="font-serif font-light text-cream leading-tight" style={{ fontSize: "clamp(2.8rem, 5vw, 5rem)" }}>
            Is your date
            <br />
            <em className="italic text-rose">still open?</em>
          </h1>
        </div>
      </section>

      <section className="pb-16 md:pb-24 bg-ivory">
        <div className="page-w page-px grid grid-cols-1 lg:grid-cols-5 gap-12 lg:gap-20">
          <div className="lg:col-span-2">
            <h2 className="font-serif font-light text-cream text-2xl mb-4">Two business hours</h2>
            <p className="text-slate text-sm leading-relaxed mb-4">
              That is how long you wait for a real answer, not an autoresponder. Send the date, the
              city and roughly how big the day is. I will tell you whether I am free, what I would
              actually recommend, and what it costs, in the first reply rather than the third.
            </p>
            <p className="font-serif italic text-rose text-[0.9rem] leading-relaxed mb-4">
              Booking 2027 and 2028 weddings across Canada. Peak Saturdays usually go nine to
              eighteen months out; off-season and weekday dates open up much later.
            </p>
            <p className="text-slate text-sm leading-relaxed mb-10">
              Core is C${STARTING_FROM.toLocaleString("en-CA")} in Montréal, plus a published travel fee anywhere else.{" "}
              <Link href="/pricing" className="text-rose border-b border-dust hover:border-rose transition-colors">
                The full ladder is published
              </Link>{" "}
              so you can decide before you write to me.
            </p>

            <div className="space-y-4">
              {FACTS.map(({ label, value, href }) => (
                <div key={label + value} className="flex gap-5 items-start">
                  <span className="text-[0.55rem] tracking-[0.22em] uppercase text-blush min-w-[92px] pt-0.5">
                    {label}
                  </span>
                  {href ? (
                    <a
                      href={href}
                      target={href.startsWith("http") ? "_blank" : undefined}
                      rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
                      className="text-cream text-sm hover:text-rose transition-colors"
                    >
                      {value}
                    </a>
                  ) : (
                    <span className="text-cream text-sm">{value}</span>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-10 pt-8 border-t border-dust">
              <p className="text-[0.55rem] tracking-[0.22em] uppercase text-blush mb-4">City pages</p>
              <ul className="space-y-2">
                {MARKETS.map((m) => (
                  <li key={m.slug}>
                    <Link href={`/${m.slug}-wedding-photographer`} className="footer-link">
                      {m.city} wedding photography
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="lg:col-span-3">
            <ContactForm />
          </div>
        </div>
      </section>
    </>
  );
}
