"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { getConsent, isPublicTrackingPath, reportPendingBooking, setConsent, suspendTracking, trackPageView, type Consent } from "@/lib/analytics";
import styles from "./PublicTracking.module.css";

export default function PublicTracking() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [choice, setChoice] = useState<Consent | null>(null);
  const isPublic = isPublicTrackingPath(pathname);

  useEffect(() => {
    if (!isPublic) { suspendTracking(); return; }
    const consent = getConsent();
    setChoice(consent);
    setOpen(consent === null);
    if (consent === "accepted") {
      trackPageView();
      void reportPendingBooking();
    }
  }, [pathname, isPublic]);

  function choose(next: Consent) {
    setConsent(next);
    setChoice(next);
    setOpen(false);
    if (next === "accepted") {
      trackPageView();
      void reportPendingBooking();
    }
  }

  if (!isPublic) return null;
  return <>
    <div className={styles.settings}><button type="button" onClick={() => setOpen(true)}>Cookie settings</button></div>
    {open && <section className={styles.notice} aria-label="Cookie preferences">
      <p className={styles.title}>A note on cookies</p>
      <p>With your permission, Google Analytics, Google Ads and Meta help me understand visits and which ads lead to booked calls. You can book with either choice. <a href="/privacy-policy">Privacy policy</a></p>
      <div className={styles.actions}>
        <button type="button" onClick={() => choose("declined")}>Decline optional cookies</button>
        <button type="button" onClick={() => choose("accepted")}>Accept optional cookies</button>
      </div>
      {choice && <button className={styles.close} type="button" onClick={() => setOpen(false)}>Keep current choice</button>}
    </section>}
  </>;
}
