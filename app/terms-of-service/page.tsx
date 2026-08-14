import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service | Arman Arai",
  description: "Terms of service for Arman Arai wedding photography in Canada: booking, payment, cancellation, copyright, and delivery terms.",
  robots: { index: true, follow: true },
  alternates: { canonical: "https://www.armanarai.ca/terms-of-service" },
};

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div style={{ marginBottom: "2.5rem" }}>
    <h2 style={{ fontFamily: "var(--font-serif)", fontWeight: 300, fontSize: "clamp(1.1rem,2vw,1.4rem)", color: "var(--text)", marginBottom: "1rem" }}>
      {title}
    </h2>
    <div style={{ color: "var(--dim-soft)", fontSize: "0.88rem", lineHeight: 1.9, fontFamily: "var(--font-jost)", fontWeight: 300 }}>
      {children}
    </div>
  </div>
);

export default function TermsOfService() {
  return (
    <div style={{ background: "var(--bg)", minHeight: "100svh" }}>
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "clamp(6rem,12vw,10rem) 1.5rem 5rem" }}>

        <p style={{ fontSize: 9, letterSpacing: ".32em", textTransform: "uppercase", color: "var(--accent)", marginBottom: 16, fontFamily: "var(--font-jost)" }}>
          Legal
        </p>
        <h1 style={{ fontFamily: "var(--font-serif)", fontWeight: 300, fontSize: "clamp(2rem,5vw,3.5rem)", color: "var(--text)", lineHeight: 1.1, marginBottom: 12 }}>
          Terms of Service
        </h1>
        <p style={{ color: "var(--label)", fontSize: "0.78rem", letterSpacing: ".1em", fontFamily: "var(--font-jost)", marginBottom: 48 }}>
          Last updated: August 2026
        </p>

        <div style={{ height: "0.5px", background: "var(--hairline)", marginBottom: 48 }} />

        <Section title="Overview">
          <p>These terms govern the relationship between Arman Arai ("I", "me", "my") and clients ("you", "your") who engage my services. By submitting a booking inquiry and proceeding to a signed contract, you agree to these terms.</p>
          <p style={{ marginTop: 12 }}>A formal contract is provided and must be signed before any services commence. In the event of any conflict between these terms and the signed contract, the signed contract governs.</p>
        </Section>

        <Section title="Services">
          <p>This site sells wedding photography in Canada. I offer the following:</p>
          <ul style={{ paddingLeft: "1.25rem", marginTop: 10, display: "flex", flexDirection: "column", gap: 6 }}>
            <li>Wedding day photography, in the three collections published on the pricing page</li>
            <li>Engagement and welcome sessions, included in the collections or booked standalone</li>
            <li>Vertical social clips, included in every collection, shot alongside the photography rather than by a separate operator</li>
            <li>Timeline planning and a written family-photograph plan</li>
            <li>Optional add-ons at published prices: additional hours and events, a second photographer, albums, film, drone, dedicated video and content-creator coverage</li>
          </ul>
          <p style={{ marginTop: 12 }}>Coverage anywhere in Canada is quoted as one all-in figure that already contains my travel. Every price on this website is in Canadian dollars and excludes applicable sales tax.</p>
          <p style={{ marginTop: 12 }}>The specific scope of services, deliverables, and coverage hours are defined in your individual contract. I accept a limited number of commissions per year to maintain the quality of my work.</p>
        </Section>

        <Section title="Booking and Payment">
          <p>Your date is not reserved until a signed contract and the retainer have both been received. I will hold a date informally for 48 hours as a courtesy while you decide, and that hold is not a booking.</p>
          <p style={{ marginTop: 12 }}><strong style={{ color: "var(--text)" }}>The retainer is 30% of the collection price.</strong> It is refundable only under the cancellation schedule below. The balance is due before the wedding date and can be split across instalments if you ask for that at the outset. Payment methods are specified in your contract. Once the contract is signed and the retainer has cleared, the date is yours.</p>
          <p style={{ marginTop: 12 }}>All prices are quoted in Canadian dollars and are subject to applicable sales tax. The figure on your proposal already contains my travel to your region; there is no separate travel or destination charge added later.</p>
        </Section>

        <Section title="Cancellation by Client">
          <p>All cancellations must be submitted in writing to <a href="mailto:i@armanarai.com" style={{ color: "var(--accent)" }}>i@armanarai.com</a>. The percentages below apply to the total amount you have paid to date, retainer included, and depend on how far in advance the cancellation occurs relative to your wedding date:</p>
          <ul style={{ paddingLeft: "1.25rem", marginTop: 12, display: "flex", flexDirection: "column", gap: 10 }}>
            <li><strong style={{ color: "var(--text)" }}>6 or more months before the wedding:</strong> 75% refund. I retain 25% to account for the date being held and planning work already completed.</li>
            <li><strong style={{ color: "var(--text)" }}>3 to 6 months before the wedding:</strong> 50% refund.</li>
            <li><strong style={{ color: "var(--text)" }}>Less than 3 months before the wedding:</strong> No refund. At this point the date is unlikely to be rebooked and significant preparation has been invested.</li>
          </ul>
          <p style={{ marginTop: 12 }}>Refunds are processed within 14 business days of written cancellation confirmation.</p>
        </Section>

        <Section title="Date Changes">
          <p>One date change is permitted at no additional charge, provided the request is made at least 6 months before the original date and the new date is available on my calendar.</p>
          <p style={{ marginTop: 12 }}>Date change requests made within 6 months of the original date, or where the new date is not available, are treated as a cancellation under the schedule above. A new booking, with a new contract and retainer, would be required for the new date.</p>
        </Section>

        <Section title="Cancellation by Photographer">
          <p>In the event I am unable to fulfill your booking due to a genuine medical emergency or circumstances entirely beyond my control, you will receive a full refund of all amounts paid. I will also make every reasonable effort to assist you in finding a replacement of comparable quality and style.</p>
          <p style={{ marginTop: 12 }}>I carry full equipment redundancy: two bodies, duplicate lenses, and dual card slots writing every frame twice. This clause is provided as a safeguard, not an expectation.</p>
        </Section>

        <Section title="Force Majeure">
          <p>If your wedding is cancelled or rendered physically or legally impossible due to circumstances genuinely outside either party's control (including government-mandated restrictions, declared natural disasters, or destruction of the venue), your full payment will be held as a credit toward a rescheduled date.</p>
          <p style={{ marginTop: 12 }}>If rescheduling is not possible, we will negotiate a fair resolution in good faith. Rain, weather conditions, change of plans, or personal circumstances on the part of the client do not qualify as force majeure events.</p>
        </Section>

        <Section title="Deliverables and Timeline">
          <p>Specific deliverables (image count, format, resolution, and extras such as albums or film) are defined in your individual contract. The timelines below are the ones published on the pricing page and are the ones that govern:</p>
          <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 14, fontSize: "0.82rem" }}>
            <thead>
              <tr>
                {["Collection", "Preview", "Full gallery", "Social clips"].map((h) => (
                  <th key={h} style={{ textAlign: "left", padding: "8px 10px 8px 0", borderBottom: "0.5px solid var(--hairline)", color: "var(--text)", fontWeight: 400, letterSpacing: ".06em" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                ["Core", "40 images within 48 hours", "5 to 7 weeks", "First week"],
                ["Signature", "60 images next day", "4 weeks", "Within 72 hours"],
                ["Story Weekend", "80 images within 24 hours", "3 weeks", "Morning after day one"],
              ].map((row) => (
                <tr key={row[0]}>
                  {row.map((cell, i) => (
                    <td key={cell} style={{ padding: "8px 10px 8px 0", borderBottom: "0.5px solid var(--hairline)", color: i === 0 ? "var(--text)" : "inherit" }}>
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          <p style={{ marginTop: 14 }}>Where you have purchased the seven-day gallery rush, the full gallery is delivered within seven days of your wedding. Film add-ons are returned once the lab has processed and scanned them, which is typically four to six weeks and is outside my control. I do not produce a cinematic wedding film in-house; where you have booked the dedicated videographer add-on, that operator's delivery timeline is stated separately in your contract.</p>
          <p style={{ marginTop: 12 }}>Galleries are delivered via a private, password-protected online gallery. Download links are active for a minimum of 90 days after delivery. I strongly recommend downloading and backing up your images promptly upon receipt.</p>
        </Section>

        <Section title="Copyright and Usage Rights">
          <p><strong style={{ color: "var(--text)" }}>I retain full copyright</strong> over all images produced during your wedding. Copyright does not transfer to the client under any circumstances.</p>
          <p style={{ marginTop: 12 }}>You are granted a <strong style={{ color: "var(--text)" }}>personal use print release</strong> for all delivered images. This means you may print, display, and share your images for personal, non-commercial use without restriction. You may not sell, license, or use the images for commercial purposes without my written consent.</p>
          <p style={{ marginTop: 12 }}>I reserve the right to use images from your wedding for portfolio purposes, including on my website, social media, and in marketing materials. If you prefer your images not be shared publicly, please notify me in writing before your date and I will respect that request.</p>
        </Section>

        <Section title="Image Editing and Style">
          <p>All delivered images are professionally edited and color graded in my established style. I do not provide unedited RAW files under any circumstances. I do not accept requests to alter my editing style, apply third-party presets, or match the aesthetic of other photographers' work.</p>
          <p style={{ marginTop: 12 }}>A selection of images may be delivered in black and white at my creative discretion. The number of images delivered may vary within the range specified in your contract based on the flow and conditions of your day.</p>
        </Section>

        <Section title="Liability">
          <p>In the unlikely event of equipment failure, file corruption, or any other circumstance that results in partial or total loss of images, my liability is limited to a refund of amounts paid. I am not liable for indirect, consequential, or special damages of any kind.</p>
          <p style={{ marginTop: 12 }}>I carry professional liability insurance. Details are available upon request.</p>
          <p style={{ marginTop: 12 }}>I am not responsible for photographs that could not be taken due to restrictions imposed by the venue, officiant, or other parties on the day. I recommend communicating with your venue about photography access in advance.</p>
        </Section>

        <Section title="Client Responsibilities">
          <p>You agree to:</p>
          <ul style={{ paddingLeft: "1.25rem", marginTop: 10, display: "flex", flexDirection: "column", gap: 6 }}>
            <li>Confirm the day timeline I prepare, in advance</li>
            <li>Ensure I have reasonable access to all locations and people to be photographed</li>
            <li>Notify key family members of any formal portrait arrangements</li>
            <li>Not hire a second photographer without informing me in advance</li>
            <li>Ensure that any guests or vendors present understand they may appear in images used for portfolio purposes, unless you have requested otherwise</li>
          </ul>
        </Section>

        <Section title="Governing Law">
          <p>These terms are governed by the laws of the Province of Québec and the federal laws of Canada applicable there, without regard to conflict-of-law principles. Any disputes will be resolved through good faith negotiation before any formal legal proceedings are initiated.</p>
        </Section>

        <Section title="Changes to These Terms">
          <p>I may update these terms from time to time. The version in effect at the time your contract is signed governs your booking. Updates to this page do not retroactively affect existing contracts.</p>
        </Section>

        <Section title="Contact">
          <p>Questions about these terms can be directed to:</p>
          <p style={{ marginTop: 10 }}>Arman Arai Photography<br /><a href="mailto:i@armanarai.com" style={{ color: "var(--accent)" }}>i@armanarai.com</a><br />Montréal, Québec, Canada</p>
        </Section>

        <div style={{ height: "0.5px", background: "var(--hairline)", marginTop: 48, marginBottom: 24 }} />
        <p style={{ fontSize: 9, color: "color-mix(in srgb, var(--text) 20%, transparent)", letterSpacing: ".18em", textTransform: "uppercase", fontFamily: "var(--font-jost)" }}>
          Arman Arai Photography · Montréal · Toronto · Vancouver
        </p>
      </div>
    </div>
  );
}
