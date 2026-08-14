import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | Arman Arai",
  description: "Privacy policy for armanarai.com: how your information is collected, used, and protected.",
  robots: { index: true, follow: true },
  alternates: { canonical: "https://www.armanarai.ca/privacy-policy" },
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

export default function PrivacyPolicy() {
  return (
    <div style={{ background: "var(--bg)", minHeight: "100svh" }}>
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "clamp(6rem,12vw,10rem) 1.5rem 5rem" }}>

        <p style={{ fontSize: 9, letterSpacing: ".32em", textTransform: "uppercase", color: "var(--accent)", marginBottom: 16, fontFamily: "var(--font-jost)" }}>
          Legal
        </p>
        <h1 style={{ fontFamily: "var(--font-serif)", fontWeight: 300, fontSize: "clamp(2rem,5vw,3.5rem)", color: "var(--text)", lineHeight: 1.1, marginBottom: 12 }}>
          Privacy Policy
        </h1>
        <p style={{ color: "var(--label)", fontSize: "0.78rem", letterSpacing: ".1em", fontFamily: "var(--font-jost)", marginBottom: 48 }}>
          Last updated: June 2026
        </p>

        <div style={{ height: "0.5px", background: "var(--hairline)", marginBottom: 48 }} />

        <Section title="Who We Are">
          <p>This website is operated by Arman Arai, an wedding planner, curator, photographer and filmmaker based in Medellín, Colombia and Vancouver, Canada. References to "I", "me", or "my" throughout this policy refer to Arman Arai Photography.</p>
          <p style={{ marginTop: 12 }}>Contact: <a href="mailto:i@armanarai.com" style={{ color: "var(--accent)" }}>i@armanarai.com</a></p>
        </Section>

        <Section title="Information I Collect">
          <p>When you submit an inquiry through the contact form on this website, I collect:</p>
          <ul style={{ paddingLeft: "1.25rem", marginTop: 10, display: "flex", flexDirection: "column", gap: 6 }}>
            <li>Your name and your partner's name</li>
            <li>Email address and phone number</li>
            <li>Wedding date, venue, and location</li>
            <li>Guest count and how you found me</li>
            <li>Any message or story you choose to share</li>
          </ul>
          <p style={{ marginTop: 12 }}>When you book a call through Calendly, Calendly collects your name, email address, and scheduling preferences according to their own privacy policy.</p>
          <p style={{ marginTop: 12 }}>I also collect standard technical data through analytics tools (see Third Party Services below), including pages visited, time on site, browser type, and approximate location based on IP address.</p>
        </Section>

        <Section title="How I Use Your Information">
          <p>Information you provide through the contact form is used solely to:</p>
          <ul style={{ paddingLeft: "1.25rem", marginTop: 10, display: "flex", flexDirection: "column", gap: 6 }}>
            <li>Respond to your inquiry and discuss your wedding</li>
            <li>Send a custom proposal or pricing information</li>
            <li>Communicate about your booking if we proceed to contract</li>
            <li>Deliver your gallery and related correspondence</li>
          </ul>
          <p style={{ marginTop: 12 }}>I do not sell, rent, or share your personal information with third parties for marketing purposes. I do not send unsolicited emails or add you to mailing lists without your consent.</p>
        </Section>

        <Section title="Third Party Services">
          <p>This website uses the following third party tools. Each is governed by its own privacy policy:</p>
          <ul style={{ paddingLeft: "1.25rem", marginTop: 10, display: "flex", flexDirection: "column", gap: 10 }}>
            <li><strong style={{ color: "var(--text)" }}>Resend</strong>: used to deliver inquiry form submissions to my inbox. Your submitted information is transmitted through Resend's infrastructure.</li>
            <li><strong style={{ color: "var(--text)" }}>Calendly</strong>: used for scheduling consultations. When you book a call, Calendly's privacy policy governs that interaction.</li>
            <li><strong style={{ color: "var(--text)" }}>Meta Pixel (Facebook)</strong>: used to measure the effectiveness of advertising on Facebook and Instagram. This tool may set cookies and collect data about your visit.</li>
            <li><strong style={{ color: "var(--text)" }}>Google Analytics (GA4)</strong>: used to understand how visitors interact with this website. Data is anonymized and aggregated.</li>
            <li><strong style={{ color: "var(--text)" }}>Google Ads</strong>: used to measure conversions from advertising campaigns. A conversion event is recorded when you complete a booking on the thank-you page.</li>
            <li><strong style={{ color: "var(--text)" }}>Google Tag Manager</strong>: used to manage tracking scripts on this website.</li>
            <li><strong style={{ color: "var(--text)" }}>Vercel</strong>: this website is hosted on Vercel's infrastructure. Vercel may collect standard server logs.</li>
          </ul>
        </Section>

        <Section title="Cookies">
          <p>This website uses cookies and similar tracking technologies, primarily through the third party services listed above. These may include:</p>
          <ul style={{ paddingLeft: "1.25rem", marginTop: 10, display: "flex", flexDirection: "column", gap: 6 }}>
            <li>Analytics cookies (Google Analytics) to understand site usage</li>
            <li>Advertising cookies (Meta Pixel, Google Ads) to measure ad performance</li>
            <li>Functional cookies (Calendly) to enable booking functionality</li>
          </ul>
          <p style={{ marginTop: 12 }}>You can control or disable cookies through your browser settings. Disabling cookies may affect the functionality of certain features on this site.</p>
        </Section>

        <Section title="Data Retention">
          <p>Inquiry form submissions are retained in my email inbox for as long as reasonably necessary to manage our correspondence. If we enter into a contract, your information is retained for the duration of our working relationship and for a period of up to 3 years after delivery of your final gallery, in accordance with standard business record-keeping practices.</p>
          <p style={{ marginTop: 12 }}>Analytics data collected through Google and Meta is retained according to those platforms' data retention settings.</p>
        </Section>

        <Section title="Your Rights">
          <p>Depending on your location, you may have the right to:</p>
          <ul style={{ paddingLeft: "1.25rem", marginTop: 10, display: "flex", flexDirection: "column", gap: 6 }}>
            <li>Request access to the personal information I hold about you</li>
            <li>Request correction of inaccurate information</li>
            <li>Request deletion of your information</li>
            <li>Withdraw consent to processing where consent is the legal basis</li>
            <li>Opt out of advertising tracking through your browser or device settings</li>
          </ul>
          <p style={{ marginTop: 12 }}>To exercise any of these rights, contact me at <a href="mailto:i@armanarai.com" style={{ color: "var(--accent)" }}>i@armanarai.com</a>. I will respond within 30 days.</p>
          <p style={{ marginTop: 12 }}>For Canadian residents, this policy is intended to comply with the Personal Information Protection and Electronic Documents Act (PIPEDA). For visitors in the European Economic Area, your rights are governed by the General Data Protection Regulation (GDPR).</p>
        </Section>

        <Section title="Children's Privacy">
          <p>This website is not directed at children under the age of 16. I do not knowingly collect personal information from anyone under 16. If you believe a child has submitted information through this site, please contact me and I will delete it promptly.</p>
        </Section>

        <Section title="Changes to This Policy">
          <p>I may update this privacy policy from time to time. When I do, I will update the "Last updated" date at the top of this page. Continued use of this website after changes constitutes acceptance of the updated policy.</p>
        </Section>

        <Section title="Contact">
          <p>Questions about this privacy policy can be directed to:</p>
          <p style={{ marginTop: 10 }}>Arman Arai Photography<br /><a href="mailto:i@armanarai.com" style={{ color: "var(--accent)" }}>i@armanarai.com</a><br />Medellín, Colombia / Vancouver, Canada</p>
        </Section>

        <div style={{ height: "0.5px", background: "var(--hairline)", marginTop: 48, marginBottom: 24 }} />
        <p style={{ fontSize: 9, color: "color-mix(in srgb, var(--text) 20%, transparent)", letterSpacing: ".18em", textTransform: "uppercase", fontFamily: "var(--font-jost)" }}>
          Arman Arai Photography · Medellín · Vancouver · Worldwide
        </p>
      </div>
    </div>
  );
}
