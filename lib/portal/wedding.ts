import { amendmentBlocks } from "./amendments";
import templates from "./wedding-templates.json";
import type { Booking } from "./types";
import { BUSINESS, BUSINESS_ADDRESS_ONE_LINE } from "./business";
import { formatCad, formatDate } from "./money";
import type { ContractIntake } from "./contract-details";
import type { InitialSection } from "./document-sections";
import { collectionFor } from "./contract-details";
import { workflowIsVisible } from "./portal-controls";

export type Cell = {
  text: string;
  id?: string;
  label?: string;
  hint?: string;
  required?: boolean;
};
export type WeddingBlock =
  | { kind: "p" | "h" | "check"; text: string; id?: string }
  | {
      kind: "question";
      id: string;
      label: string;
      hint: string;
      required: boolean;
    }
  | { kind: "table"; id: string; header: boolean; rows: Cell[][] };
export type WeddingTemplate = {
  key: string;
  number: number;
  title: string;
  stage: string;
  action: string;
  audience: string;
  companySigns: boolean;
  source: string;
  sourceSha256: string;
  blocks: WeddingBlock[];
};
export const WEDDING_TEMPLATES = (templates as WeddingTemplate[]).map((t) => ({
  ...t,
  blocks: t.blocks
    .filter((b) => !(b.kind === "table" && b.id === "t0"))
    .map((b) => {
      const personal =
        (t.key === "agreement" &&
          b.kind === "question" &&
          ["q15", "q17"].includes(b.id)) ||
        (t.key === "privacy" &&
          b.kind === "question" &&
          ["q4", "q6", "q13"].includes(b.id));
      return personal
        ? {
            kind: "p" as const,
            text: `${b.kind === "question" ? b.label.replace(/\[[^\]]*\]/g, "").trim() : ""} Each person records this choice in their own signature step. Their individual answers are included in the signature certificate.`,
          }
        : b;
    }),
}));
export const templateFor = (
  key: string,
  booking?: Booking,
  amendment?: WeddingAmendment,
): WeddingTemplate => {
  const t = WEDDING_TEMPLATES.find((t) => t.key === key);
  if (!t) throw new Error("Unknown wedding document");
  if (booking && key === "change" && amendment)
    return {
      ...t,
      blocks: [
        ...t.blocks
          .filter(
            (x) => !(x.kind === "table" && ["t3", "t4", "t5"].includes(x.id)),
          )
          .map((x) =>
            x.kind === "question" && x.id === "q2"
              ? { kind: "p" as const, text: amendment.reason }
              : x,
          ),
        ...amendmentBlocks(booking, amendment),
      ],
    };
  return booking ? { ...t, blocks: commercialBlocks(t, booking) } : t;
};
export type WeddingSignature = {
  party: "client" | "company";
  email: string;
  legalName: string;
  signedAt: string;
  consent: string;
  ip: string;
  userAgent: string;
  hash: string;
  answers: Record<string, string>;
  initials?: Record<string, string>;
};
export type WeddingAmendment = {
  baseHash: string;
  reason: string;
  plan: Pick<
    Booking,
    | "packageKey"
    | "packageName"
    | "event"
    | "lines"
    | "allocation"
    | "taxes"
    | "totals"
    | "fields"
    | "schedule"
  >;
};
export type WeddingDocument = {
  id: string;
  templateKey: string;
  title: string;
  version: number;
  status:
    | "draft"
    | "issued"
    | "partial"
    | "executed"
    | "withdrawn"
    | "superseded";
  createdAt: string;
  issuedAt?: string;
  dueDate?: string;
  fields: Record<string, string>;
  blocks: WeddingBlock[];
  hash?: string;
  requiredEmails: string[];
  signatures: WeddingSignature[];
  attachmentIds?: string[];
  pdfKey?: string;
  deliveries?: Record<string, { id: string; sentAt: string }>;
  deliveryError?: string;
  supersedes?: string;
  bookingHash?: string;
  commercialSnapshot?: string;
  draftRevision?: string;
  amendment?: WeddingAmendment;
  initialSections?: InitialSection[];
};
export type WeddingForm = {
  fields: Record<string, string>;
  status: "draft" | "submitted" | "reviewed";
  updatedAt: string;
  actor: string;
};
export type WeddingData = {
  documents: WeddingDocument[];
  forms: Record<string, WeddingForm>;
  galleryUrl?: string;
  filmUrl?: string;
  galleryExpires?: string;
  deliveryDate?: string;
  operations?: Record<string, string[][]>;
  intake?: ContractIntake;
  creative?: {
    direction: string;
    palette: string;
    priorities: string;
    avoid: string;
    updatedAt: string;
    actor: string;
  };
  media?: WeddingMedia[];
};
export type WeddingMedia = {
  id: string;
  kind: "portrait-1" | "portrait-2" | "moodboard";
  key: string;
  contentType: string;
  caption: string;
  createdAt: string;
  uploadedBy: string;
  removedAt?: string;
  previewUrl?: string;
};
export const weddingData = (b: Booking): WeddingData =>
  b.wedding ?? { documents: [], forms: {} };
export const ensureWedding = (b: Booking): WeddingData =>
  (b.wedding ??= { documents: [], forms: {} });
export const visibleDocuments = (b: Booking) =>
  weddingData(b).documents.filter(
    (d) =>
      !["draft", "withdrawn"].includes(d.status) &&
      templateFor(d.templateKey).audience === "client",
  );
export function templateFields(t: WeddingTemplate) {
  return t.blocks.flatMap((b) =>
    b.kind === "check" &&
    b.id &&
    ["form", "request", "internal"].includes(t.action)
      ? [{ id: b.id, label: b.text, hint: "", required: false }]
      : b.kind === "question"
        ? [{ id: b.id, label: b.label, hint: b.hint, required: b.required }]
        : b.kind === "table"
          ? b.rows.flatMap((row) =>
              row
                .filter((c) => c.id)
                .map((c) => ({
                  id: c.id!,
                  label: c.label!,
                  hint: c.hint!,
                  required: !!c.required,
                })),
            )
          : [],
  );
}
export function seedFields(
  t: WeddingTemplate,
  b: Booking,
): Record<string, string> {
  const fields: Record<string, string> = {};
  const names = b.clients.map((c) => c.legalName).join(" & ");
  for (const f of templateFields(t)) {
    const s = f.label.toLowerCase();
    if (/project identifier/.test(s)) fields[f.id] = b.ref;
    else if (/legal supplier|^supplier$|^company$/.test(s))
      fields[f.id] = BUSINESS.legalName;
    else if (/business address/.test(s))
      fields[f.id] = BUSINESS_ADDRESS_ONE_LINE;
    else if (/^email for notices/.test(s)) fields[f.id] = BUSINESS.email;
    else if (/^telephone$/.test(s)) fields[f.id] = BUSINESS.phone;
    else if (/gst hst number/.test(s)) fields[f.id] = BUSINESS.gstHstNumber;
    else if (/pst qst number/.test(s))
      fields[f.id] =
        b.taxes
          .filter((x) => /PST|QST/.test(x.code))
          .map((x) => x.registration)
          .join(", ") ||
        "Not applicable to this invoice; tax treatment reviewed by studio";
    else if (/^clients$|client legal names|^proposal for|^bill to/.test(s))
      fields[f.id] = names;
    else if (/^wedding date$|^event date$|original event date/.test(s))
      fields[f.id] = formatDate(b.event.date);
    else if (/^coverage date/.test(s))
      fields[f.id] = b.event.serviceDates || formatDate(b.event.date);
    else if (/province municipality|province and municipality/.test(s))
      fields[f.id] = `${b.event.province} · ${b.event.location}`;
    else if (
      /^province or territory$|primary province or territory of services/.test(
        s,
      )
    )
      fields[f.id] = b.event.province;
    else if (/^municipality$/.test(s)) fields[f.id] = b.event.location;
    else if (/^event type$/.test(s)) fields[f.id] = "Wedding";
    else if (/^currency$/.test(s)) fields[f.id] = "CAD";
    else if (/total contract price.*price|^total contract price$/.test(s))
      fields[f.id] = formatCad(b.totals.totalCents);
    if (
      t.key === "agreement" &&
      /full legal name|mailing address|^email ·|^telephone ·|province or territory of residence|preferred name and pronouns/.test(
        s,
      )
    ) {
      const part = Number(f.id.split(".").at(-1)) - 1;
      const c = b.clients[part];
      if (c)
        fields[f.id] = /full legal name/.test(s)
          ? c.legalName
          : /mailing address/.test(s)
            ? [
                c.address.line1,
                c.address.line2,
                c.address.city,
                c.address.province,
                c.address.postalCode,
              ]
                .filter(Boolean)
                .join(", ")
            : /^email/.test(s)
              ? c.email
              : /^telephone/.test(s)
                ? c.phone
                : /province/.test(s)
                  ? c.address.province
                  : c.preferredName || c.legalName;
    }
  }
  if (
    ["agreement", "proposal"].includes(t.key) &&
    b.wedding?.intake?.status === "approved"
  ) {
    const v = b.wedding.intake.values;
    for (const f of templateFields(t)) {
      const label = f.label.toLowerCase();
      const entry = /preparation location/.test(label)
        ? v.preparationLocation
        : /ceremony location/.test(label)
          ? v.ceremonyLocation
          : /reception location/.test(label)
            ? v.receptionLocation
            : /guest count/.test(label)
              ? v.guestCount
              : undefined;
      if (entry !== undefined) fields[f.id] = entry || "Not applicable";
    }
  }
  return fields;
}
/** Editable starting specifications from the same catalogue used by the public site. */
export function defaultDocumentFields(t: WeddingTemplate, b: Booking) {
  const fields = seedFields(t, b),
    tier = collectionFor(b.packageKey);
  if (!["agreement", "proposal"].includes(t.key)) return fields;
  const specs: [RegExp, string, string, string][] = [
    [/planning and creative meetings/, "planningSpec", "Included", ""],
    [/engagement session/, "engagementSpec", "Included", ""],
    [/wedding photography/, "photoSpec", "Included", "eventDate"],
    [/wedding film coverage/, "filmSpec", "Included", "eventDate"],
    [/preview photographs/, "previewSpec", "Included", "previewDate"],
    [/edited photo gallery/, "gallerySpec", "Included", "finalDeliveryDate"],
    [/teaser or social films/, "socialSpec", "Included", "socialDate"],
    [/highlight film/, "filmSpec", "Included", "featureFilmDeliveryDate"],
    [/album or printed goods/, "albumSpec", "Included", "albumDeliveryDate"],
    [/ceremony or speech edits|drone capture/, "", "Not included", ""],
    [/^other/, "otherSpec", "Included", ""],
  ];
  for (const f of templateFields(t)) {
    const label = f.label.toLowerCase(),
      spec = specs.find(([re]) => re.test(label));
    if (
      spec &&
      /included|exact specification|supply or completion date/.test(label)
    ) {
      const [, key, included, due] = spec;
      fields[f.id] = /included/.test(label)
        ? included
        : /exact specification/.test(label)
          ? b.fields[key] || (included === "Not included" ? "Not included" : "")
          : due === "eventDate"
            ? formatDate(b.event.date)
            : due
              ? b.fields[due] || ""
              : included === "Not included"
                ? "Not applicable"
                : "";
    }
    if (/coverage start end and zone/.test(label))
      fields[f.id] = b.fields.coverage || "";
    if (/total scheduled coverage/.test(label))
      fields[f.id] = b.fields.coverageHours
        ? `${b.fields.coverageHours} hours`
        : tier
          ? `${tier.hours} hours`
          : b.fields.coverage || "";
    if (/additional personnel/.test(label))
      fields[f.id] = b.fields.teamOnSite || tier?.crew || "";
  }
  return fields;
}
export function resolveBlocks(
  t: WeddingTemplate,
  fields: Record<string, string>,
): WeddingBlock[] {
  return t.blocks.map((b) =>
    b.kind === "check" &&
    b.id &&
    ["form", "request", "internal"].includes(t.action)
      ? {
          kind: "p",
          text: `${fields[b.id] === "yes" ? "Selected" : "Not selected"}: ${b.text}`,
        }
      : b.kind === "question"
        ? {
            kind: "p",
            text: `${b.label
              .replace(/\[[^\]]*\]/g, "")
              .replace(/☐/g, "")
              .trim()}: ${fields[b.id] || ""}`,
          }
        : b.kind === "table"
          ? {
              ...b,
              rows: b.rows.map((row) =>
                row.map((c) => ({ text: c.id ? fields[c.id] || "" : c.text })),
              ),
            }
          : { ...b },
  );
}
export function missingDocumentFields(
  t: WeddingTemplate,
  fields: Record<string, string>,
) {
  return templateFields(t).filter(
    (f) =>
      f.required &&
      (!fields[f.id]?.trim() || /\[[^\]]+\]|_{4,}/.test(fields[f.id])),
  );
}
export const ELECTRONIC_CONSENT =
  "I have read the complete document and attachments, had the opportunity to correct errors and ask questions, and can save or print a copy. I consent to electronic signing and delivery. I intend my typed full legal name to be my signature. I can request a paper copy or withdraw consent for future electronic communication by contacting i@armanarai.com.";
export function nextActions(
  b: Booking,
  email: string,
  base = `/portal/${b.ref}`,
) {
  if (b.status === "cancelled" || b.archivedAt || b.portal?.enabled === false)
    return [];
  const docs = visibleDocuments(b),
    data = weddingData(b);
  const tasks: {
    title: string;
    detail: string;
    href: string;
    kind: string;
    due?: string;
  }[] = [];
  if (data.intake && data.intake.status !== "approved")
    tasks.push({
      title:
        data.intake.status === "submitted"
          ? "Your contract details are with Arman"
          : "Complete your contract details",
      detail:
        data.intake.status === "submitted"
          ? "Arman reviews your venues and collection before you initial and sign."
          : "Enter your names, event venue, ceremony, reception and chosen collection.",
      href: `${base}/agreement`,
      kind: "Details",
    });
  for (const d of docs.filter(
    (d) =>
      ["issued", "partial"].includes(d.status) &&
      (!data.intake ||
        data.intake.status === "approved" ||
        !["agreement", "proposal"].includes(d.templateKey)) &&
      d.requiredEmails.includes(email) &&
      !d.signatures.some((s) => s.email === email),
  ))
    tasks.push({
      title: `${d.templateKey === "agreement" ? "Review and sign your agreement" : d.templateKey === "privacy" ? "Choose your privacy preferences" : `Review ${d.title.toLowerCase()}`}`,
      detail:
        d.templateKey === "agreement"
          ? "Check your coverage, price and delivery dates. You and your partner sign separately."
          : "Open the completed document and record your approval.",
      href: `${base}/documents/${d.id}`,
      kind: "Signature",
      due: d.dueDate,
    });
  const agreement = docs.find(
    (d) => d.templateKey === "agreement" && d.status === "executed",
  );
  const pay = b.schedule.find(
    (i) =>
      !["paid", "void", "refunded"].includes(i.status) &&
      i.totalCents > i.paidCents,
  );
  if (
    agreement &&
    pay &&
    (pay.kind === "deposit" ||
      pay.dueDate <= new Date().toISOString().slice(0, 10))
  )
    tasks.push({
      title: `${pay.kind === "deposit" ? "Send your booking payment" : "Payment due"}`,
      detail: `${formatCad(pay.totalCents - pay.paidCents)} · ${formatDate(pay.dueDate)}. The studio confirms receipt.`,
      href: `${base}/payments`,
      kind: "Payment",
      due: pay.dueDate,
    });
  if (["booked", "in_planning", "completed"].includes(b.status))
    for (const [key, title, detail] of [
      [
        "discovery",
        "Tell me about your wedding",
        "Your people, priorities, traditions and plans.",
      ],
      [
        "family",
        "Build your family photo list",
        "Add names, groups and a person to help gather everyone.",
      ],
    ])
      if (
        workflowIsVisible(b, key) &&
        (!data.forms[key] || data.forms[key].status === "draft")
      )
        tasks.push({
          title,
          detail,
          href: `${base}/planning/${key}`,
          kind: "Planning",
        });
  for (const p of b.planning
    .filter(
      (p) =>
        p.clientVisible &&
        p.clientCanComplete &&
        ["todo", "in_progress"].includes(p.status),
    )
    .sort((a, b) => a.sortOrder - b.sortOrder))
    tasks.push({
      title: p.titleEn,
      detail: p.clientNote || "Complete this step on your wedding checklist.",
      href: `${base}/planning#task-${p.id}`,
      kind: "Planning",
      due: p.dueDate,
    });
  return tasks;
}
export function serializeClientBooking(b: Booking): Booking {
  return {
    ...b,
    archiveReason: undefined,
    invoices: b.invoices?.map((v) => ({
      ...v,
      pdfKey: undefined,
      notificationRequests: undefined,
      issuedBy: "Studio",
    })),
    internalNotes: "",
    events: [],
    payments: b.payments.map(
      ({
        id,
        installmentId,
        amountCents,
        method,
        status,
        receivedAt,
        receiptNumber,
        recordedBy,
        refundedCents,
      }) => ({
        id,
        installmentId,
        amountCents,
        method,
        status,
        receivedAt,
        receiptNumber,
        recordedBy,
        refundedCents,
      }),
    ),
    fields: {},
    planning: b.planning
      .filter((p) => p.clientVisible)
      .map(({ internalNote: _n, ...p }) => p),
    wedding: {
      ...weddingData(b),
      operations: undefined,
      documents: visibleDocuments(b).map((d) => ({
        ...d,
        commercialSnapshot: undefined,
        signatures: d.signatures.map((s) => ({ ...s, ip: "", userAgent: "" })),
      })),
      forms: Object.fromEntries(
        Object.entries(weddingData(b).forms).filter(
          ([k]) => templateFor(k).audience === "client",
        ),
      ),
      media: weddingData(b)
        .media?.filter((m) => !m.removedAt)
        .map((m) => ({ ...m, key: "" })),
    },
  };
}

/** Material booking values captured when a proposal is issued. Payment receipts do not change the offer. */
export function commercialFingerprint(b: Booking) {
  return JSON.stringify({
    clients: b.clients,
    event: b.event,
    packageKey: b.packageKey,
    packageName: b.packageName,
    lines: b.lines,
    taxes: b.taxes,
    totals: b.totals,
    fields: b.fields,
    schedule: b.schedule
      .filter((i) => i.status !== "void")
      .map((i) => ({
        label: i.label,
        dueDate: i.dueDate,
        totalCents: i.totalCents,
      })),
  });
}
function commercialBlocks(t: WeddingTemplate, b: Booking): WeddingBlock[] {
  const table = (
    id: string,
    rows: string[][],
  ): Extract<WeddingBlock, { kind: "table" }> => ({
    kind: "table",
    id,
    header: true,
    rows: rows.map((r) => r.map((text) => ({ text }))),
  });
  const prices = table("calculated-prices", [
    ["Item", "Quantity", "Amount (CAD)"],
    ...b.lines.map((l) => [l.label, "1", formatCad(l.cents)]),
    ["Subtotal", "", formatCad(b.totals.subtotalCents)],
    ...b.taxes.map((t) => [
      `${t.label} (${t.rateBps / 100}%)`,
      t.registration,
      formatCad(b.totals.taxCents[t.code] || 0),
    ]),
    ["Total contract price", "CAD", formatCad(b.totals.totalCents)],
  ]);
  let balance = b.totals.totalCents;
  const schedule = table("calculated-schedule", [
    [
      "Payment",
      "Amount (CAD)",
      "Exact due date",
      "Method",
      "Balance after payment",
    ],
    ...b.schedule
      .filter((i) => i.status !== "void")
      .map((i) => {
        balance -= i.totalCents;
        return [
          i.label,
          formatCad(i.totalCents),
          formatDate(i.dueDate),
          "Interac e-Transfer; no studio surcharge",
          formatCad(balance),
        ];
      }),
  ]);
  const ids: Record<string, string[]> = {
    agreement: ["t6", "t7"],
    proposal: ["t5", "t6"],
    invoice: ["t2", "t4"],
  };
  const selected = ids[t.key];
  if (!selected) return t.blocks;
  const accepted = b.wedding?.documents
    .filter(
      (d) =>
        d.templateKey === "proposal" &&
        d.status === "executed" &&
        d.commercialSnapshot === commercialFingerprint(b) &&
        (!b.wedding?.intake?.approvedAt ||
          (d.issuedAt || "") >= b.wedding.intake.approvedAt),
    )
    .at(-1);
  const scope = accepted?.blocks.find(
    (x) => x.kind === "table" && x.id === "t3",
  );
  const particulars = table("calculated-event-particulars", [
    ["Agreed event detail", "Value"],
    ...[
      ["Main event venue and address", b.fields.eventVenue],
      ["Ceremony time", b.fields.ceremonyTime],
      ["Reception time", b.fields.receptionTime],
    ]
      .filter(([, value]) => value)
      .map(([label, value]) => [label, value!]),
  ]);
  return t.blocks.flatMap((x) => {
    if (x.kind !== "table") return x;
    if (t.key === "agreement" && x.id === "t3" && particulars.rows.length > 1)
      return [x, particulars];
    if (x.id === selected[0]) return prices;
    if (x.id === selected[1]) return schedule;
    if (t.key === "agreement" && x.id === "t4" && scope)
      return { ...scope, id: "accepted-scope" };
    if (t.key === "invoice" && x.id === "t3")
      return table("calculated-receipts", [
        ["Receipt", "Received (CAD)", "Date", "Reference"],
        ...b.payments
          .filter((p) => p.status === "succeeded")
          .map((p) => [
            p.receiptNumber || p.id,
            formatCad(p.amountCents),
            p.receivedAt || "",
            p.etransferReference || "",
          ]),
        [
          "Remaining contract balance",
          formatCad(
            b.totals.totalCents -
              b.schedule.reduce((s, i) => s + i.paidCents, 0),
          ),
          "",
          "",
        ],
      ]);
    return x;
  });
}

export function documentFingerprint(d: WeddingDocument) {
  return JSON.stringify({
    blocks: d.blocks,
    requiredEmails: d.requiredEmails,
    version: d.version,
    templateKey: d.templateKey,
    ...(d.amendment ? { amendment: d.amendment } : {}),
    ...(d.initialSections ? { initialSections: d.initialSections } : {}),
  });
}

export function clientIdentity(c: Omit<Booking["clients"][number], "id">) {
  return JSON.stringify([
    c.legalName,
    c.preferredName || "",
    c.email,
    c.phone,
    c.address.line1,
    c.address.line2 || "",
    c.address.city,
    c.address.province,
    c.address.postalCode,
  ]);
}
