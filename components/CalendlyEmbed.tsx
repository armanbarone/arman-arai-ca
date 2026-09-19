"use client";

import { useEffect, useRef, useState } from "react";
import Script from "next/script";
import { completeWeddingBooking } from "@/lib/analytics";
import { isCompletedWeddingBooking } from "@/lib/wedding-booking";

/** The supported widget sends completion events; a bare iframe does not. */
const BASE = "https://calendly.com/i-armanarai/30-minute-meeting-wedding";
const ACCENT = "#B8956A";
const CREAM = "#E8E0D0";

export default function CalendlyEmbed({ height = 720 }: { height?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const widget = useRef<HTMLDivElement>(null);
  const completed = useRef(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      const iframe = widget.current?.querySelector("iframe");
      if (completed.current || !isCompletedWeddingBooking(event.origin, !!iframe && event.source === iframe.contentWindow, event.data)) return;
      completed.current = true;
      void completeWeddingBooking(event.data);
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);
  const [src, setSrc] = useState<string | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const build = () => {
      const q = new URLSearchParams(window.location.search);
      const p = new URLSearchParams({
        primary_color: "b8956a",
        hide_event_type_details: "1",
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

  useEffect(() => {
    if (!ready || !src || !widget.current) return;
    const host = widget.current;
    const calendly = (window as unknown as { Calendly?: { initInlineWidget: (options: { url: string; parentElement: HTMLElement; resize: boolean }) => void } }).Calendly;
    calendly?.initInlineWidget({ url: src, parentElement: host, resize: true });
    const iframe = host.querySelector("iframe");
    if (iframe) iframe.title = "Book a 30-minute call with Arman Arai";
    return () => host.replaceChildren();
  }, [ready, src]);

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
        <>
          <div ref={widget} style={{ minWidth: 280, height }} />
          <Script src="https://assets.calendly.com/assets/external/widget.js" strategy="afterInteractive" onReady={() => setReady(true)} />
        </>
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
          {/* Calendly is a third-party script and was measured still spinning
              after six seconds. Never leave the only booking path behind it. */}
          <a
            href={BASE}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              fontFamily: "var(--font-jost)",
              fontSize: "0.72rem",
              letterSpacing: "0.12em",
              color: ACCENT,
              textDecoration: "underline",
              textUnderlineOffset: "4px",
              marginTop: "0.4rem",
            }}
          >
            Calendar not loading? Choose a time in a new tab ↗
          </a>
        </div>
      )}
    </div>
  );
}
