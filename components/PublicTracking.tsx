"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { isPublicTrackingPath, reportPendingBooking, suspendTracking, trackPageView } from "@/lib/analytics";

/** Measure public visits as soon as the page mounts, including visits with no
 * interaction. Advertising tags remain off inside private and admin pages. */
export default function PublicTracking() {
  const pathname = usePathname();
  useEffect(() => {
    // A portable design preview can be served at a different pathname.
    if (document.querySelector('[data-christmas-preview="true"]')) { suspendTracking(); return; }
    if (!isPublicTrackingPath(pathname)) { suspendTracking(); return; }
    // Page views include inquiry confirmations. A Lead still requires a
    // successful submission receipt, handled by ThankYouFromSession.
    trackPageView();
    void reportPendingBooking();
  }, [pathname]);
  return null;
}
