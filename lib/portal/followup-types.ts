/* Shared by the server store and the client components, for the same reason
   the lead types are: followups.ts is server-only and the UI is not. */

export interface FollowUpSubject {
  kind: "lead" | "booking";
  id: string;
  /** Who it is about, denormalised so a list does not need a second read. */
  label: string;
}

export interface FollowUp {
  id: string;
  subject: FollowUpSubject;
  title: string;
  /** YYYY-MM-DD. */
  due: string;
  done: boolean;
  doneAt?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

/** The ones Arman reaches for, so a follow-up is two clicks not a form. */
export const QUICK_FOLLOW_UPS = [
  "Chase for a reply",
  "Send the quote",
  "Book the consult",
  "Confirm the date",
  "Chase the signature",
  "Chase the payment",
  "Check in before the wedding",
];
