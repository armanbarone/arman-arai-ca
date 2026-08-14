import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | Arman Arai",
  description: "Privacy policy for armanarai.ca: what this site collects, what it does not, and how your information is used and protected.",
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
          Last updated: August 2026
        </p>

        <div style={{ height: "0.5px", background: "var(--hairline)", marginBottom: 48 }} />

        <Section title="Who We Are">
          <p>This website, armanarai.ca, is operated by Arman Arai, a wedding photographer based in Montréal and working across Canada. References to "I", "me", or "my" throughout this policy refer to Arman Arai Photography.</p>
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
          <p style={{ marginTop: 12 }}>I also collect aggregate traffic data: which pages are visited, roughly how long for, the type of device, and the country the request came from. It is measured without cookies and it is not tied to you as an individual. See Third Party Services below.</p>
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
            <li><strong style={{ color: "var(--text)" }}>Resend</strong>: delivers inquiry form submissions to my inbox. What you type into the form is transmitted through Resend's infrastructure.</li>
            <li><strong style={{ color: "var(--text)" }}>Vercel</strong>: hosts this website and provides its traffic analytics. Vercel keeps standard server logs. Vercel Analytics is cookieless and does not build a profile of you across sites.</li>
            <li><strong style={{ color: "var(--text)" }}>Cloudflare</strong>: serves the photographs on this site from cdn.armanarai.ca and sits in front of it as a CDN. Cloudflare keeps standard request logs.</li>
          </ul>
          <p style={{ marginTop: 12 }}>That is the complete list. This site runs no advertising pixel, no Google Analytics, no tag manager, and no third-party scheduling widget.</p>
        </Section>

        <Section title="Cookies">
          <p><strong style={{ color: "var(--text)" }}>This website sets no advertising or analytics cookies.</strong> Traffic measurement here is cookieless, and there is no Meta pixel, Google Ads tag, or cross-site tracker on any page.</p>
          <p style={{ marginTop: 12 }}>Cloudflare may set a strictly necessary cookie for security and bot mitigation. You can control or block cookies through your browser settings; doing so will not break anything on this site.</p>
        </Section>

        <Section title="Data Retention">
          <p>Inquiry form submissions are retained in my email inbox for as long as reasonably necessary to manage our correspondence. If we enter into a contract, your information is retained for the duration of our working relationship and for a period of up to 3 years after delivery of your final gallery, in accordance with standard business record-keeping practices.</p>
          <p style={{ marginTop: 12 }}>Aggregate traffic data is retained by Vercel according to their platform retention settings. It contains nothing that identifies you.</p>
        </Section>

        <Section title="Your Rights">
          <p>Depending on your location, you may have the right to:</p>
          <ul style={{ paddingLeft: "1.25rem", marginTop: 10, display: "flex", flexDirection: "column", gap: 6 }}>
            <li>Request access to the personal information I hold about you</li>
            <li>Request correction of inaccurate information</li>
            <li>Request deletion of your information</li>
            <li>Withdraw consent to processing where consent is the legal basis</li>
          </ul>
          <p style={{ marginTop: 12 }}>To exercise any of these rights, contact me at <a href="mailto:i@armanarai.com" style={{ color: "var(--accent)" }}>i@armanarai.com</a>. I will respond within 30 days.</p>
          <p style={{ marginTop: 12 }}>This policy is intended to comply with the Personal Information Protection and Electronic Documents Act (PIPEDA), and, for residents of Québec, with the province's Law 25. If you are visiting from the European Economic Area, your rights are governed by the General Data Protection Regulation (GDPR).</p>
        </Section>

        <Section title="Children's Privacy">
          <p>This website is not directed at children under the age of 16. I do not knowingly collect personal information from anyone under 16. If you believe a child has submitted information through this site, please contact me and I will delete it promptly.</p>
        </Section>

        <Section title="Changes to This Policy">
          <p>I may update this privacy policy from time to time. When I do, I will update the "Last updated" date at the top of this page. Continued use of this website after changes constitutes acceptance of the updated policy.</p>
        </Section>

        <Section title="Contact">
          <p>Questions about this privacy policy can be directed to:</p>
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
