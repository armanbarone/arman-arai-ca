"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { isPublicTrackingPath, reportPendingBooking, suspendTracking, trackPageView } from "@/lib/analytics";

/** Longest we will wait for an idle moment before loading the tags anyway. */
const IDLE_TIMEOUT_MS = 3000;

type IdleWindow = Window & {
  requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
  cancelIdleCallback?: (handle: number) => void;
};

/**
 * Loads Google and Meta on every public page view. The private client portal
 * and the admin pages carry no advertising tags, so entering them silences
 * loaded ones.
 *
 * The tags are started on an idle callback rather than straight out of the
 * effect. Between them Google Ads, GA4 and the Meta pixel cost about 600ms of
 * main-thread scripting, and running that during hydration put it inside the
 * Total Blocking Time window: the 2728 landing page measured 750ms TBT, which
 * is 30% of the Lighthouse performance score. Idle moves the same work just
 * past the point where the page becomes interactive. Nothing is dropped and no
 * consent is involved; with the 3s timeout the tags load on every real session
 * either way.
 *
 * The thank-you page is the exception and fires immediately: that is where the
 * booking conversion is reported, the visitor may close the tab straight
 * afterwards, and the page is noindex so its score is irrelevant.
 */
export default function PublicTracking() {
  const pathname = usePathname();

  useEffect(() => {
    if (!isPublicTrackingPath(pathname)) { suspendTracking(); return; }

    if (window.location.pathname === "/thank-you") {
      trackPageView();
      void reportPendingBooking();
      return;
    }

    const w = window as IdleWindow;
    const run = () => { trackPageView(); void reportPendingBooking(); };
    if (!w.requestIdleCallback) {
      const timer = window.setTimeout(run, IDLE_TIMEOUT_MS);
      return () => window.clearTimeout(timer);
    }
    const handle = w.requestIdleCallback(run, { timeout: IDLE_TIMEOUT_MS });
    return () => w.cancelIdleCallback?.(handle);
  }, [pathname]);

  return null;
}
