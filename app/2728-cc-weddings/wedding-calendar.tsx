"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { track } from "@vercel/analytics";
import { CORE } from "@/lib/site";
import { isCompletedWeddingBooking, weddingCalendarUrl, WEDDING_CALENDAR } from "@/lib/wedding-booking";
import styles from "./weddings.module.css";

function record(name: string, properties: Record<string, string>) {
  try { track(name, { page: "2728-cc-weddings", ...properties }); } catch { /* Analytics must never interrupt booking. */ }
}

export function BookingLink({ children, className, placement }: { children: ReactNode; className?: string; placement: string }) {
  return <a href="#book-a-call" className={className} onClick={() => record("Wedding Call CTA", { placement })}>{children}</a>;
}

export function BookingNavigation() {
  const [hidden, setHidden] = useState(true);
  useEffect(() => {
    const section = document.getElementById("book-a-call");
    const hero = document.getElementById("hero-title");
    const footer = document.querySelector("footer");
    if (!section || !hero || !footer || typeof IntersectionObserver === "undefined") return;
    let bookingVisible = false;
    let heroVisible = true;
    let footerVisible = false;
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.target === section) bookingVisible = entry.isIntersecting;
        if (entry.target === hero) heroVisible = entry.isIntersecting;
        if (entry.target === footer) footerVisible = entry.isIntersecting;
      }
      setHidden(bookingVisible || heroVisible || footerVisible);
    });
    [section, hero, footer].forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);
  return <aside className={styles.stickyCta} hidden={hidden} aria-label="Book a wedding photography call"><span>2027 & 2028 weddings<br /><strong>From C${CORE.price.toLocaleString("en-CA")}</strong><br />Before tax · travel extra</span><BookingLink placement="mobile_bar">Book a free call ↗</BookingLink></aside>;
}

export default function WeddingCalendar() {
  const container = useRef<HTMLDivElement>(null);
  const frame = useRef<HTMLIFrameElement>(null);
  const completed = useRef(false);
  const [src, setSrc] = useState<string>();
  const [direct, setDirect] = useState(`${WEDDING_CALENDAR}?utm_source=2728-cc-weddings`);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setDirect(weddingCalendarUrl(window.location.search, window.location.hostname, false));
    const mountCalendar = () => setSrc(weddingCalendarUrl(window.location.search, window.location.hostname));
    if (!container.current || typeof IntersectionObserver === "undefined") { mountCalendar(); return; }
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) { mountCalendar(); observer.disconnect(); }
    }, { rootMargin: "650px" });
    observer.observe(container.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (completed.current || !isCompletedWeddingBooking(event.origin, !!frame.current && event.source === frame.current.contentWindow, event.data)) return;
      completed.current = true;
      // Only report an actual scheduled event, never a calendar view or a CTA click.
      // No invitee name, email, or booking URI is sent to analytics.
      record("Wedding Call Booked", { method: "calendly" });
      window.location.assign("/thank-you");
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  return <>
    <div ref={container} className={styles.calendarPanel}>
      {!loaded && <div className={styles.calendarLoading} role="status"><p>Finding a time for us to meet…</p><a href={direct} target="_blank" rel="noopener noreferrer">Open the calendar in a new tab ↗</a></div>}
      {src && <iframe ref={frame} src={src} title="Choose a date and time for your free 30-minute call with Arman" onLoad={() => setLoaded(true)} />}
    </div>
    <p className={styles.calendarFallback}>Calendar not loading? <a href={direct} target="_blank" rel="noopener noreferrer" onClick={() => record("Wedding Calendar Fallback", { placement: "calendar" })}>Choose a time in a new tab ↗</a></p>
  </>;
}
