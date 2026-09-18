import type { Metadata } from "next";


export const metadata: Metadata = {
  title: { absolute: "Thank You | Arman Arai" },
  alternates: { canonical: "https://www.armanarai.ca/thank-you" },
  robots: { index: false, follow: true, googleBot: { index: false, follow: true } },
};

export default function ThankYou() {
  return (
    <>

    <div style={{
      minHeight: "100svh", background: "#080704", display: "flex",
      flexDirection: "column", alignItems: "center", justifyContent: "center",
      padding: "2rem 1.5rem", textAlign: "center",
    }}>
      <span style={{ fontFamily: "var(--font-jost)", fontSize: "2.5rem", color: "#E8E0D0", display: "block", marginBottom: 24 }}>
        Arman Arai
      </span>

      <div style={{ maxWidth: 520, width: "100%" }}>
        <div style={{ width: 36, height: 0.5, background: "#B8956A", margin: "0 auto 24px" }} />

        <h1 style={{ fontFamily: "var(--font-jost)", fontWeight: 300, fontSize: "clamp(1.8rem,6vw,2.8rem)", color: "#E8E0D0", lineHeight: 1.15, marginBottom: 16 }}>
          You&rsquo;re booked in.<br />
          <em style={{ fontStyle: "italic", color: "#B8956A" }}>I&rsquo;ll see you soon.</em>
        </h1>

        <p style={{ color: "rgba(232,224,208,0.78)", fontSize: "clamp(0.88rem,3.5vw,1rem)", lineHeight: 1.85, marginBottom: 36, fontFamily: "var(--font-jost)", fontWeight: 300 }}>
          Your confirmation email and Google Meet invite are on their way to your inbox. Please respond <strong style={{ color: "#E8E0D0" }}>&ldquo;Yes&rdquo;</strong> to add our call to your calendar.
        </p>

        <div style={{ background: "#141210", border: "0.5px solid #2A2520", padding: "1.75rem 1.5rem", marginBottom: 36 }}>
          <p style={{ fontSize: 9, letterSpacing: ".28em", textTransform: "uppercase", color: "#B8956A", marginBottom: 14, fontFamily: "var(--font-jost)" }}>
            Next steps
          </p>
          {[
            "Check your inbox for the Google Meet invite",
            "Click 'Yes' to accept the invitation",
            "You’ll find the Google Meet link in the invitation",
            "Come with any questions about your wedding day",
          ].map((step, i) => (
            <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "0.75rem", marginBottom: i < 3 ? "0.75rem" : 0, textAlign: "left" }}>
              <span style={{ color: "#B8956A", fontSize: 10, flexShrink: 0, marginTop: "0.15rem", fontFamily: "var(--font-jost)" }}>0{i + 1}</span>
              <p style={{ color: "rgba(232,224,208,0.78)", fontSize: "clamp(0.82rem,3.5vw,0.88rem)", lineHeight: 1.7, fontFamily: "var(--font-jost)", fontWeight: 300 }}>{step}</p>
            </div>
          ))}
        </div>

        <p style={{ color: "rgba(232,224,208,0.68)", fontSize: "clamp(0.82rem,3.5vw,0.88rem)", marginBottom: 20, fontFamily: "var(--font-jost)", fontWeight: 300 }}>
          Questions before our call? Message me directly on Instagram:
        </p>

        <a
          href="https://ig.me/m/iArmanArai"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "inline-flex", alignItems: "center", gap: "0.6rem",
            background: "linear-gradient(135deg, #833ab4, #fd1d1d, #fcb045)",
            color: "#fff", padding: "0.85rem 2rem", textDecoration: "none",
            fontSize: 11, letterSpacing: ".18em", textTransform: "uppercase",
            fontFamily: "var(--font-jost)",
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
          </svg>
          Message @iArmanArai
        </a>

        <div style={{ marginTop: 48, height: 0.5, background: "#2A2520", marginBottom: 16 }} />
        <p style={{ fontSize: 9, color: "rgba(232,224,208,0.6)", letterSpacing: ".18em", textTransform: "uppercase", fontFamily: "var(--font-jost)" }}>
          Wedding photography · Across Canada
        </p>
      </div>
    </div>
    </>
  );
}

