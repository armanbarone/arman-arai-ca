"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import Script from "next/script";
import { track } from "@vercel/analytics";
import { ENTRY } from "@/lib/site";
import { completeWeddingBooking } from "@/lib/analytics";
import { isCompletedWeddingBooking, weddingCalendarUrl, WEDDING_CALENDAR } from "@/lib/wedding-booking";

function record(name: string, properties: Record<string, string>) {
  try { track(name, { page: window.location.pathname.replace(/^\/|\/$/g, ""), ...properties }); } catch { /* Analytics must never interrupt booking. */ }
}

export function BookingLink({ children, className, placement }: { children: ReactNode; className?: string; placement: string }) {
  return <a href="#book-a-call" className={className} onClick={() => record("Wedding Call CTA", { placement })}>{children}</a>;
}

export function BookingNavigation({ classes, dateFirst = false }: { classes: Record<string, string>; dateFirst?: boolean }) {
  const [hidden, setHidden] = useState(true);
  useEffect(() => {
    const section = document.getElementById("book-a-call");
    const hero = document.getElementById(dateFirst ? "check-date" : "hero-title");
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
  }, [dateFirst]);
  return <aside className={classes.stickyCta} hidden={hidden} aria-label={dateFirst ? "Check your wedding date" : "Book a wedding photography call"}><span>2027 & 2028 weddings<br /><strong>From C${ENTRY.price.toLocaleString("en-CA")}</strong><br />Before tax · travel extra</span>{dateFirst ? <a href="#check-date">Check your date ↗</a> : <BookingLink placement="mobile_bar">Book a free call ↗</BookingLink>}</aside>;
}

export default function WeddingCalendar({ page = "2728-cc-weddings", theme = "light", classes }: { page?: string; theme?: "light" | "dark"; classes: Record<string, string> }) {
  const container = useRef<HTMLDivElement>(null);
  const widget = useRef<HTMLDivElement>(null);
  const completed = useRef(false);
  const [src, setSrc] = useState<string>();
  const [direct, setDirect] = useState(`${WEDDING_CALENDAR}?utm_source=${encodeURIComponent(page)}`);
  const [loaded, setLoaded] = useState(false);
  const [scriptReady, setScriptReady] = useState(false);

  useEffect(() => {
    const options = { page, theme };
    setDirect(weddingCalendarUrl(window.location.search, window.location.hostname, false, options));
    const mountCalendar = () => setSrc(weddingCalendarUrl(window.location.search, window.location.hostname, true, options));
    if (!container.current || typeof IntersectionObserver === "undefined") { mountCalendar(); return; }
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) { mountCalendar(); observer.disconnect(); }
    }, { rootMargin: "650px" });
    observer.observe(container.current);
    return () => observer.disconnect();
  }, [page, theme]);

  useEffect(() => {
    if (!scriptReady || !src || !widget.current) return;
    const host = widget.current;
    const calendly = (window as unknown as { Calendly?: { initInlineWidget: (options: { url: string; parentElement: HTMLElement; resize: boolean }) => void } }).Calendly;
    if (!calendly) return;
    // Use Calendly's supported widget so completion notifications are enabled.
    calendly.initInlineWidget({ url: src, parentElement: host, resize: true });
    const iframe = host.querySelector("iframe");
    const onLoad = () => setLoaded(true);
    if (iframe) {
      iframe.title = "Choose a date and time for your free 30-minute call with Arman";
      iframe.addEventListener("load", onLoad);
    }
    return () => { iframe?.removeEventListener("load", onLoad); host.replaceChildren(); };
  }, [scriptReady, src]);

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      const iframe = widget.current?.querySelector("iframe");
      if (completed.current || !isCompletedWeddingBooking(event.origin, !!iframe && event.source === iframe.contentWindow, event.data)) return;
      completed.current = true;
      // Only report an actual scheduled event, never a calendar view or a CTA click.
      // No invitee name, email, or booking URI is sent to analytics.
      record("Wedding Call Booked", { method: "calendly" });
      void completeWeddingBooking(event.data);
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  return <>
    <div ref={container} className={classes.calendarPanel}>
      {!loaded && <div className={classes.calendarLoading} role="status"><p>Finding a time for us to meet…</p><a href={direct} target="_blank" rel="noopener noreferrer">Open the calendar in a new tab ↗</a></div>}
      <div ref={widget} className={classes.widgetHost} />
      {src && <Script src="https://assets.calendly.com/assets/external/widget.js" strategy="afterInteractive" onReady={() => setScriptReady(true)} />}
    </div>
    <p className={classes.calendarFallback}>Calendar not loading? <a href={direct} target="_blank" rel="noopener noreferrer" onClick={() => record("Wedding Calendar Fallback", { placement: "calendar" })}>Choose a time in a new tab ↗</a></p>
  </>;
}
