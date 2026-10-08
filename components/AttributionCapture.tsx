"use client";

import { useEffect } from "react";
import { captureFirstTouch } from "@/lib/attribution";

/* Stores the visit's first-touch attribution on the first pageview, so the
 * inquiry modal and the contact form can name the ad, the search or the
 * referral that produced a lead even when the couple browsed several pages
 * before sending it. Renders nothing. */
export default function AttributionCapture() {
  useEffect(() => { captureFirstTouch(); }, []);
  return null;
}
