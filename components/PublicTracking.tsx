"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { isPricingThankYouPath, isPublicTrackingPath, reportPendingBooking, suspendTracking, trackPageView } from "@/lib/analytics";

/** Measure public visits as soon as the page mounts, including visits with no
 * interaction. Advertising tags remain off inside private and admin pages. */
export default function PublicTracking() {
  const pathname = usePathname();
  useEffect(() => {
    if (!isPublicTrackingPath(pathname)) { suspendTracking(); return; }
    // A pricing thank-you page starts its own tags, and only after a real
    // submission, so a direct visit never counts as a conversion.
    if (isPricingThankYouPath(pathname)) return;
    trackPageView();
    void reportPendingBooking();
  }, [pathname]);
  return null;
}
