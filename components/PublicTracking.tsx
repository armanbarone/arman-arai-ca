"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { isPublicTrackingPath, reportPendingBooking, suspendTracking, trackPageView } from "@/lib/analytics";

/** Measure public visits as soon as the page mounts, including visits with no
 * interaction. Advertising tags remain off inside private and admin pages. */
export default function PublicTracking() {
  const pathname = usePathname();
  useEffect(() => {
    if (!isPublicTrackingPath(pathname)) { suspendTracking(); return; }
    trackPageView();
    void reportPendingBooking();
  }, [pathname]);
  return null;
}
