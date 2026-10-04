import type { Booking } from "./types";
import {
  templateFor,
  templateFields,
  resolveBlocks,
  seedFields,
  type WeddingDocument,
} from "./wedding";
import { defaultPlanning } from "./planning";
import { computeTotals, buildSchedule } from "./money";
export function sampleWedding(): Booking {
  const clients: [Booking["clients"][0], Booking["clients"][1]] = [
    {
      id: "sample1",
      legalName: "Maya Bennett",
      preferredName: "Maya",
      email: "maya@example.com",
      phone: "+1 604 555 0101",
      address: {
        line1: "100 Example Street",
        city: "Victoria",
        province: "BC",
        postalCode: "V8W 1A1",
      },
    },
    {
      id: "sample2",
      legalName: "James Ellis",
      preferredName: "James",
      email: "james@example.com",
      phone: "+1 604 555 0102",
      address: {
        line1: "100 Example Street",
        city: "Victoria",
        province: "BC",
        postalCode: "V8W 1A1",
      },
    },
  ];
  const b: Booking = {
    schema: 1,
    ref: "AA-CA-2027-001",
    createdAt: "2026-10-03T15:00:00Z",
    updatedAt: "2026-10-03T15:00:00Z",
    status: "contract_sent",
    eventType: "wedding",
    clients,
    packageKey: "signature",
    packageName: "Signature collection",
    event: {
      date: "2027-06-19",
      backupDate: "",
      serviceDates: "June 19, 2027",
      location: "Victoria, British Columbia",
      province: "BC",
      timezone: "America/Vancouver",
      ceremonyType: "legal",
    },
    lines: [
      {
        id: "l1",
        kind: "package",
        label: "Signature wedding photography — 8 hours",
        cents: 450000,
      },
    ],
    allocation: [],
    taxes: [
      {
        code: "GST",
        label: "GST",
        rateBps: 500,
        registration: "767392145RT0001",
      },
    ],
    totals: {
      subtotalCents: 450000,
      taxCents: { GST: 22500 },
      taxTotalCents: 22500,
      totalCents: 472500,
    },
    schedule: [],
    fields: {
      coverage: "12:00 pm – 8:00 pm, America/Vancouver",
      locations: "Preparation, ceremony and reception in Victoria",
      finalDeliveryDate: "2027-08-14",
    },
    planning: defaultPlanning("2027-06-19", { film: false, album: false }),
    payments: [],
    events: [],
    internalNotes: "SAMPLE_INTERNAL_NOTE_MUST_NOT_APPEAR_TO_CLIENT",
    remindersPaused: false,
    wedding: { documents: [], forms: {} },
  };
  b.schedule = buildSchedule(b, "2026-10-03");
  for (const key of ["proposal", "agreement", "privacy"]) {
    const t = templateFor(key, b),
      fields = {
        ...Object.fromEntries(
          templateFields(t).map((f) => [
            f.id,
            "Not applicable to this sample photography collection",
          ]),
        ),
        ...seedFields(t, b),
      };
    const d: WeddingDocument = {
      id: `${key}-sample`,
      templateKey: key,
      title: t.title,
      version: 1,
      status: key === "proposal" ? "executed" : "issued",
      createdAt: b.createdAt,
      issuedAt: b.createdAt,
      dueDate: "2026-10-10",
      fields,
      blocks: resolveBlocks(t, fields),
      hash: "sample-preview-hash",
      requiredEmails: clients.map((c) => c.email),
      signatures:
        key === "proposal"
          ? clients.map((c) => ({
              party: "client",
              email: c.email,
              legalName: c.legalName,
              signedAt: b.createdAt,
              consent: "Sample signature only",
              ip: "",
              userAgent: "",
              hash: "sample-preview-hash",
              answers: {},
            }))
          : [],
    };
    if (key === "agreement") {
      d.blocks.push(
        { kind: "h", text: "Appendix — accepted proposal and scope" },
        ...b.wedding!.documents[0].blocks,
      );
    }
    b.wedding!.documents.push(d);
  }
  return b;
}
export const demoEnabled = () =>
  process.env.PORTAL_DEMO === "1" && process.env.VERCEL_ENV !== "production";
