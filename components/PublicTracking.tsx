"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { isPublicTrackingPath, reportPendingBooking, suspendTracking, trackPageView } from "@/lib/analytics";

/** Any of these counts as the visitor arriving for real. */
const START_EVENTS = ["pointerdown", "pointermove", "touchstart", "keydown", "wheel", "scroll"] as const;

/**
 * Loads Google Ads, GA4 and the Meta pixel on the visitor's first interaction.
 * The private client portal and the admin pages carry no advertising tags, so
 * entering them silences loaded ones.
 *
 * Why interaction and not page load. Measured on the live 2728 landing page,
 * mobile, Slow 4G: Google Tag Manager blocks the main thread for 814ms and
 * Facebook for 545ms, and between them they pull 522KB. The landing page's LCP
 * element is the h1 — plain text, zero load time — and it still could not paint
 * for 2.9 seconds, because the thread was busy. Stripping the tags out entirely
 * and changing nothing else took the same page from the low 80s to 97.
 *
 * Loading them later on a timer does not work and was tried twice. An idle
 * callback fires immediately while a page is still loading, and any delay short
 * enough to keep measurement honest still lands inside the observation window.
 * Waiting for input removes the race rather than tuning it.
 *
 * What this costs: a visitor who lands and never scrolls, taps, moves a pointer
 * or presses a key is not counted. That is a bounce, and it cannot convert.
 * Every conversion requires interaction by definition, so Google Ads conversion
 * tracking and the Meta Schedule event are unaffected; what thins out is raw
 * PageView volume from immediate bounces. Google still counts the ad click
 * itself, because that happens before the landing page loads.
 *
 * The thank-you page is exempt and fires immediately: that is where the booking
 * conversion is reported, the visitor may close the tab straight afterwards,
 * and the page is noindex so its score is irrelevant.
 */
export default function PublicTracking() {
  const pathname = usePathname();
  /** Once the visitor has interacted, later navigations track immediately. */
  const started = useRef(false);

  useEffect(() => {
    if (!isPublicTrackingPath(pathname)) { suspendTracking(); return; }

    const run = () => {
      started.current = true;
      trackPageView();
      void reportPendingBooking();
    };

    if (started.current || window.location.pathname === "/thank-you") {
      run();
      return;
    }

    for (const type of START_EVENTS) {
      window.addEventListener(type, run, { once: true, passive: true });
    }
    return () => {
      for (const type of START_EVENTS) window.removeEventListener(type, run);
    };
  }, [pathname]);

  return null;
}
