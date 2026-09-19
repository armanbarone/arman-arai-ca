"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { isPublicTrackingPath, reportPendingBooking, suspendTracking, trackPageView } from "@/lib/analytics";

/** Loads Google and Meta on the first view of any public page, and on every
 *  client-side navigation after it. The private client portal and the admin
 *  pages carry no advertising tags, so entering them silences loaded ones. */
export default function PublicTracking() {
  const pathname = usePathname();

  useEffect(() => {
    if (!isPublicTrackingPath(pathname)) { suspendTracking(); return; }
    trackPageView();
    // The booking conversion is reported once, on the thank-you page.
    void reportPendingBooking();
  }, [pathname]);

  return null;
}
