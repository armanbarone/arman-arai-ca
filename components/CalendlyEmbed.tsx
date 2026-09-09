"use client";

import { useEffect, useRef, useState } from "react";

/**
 * The scheduler on the page rather than behind a button.
 *
 * A bare iframe, not Calendly's widget.js: the script costs ~90 KB and buys
 * nothing an iframe cannot do here. It mounts only when the block nears the
 * viewport, so a visitor who never scrolls to it never pays for it, and any
 * utm parameters on the inbound link ride along so a booking stays attributable
 * to the campaign that produced it.
 */
const BASE = "https://calendly.com/i-armanarai/30-minute-meeting-wedding";
const ACCENT = "#B8956A";
const CREAM = "#E8E0D0";

export default function CalendlyEmbed({ height = 720 }: { height?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [src, setSrc] = useState<string | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const build = () => {
      const q = new URLSearchParams(window.location.search);
      const p = new URLSearchParams({
        hide_gdpr_banner: "1",
        primary_color: "b8956a",
        hide_landing_page_details: "1",
        background_color: "0e0c0a",
        text_color: "e8e0d0",
        embed_domain: window.location.hostname,
        embed_type: "Inline",
      });
      for (const k of ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"]) {
        const v = q.get(k);
        if (v) p.set(k, v);
      }
      if (!q.get("utm_source")) p.set("utm_source", window.location.pathname.replace(/^\//, "") || "site");
      setSrc(`${BASE}?${p.toString()}`);
    };

    if (typeof IntersectionObserver === "undefined") {
      build();
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          build();
          io.disconnect();
        }
      },
      { rootMargin: "500px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={{
        border: "0.5px solid rgba(184,149,106,.25)",
        background: "#0E0C0A",
        minHeight: height,
        position: "relative",
        overflow: "hidden",
      }}
    >
      {src ? (
        <iframe
          src={src}
          title="Book a 30-minute call with Arman Arai"
          width="100%"
          height={height}
          loading="lazy"
          style={{ display: "block", border: "none", minWidth: 300 }}
        />
      ) : (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.8rem",
            textAlign: "center",
            padding: "2rem",
          }}
        >
          <span
            style={{
              fontSize: "0.6rem",
              letterSpacing: "0.3em",
              textTransform: "uppercase",
              color: ACCENT,
              fontFamily: "var(--font-jost)",
            }}
          >
            Loading the calendar
          </span>
          <span
            style={{
              fontFamily: "var(--font-cormorant)",
              fontStyle: "italic",
              fontSize: "1.1rem",
              color: CREAM,
              opacity: 0.55,
            }}
          >
            Pick any 30 minutes that suits you
          </span>
        </div>
      )}
    </div>
  );
}
