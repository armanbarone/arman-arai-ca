/* The lead shape, shared by the server store and the client tracker.
 *
 * Kept apart from leads.ts because that file is "server-only" and the tracker
 * is a client component: importing the store from the browser bundle fails the
 * build, and the type is the only part the browser actually needs.
 */

export type LeadStage =
  | "new"
  | "replied"
  | "consult"
  | "quoted"
  | "booked"
  | "lost";

export const LEAD_STAGES: { key: LeadStage; label: string }[] = [
  { key: "new", label: "New" },
  { key: "replied", label: "Replied" },
  { key: "consult", label: "Consult booked" },
  { key: "quoted", label: "Quoted" },
  { key: "booked", label: "Booked" },
  { key: "lost", label: "Lost" },
];

export interface Lead {
  id: string;
  /** When the inquiry arrived. */
  receivedAt: string;
  name: string;
  partnerName?: string;
  email: string;
  phone?: string;
  /** "Google Ads", "Meta", "Direct" and so on, as the lead email labels it. */
  source: string;
  /** Which form, so a pricing request is not counted as a full inquiry. */
  formType?: string;
  weddingDate?: string;
  market?: string;
  venue?: string;
  guestCount?: string;
  collection?: string;
  message?: string;
  /** Everything needed to trace a booking back to the click that made it. */
  attribution?: {
    utmSource?: string;
    utmMedium?: string;
    utmCampaign?: string;
    utmContent?: string;
    utmTerm?: string;
    gclid?: string;
    fbclid?: string;
    landingPage?: string;
    referrer?: string;
  };

  // ---- the part Arman keeps up to date
  stage: LeadStage;
  consult: boolean;
  consultAt?: string;
  booked: boolean;
  /** The wedding this lead became, when it became one. */
  bookingRef?: string;
  /** Contract value in cents, so it adds up without floating point. */
  valueCents?: number;
  lostReason?: string;
  notes?: string;

  /** "gmail:<id>" when it was backfilled rather than captured live. */
  importedFrom?: string;
  createdAt: string;
  updatedAt: string;
}
