// One booking is one JSON document in the private Blob store. Everything a
// couple signs, pays and follows hangs off it, so the audit trail, payments and
// planning list can never drift apart in separate tables.
//
// Money is integer cents (CAD). Tax rates are basis points (5% = 500).
// Timestamps are ISO strings in UTC. Calendar dates are YYYY-MM-DD.

export type Lang = "en" | "fr";

export type BookingStatus =
  | "draft"
  | "contract_sent"
  | "partially_signed"
  | "signed"
  | "booked" // deposit received
  | "in_planning"
  | "completed"
  | "cancelled";

export interface Address {
  line1: string;
  line2?: string;
  city: string;
  province: string; // two-letter code
  postalCode: string;
}

export interface Client {
  id: string;
  legalName: string;
  preferredName: string;
  email: string; // lower-case
  phone: string;
  address: Address;
}

export interface PriceLine {
  id: string;
  kind: "package" | "addon" | "discount";
  label: string;
  cents: number; // discounts are stored negative
}

/** How the package subtotal divides across its parts. Used only to value an
 *  undelivered part under the agreement; it never changes what the couple pays. */
export interface AllocationLine {
  key: string;
  label: string;
  bps: number; // share of subtotal, 10000 = 100%
}

export interface TaxLine {
  code: string;
  label: string;
  rateBps: number;
  registration: string;
}

export interface Installment {
  id: string;
  label: string;
  kind: "deposit" | "instalment";
  dueDate: string; // YYYY-MM-DD
  dueRule: string; // human description, e.g. "6 calendar months before the elopement"
  subtotalCents: number;
  taxCents: Record<string, number>; // per tax code
  totalCents: number;
  paidCents: number;
  status: "scheduled" | "due" | "processing" | "partially_paid" | "paid" | "overdue" | "failed" | "refunded" | "void";
  paidAt?: string;
  reference: string; // e.g. AA-CA-2027-014-01
  clientReportedSentAt?: string;
}

export interface Payment {
  id: string;
  installmentId: string;
  amountCents: number;
  method: "stripe_card" | "stripe_pad" | "interac_etransfer" | "other";
  status: "processing" | "succeeded" | "failed" | "refunded";
  stripeCheckoutSessionId?: string;
  stripePaymentIntentId?: string;
  etransferReference?: string;
  receivedAt: string;
  recordedBy: "system" | "admin";
  receiptNumber?: string;
}

export type PlanningStatus = "todo" | "in_progress" | "done" | "not_applicable";

export interface PlanningItem {
  id: string;
  section: string;
  titleEn: string;
  titleFr: string;
  dueDate?: string;
  status: PlanningStatus;
  clientVisible: boolean;
  clientNote?: string;
  internalNote?: string;
  completedAt?: string;
  statusChangedAt?: string;
  notifiedAt?: string;
  sortOrder: number;
}

export interface AuditEvent {
  at: string;
  type: string;
  actor: string; // email, "system" or "admin"
  ip?: string;
  userAgent?: string;
  detail?: Record<string, unknown>;
}

export interface Booking {
  schema: 1;
  ref: string; // AA-CA-2027-014
  createdAt: string;
  updatedAt: string;
  status: BookingStatus;
  eventType: "elopement";
  clients: [Client, Client];
  packageKey: string;
  packageName: string;
  event: {
    date: string;
    backupDate: string;
    serviceDates: string;
    location: string;
    province: string;
    timezone: string;
    ceremonyType: "legal" | "symbolic";
  };
  lines: PriceLine[];
  allocation: AllocationLine[];
  taxes: TaxLine[];
  totals: {
    subtotalCents: number;
    taxCents: Record<string, number>;
    taxTotalCents: number;
    totalCents: number;
  };
  schedule: Installment[];
  /** Work order and agreement particulars, keyed by the ids in workOrderFields.ts. */
  fields: Record<string, string>;
  planning: PlanningItem[];
  payments: Payment[];
  events: AuditEvent[];
  internalNotes: string;
  remindersPaused: boolean;
}
