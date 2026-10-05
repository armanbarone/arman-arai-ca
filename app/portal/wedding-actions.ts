"use server";
import { amendmentBase } from "@/lib/portal/amendments";
import { revalidatePath } from "next/cache";
import {
  requireAdmin,
  requireBookingAccess,
  requestMeta,
  directWeddingLink,
} from "@/lib/portal/auth";
import { getBooking, updateBooking } from "@/lib/portal/store";
import {
  ensureWedding,
  weddingData,
  templateFor,
  templateFields,
  seedFields,
  resolveBlocks,
  missingDocumentFields,
  ELECTRONIC_CONSENT,
  commercialFingerprint,
  documentFingerprint,
  type WeddingDocument,
} from "@/lib/portal/wedding";
import { sha256Hex, randomId } from "@/lib/portal/token";
import { BUSINESS } from "@/lib/portal/business";
import { sendEmail, layout, esc, footerText } from "@/lib/portal/email";
import { deliverSignedWeddingDocument } from "@/lib/portal/wedding-delivery";
import {
  OPERATION_REGISTERS,
  calculateBudgetRow,
} from "@/lib/portal/operations";
import { roundDiv } from "@/lib/portal/money";
import {
  documentSections,
  initialsForName,
  normalizeInitials,
  validateInitials,
} from "@/lib/portal/document-sections";

type Result =
  | {
      ok: true;
      id?: string;
      revision?: string;
      updatedAt?: string;
      message?: string;
    }
  | { ok: false; error: string };
const cleanFields = (key: string, raw: Record<string, string>) => {
  const allowed = new Set(templateFields(templateFor(key)).map((f) => f.id));
  const out: Record<string, string> = {};
  if (Object.keys(raw).length > 1500) throw new Error("Too many fields");
  for (const [k, v] of Object.entries(raw)) {
    if (!allowed.has(k) || typeof v !== "string" || v.length > 8000)
      throw new Error("Invalid field");
    out[k] = v.trim();
  }
  return out;
};
const refresh = (ref: string) => {
  revalidatePath(`/portal/${ref}`, "layout");
  revalidatePath(`/admin/bookings/${ref}`, "layout");
  revalidatePath("/admin");
};
const failure = (e: unknown): Result => ({
  ok: false,
  error: e instanceof Error ? e.message : "Please try again.",
});

export async function saveWeddingDraft(
  ref: string,
  key: string,
  fields: Record<string, string>,
  dueDate: string,
): Promise<Result> {
  await requireAdmin();
  try {
    const t = templateFor(key),
      values = cleanFields(key, fields);
    if (dueDate && !/^\d{4}-\d{2}-\d{2}$/.test(dueDate))
      throw new Error("Use a complete review date");
    let id = "",
      revision = "";
    await updateBooking(ref, async (b) => {
      const w = ensureWedding(b);
      let d = w.documents.find(
        (d) => d.templateKey === key && d.status === "draft",
      );
      if (!d) {
        d = {
          id: `${key}-${randomId(8)}`,
          templateKey: key,
          title: t.title,
          version: w.documents.filter((x) => x.templateKey === key).length + 1,
          status: "draft",
          createdAt: new Date().toISOString(),
          fields: {},
          blocks: [],
          requiredEmails: [],
          signatures: [],
        };
        w.documents.push(d);
      }
      d.fields = values;
      const current = templateFor(key, b, d.amendment);
      d.blocks = resolveBlocks(current, {
        ...values,
        ...seedFields(current, b),
      });
      d.dueDate = dueDate;
      d.draftRevision = await sha256Hex(
        JSON.stringify({ blocks: d.blocks, dueDate }),
      );
      id = d.id;
      revision = d.draftRevision;
    });
    refresh(ref);
    return { ok: true, id, revision };
  } catch (e) {
    return failure(e);
  }
}
export async function issueWeddingDocument(
  ref: string,
  id: string,
  typedName: string,
  consent: boolean,
  revision: string,
  typedInitials = "",
): Promise<Result> {
  const admin = await requireAdmin();
  const meta = await requestMeta();
  try {
    await updateBooking(ref, async (b) => {
      const w = ensureWedding(b),
        d = w.documents.find((x) => x.id === id);
      if (!d || d.status !== "draft")
        throw new Error("Save a draft before issuing it");
      if (!revision || d.draftRevision !== revision)
        throw new Error(
          "Another studio edit changed this draft. Reload and review before publishing.",
        );
      const t = templateFor(d.templateKey, b, d.amendment);
      if (
        ["proposal", "agreement"].includes(d.templateKey) &&
        w.intake &&
        w.intake.status !== "approved"
      )
        throw new Error(
          "Review and approve the couple's current contract details first.",
        );
      if (t.audience !== "client")
        throw new Error(
          "This is a studio record. It is never published to the couple.",
        );
      if (["form", "request"].includes(t.action))
        throw new Error(
          "These answers are completed and submitted in Wedding planning.",
        );
      if (
        d.templateKey === "change" &&
        (!d.amendment ||
          d.amendment.baseHash !== (await sha256Hex(amendmentBase(b))))
      )
        throw new Error(
          "Prepare the exact booking revision first, or refresh it because a payment or booking detail changed.",
        );
      const values = { ...d.fields, ...seedFields(t, b) };
      const currentRevision = await sha256Hex(
        JSON.stringify({
          blocks: resolveBlocks(t, values),
          dueDate: d.dueDate || "",
        }),
      );
      if (currentRevision !== revision)
        throw new Error(
          "Booking details changed after this draft was saved. Save and review the updated version first.",
        );
      const missing = missingDocumentFields(t, values);
      if (missing.length)
        throw new Error(
          `Complete ${missing.length} remaining fields. First: ${missing[0].label}`,
        );
      if (d.templateKey === "agreement") {
        if (
          b.event.province === "QC" ||
          b.clients.some((c) => c.address.province === "QC")
        )
          throw new Error(
            "This source pack contains only an English agreement. Add the reviewed French pack and language process before issuing a Quebec agreement.",
          );
        if (
          w.documents.some(
            (x) =>
              x.templateKey === "agreement" &&
              !["draft", "withdrawn"].includes(x.status),
          )
        )
          throw new Error(
            "An agreement is already issued. Use a change order or withdraw the unsigned version.",
          );
        if (
          b.schedule.reduce(
            (s, i) => s + (i.status === "void" ? 0 : i.totalCents),
            0,
          ) !== b.totals.totalCents
        )
          throw new Error(
            "The payment schedule must equal the contract total.",
          );
        const proposal = w.documents
          .filter(
            (x) => x.templateKey === "proposal" && x.status === "executed",
          )
          .at(-1);
        if (!proposal)
          throw new Error(
            "Issue the proposal and obtain both clients’ acceptance before issuing the agreement.",
          );
        if (
          proposal.bookingHash !== (await sha256Hex(commercialFingerprint(b)))
        )
          throw new Error(
            "The accepted proposal no longer matches this booking. Issue a new proposal and obtain both clients’ acceptance.",
          );
        d.attachmentIds = [proposal.id];
        d.blocks = [
          ...resolveBlocks(t, values),
          { kind: "h", text: "Appendix — accepted proposal and scope" },
          ...proposal.blocks,
        ];
        b.status = "contract_sent";
      } else d.blocks = resolveBlocks(t, values);
      d.fields = values;
      d.requiredEmails = ["read"].includes(t.action)
        ? []
        : b.clients.map((c) => c.email);
      d.bookingHash = await sha256Hex(commercialFingerprint(b));
      d.commercialSnapshot = commercialFingerprint(b);
      d.initialSections = d.requiredEmails.length
        ? documentSections(d.blocks).map(({ id, title }) => ({ id, title }))
        : undefined;
      d.hash = await sha256Hex(documentFingerprint(d));
      if (d.templateKey === "change")
        for (const previous of w.documents)
          if (
            previous.id !== d.id &&
            previous.templateKey === "change" &&
            ["issued", "partial"].includes(previous.status)
          ) {
            previous.status = "superseded";
            d.supersedes = previous.id;
          }
      d.status = "issued";
      d.issuedAt = new Date().toISOString();
      if (t.companySigns) {
        if (
          !consent ||
          typedName.trim().toLowerCase() !== BUSINESS.lead.toLowerCase()
        )
          throw new Error(
            "Type Arman Arai and confirm electronic consent to countersign for Arasaka Inc.",
          );
        if (normalizeInitials(typedInitials) !== initialsForName(BUSINESS.lead))
          throw new Error(
            "Enter AA as your initials to countersign the reviewed sections.",
          );
        d.signatures.push({
          party: "company",
          email: admin.email,
          legalName: typedName.trim(),
          signedAt: d.issuedAt,
          consent: ELECTRONIC_CONSENT,
          hash: d.hash,
          answers: {},
          initials: Object.fromEntries(
            (d.initialSections || []).map((s) => [
              s.id,
              initialsForName(BUSINESS.lead),
            ]),
          ),
          ...meta,
        });
      }
      b.events.push({
        at: d.issuedAt,
        type: "wedding_document_issued",
        actor: admin.email,
        detail: { id: d.id, hash: d.hash },
      });
    });
    refresh(ref);
    const b = await getBooking(ref),
      d = weddingData(b!).documents.find((d) => d.id === id)!;
    try {
      for (const c of b!.clients) {
        const url = await directWeddingLink(
          c.email,
          `/portal/${ref}/documents/${id}`,
        );
        const sent = await sendEmail({
          to: c.email,
          subject: `${d.title} is ready · ${ref}`,
          html: layout({
            heading: `${esc(c.preferredName || c.legalName)}, ${esc(d.title.toLowerCase())} is ready`,
            bodyHtml: `<p>Review your completed wedding document. ${d.requiredEmails.length ? "Each partner signs separately using their own email address." : ""}</p>`,
            button: {
              label: d.requiredEmails.length
                ? "Review and sign"
                : "Open document",
              href: url,
            },
          }),
          text: `Your ${d.title} is ready: ${url}${footerText()}`,
          idempotencyKey: `wedding-issued/${ref}/${id}/${c.email}`,
        });
        if (!sent.id) throw new Error("Email is not configured");
      }
      return {
        ok: true,
        message: "Published to the portal and emailed to both partners.",
      };
    } catch {
      await updateBooking(ref, (b) => {
        b.events.push({
          at: new Date().toISOString(),
          type: "document_notification_failed",
          actor: "system",
          detail: { id },
        });
      });
      return {
        ok: true,
        message:
          "Published to the portal. Email notification failed; send a portal invitation after checking email settings.",
      };
    }
  } catch (e) {
    return failure(e);
  }
}
export async function signWeddingDocument(
  ref: string,
  id: string,
  hash: string,
  typedName: string,
  consent: boolean,
  answers: Record<string, string>,
  rawInitials: Record<string, string> = {},
): Promise<Result> {
  const { session } = await requireBookingAccess(ref);
  if (session.role !== "client")
    return {
      ok: false,
      error:
        "Use your own client sign-in link. The studio cannot sign for a client.",
    };
  const meta = await requestMeta();
  try {
    if (consent !== true) throw new Error("Confirm electronic signing consent");
    if (
      Object.entries(answers).some(
        ([k, v]) =>
          typeof v !== "string" ||
          v.length > 2000 ||
          ![
            "portfolio",
            "approvedName",
            "paidAdvertising",
            "advertisingScope",
            "testimonial",
            "testimonialName",
            "marketing",
            "crossBorderNotice",
            "questions",
          ].includes(k),
      )
    )
      throw new Error("Invalid preference");
    let executed = false;
    await updateBooking(ref, async (b) => {
      executed = false;
      if (b.status === "cancelled")
        throw new Error(
          "This booking is cancelled. Contact the studio before proceeding.",
        );
      const d = ensureWedding(b).documents.find((d) => d.id === id);
      if (!d || !["issued", "partial"].includes(d.status))
        throw new Error("This version is no longer available for signing");
      if (!d.requiredEmails.includes(session.email))
        throw new Error("You are not a required signer");
      if (
        ["proposal", "agreement"].includes(d.templateKey) &&
        b.wedding?.intake &&
        b.wedding.intake.status !== "approved"
      )
        throw new Error(
          "Your updated details need Arman's review before this version can be signed.",
        );
      if (
        d.signatures.some(
          (s) => s.email === session.email && s.party === "client",
        )
      )
        throw new Error("Your signature is already recorded");
      const c = b.clients.find((c) => c.email === session.email)!;
      const norm = (v: string) =>
        v.normalize("NFKC").replace(/\s+/g, " ").trim().toLowerCase();
      if (norm(typedName) !== norm(c.legalName))
        throw new Error(`Type your full legal name: ${c.legalName}`);
      const initials = validateInitials(d, c.legalName, rawInitials);
      const check = await sha256Hex(documentFingerprint(d));
      if (check !== d.hash || hash !== d.hash)
        throw new Error(
          "The document version changed. Reload and review the current version before signing.",
        );
      if (["agreement", "privacy"].includes(d.templateKey)) {
        if (
          !["private", "portfolio_no_name", "portfolio_with_name"].includes(
            answers.portfolio || "",
          )
        )
          throw new Error(
            "Choose a privacy preference, including Private if you do not want publicity",
          );
        if (
          answers.portfolio === "portfolio_with_name" &&
          !answers.approvedName?.trim()
        )
          throw new Error("Enter the approved name or handle");
        if (d.templateKey === "privacy" && answers.crossBorderNotice !== "read")
          throw new Error(
            "Acknowledge the data processing notice before signing",
          );
        if (
          d.templateKey === "privacy" &&
          (!["no", "yes"].includes(answers.paidAdvertising || "") ||
            !["no", "yes"].includes(answers.testimonial || "") ||
            !["no", "yes"].includes(answers.marketing || ""))
        )
          throw new Error("Complete your individual privacy choices");
        if (
          answers.paidAdvertising === "yes" &&
          !answers.advertisingScope?.trim()
        )
          throw new Error("Specify the exact advertising scope");
        if (answers.testimonial === "yes" && !answers.testimonialName?.trim())
          throw new Error("Enter the approved testimonial attribution");
      }
      if (
        d.amendment &&
        d.amendment.baseHash !== (await sha256Hex(amendmentBase(b)))
      )
        throw new Error(
          "The booking or payment record changed. Ask the studio for an updated change order before signing.",
        );
      const at = new Date().toISOString();
      d.signatures.push({
        party: "client",
        email: session.email,
        legalName: typedName.trim(),
        signedAt: at,
        consent: ELECTRONIC_CONSENT,
        hash: d.hash!,
        answers,
        initials,
        ...meta,
      });
      executed = d.requiredEmails.every((e) =>
        d.signatures.some((s) => s.party === "client" && s.email === e),
      );
      d.status = executed ? "executed" : "partial";
      if (executed && d.amendment) {
        Object.assign(b, structuredClone(d.amendment.plan));
        if (!["in_planning", "completed"].includes(b.status))
          b.status =
            b.schedule[0]?.paidCents >= b.schedule[0]?.totalCents
              ? "booked"
              : "signed";
        b.events.push({
          at,
          type: "signed_change_applied",
          actor: "system",
          detail: { id: d.id, hash: d.hash },
        });
      }

      if (d.templateKey === "agreement")
        b.status = executed
          ? b.schedule[0]?.paidCents >= b.schedule[0]?.totalCents
            ? "booked"
            : "signed"
          : "partially_signed";
      b.events.push({
        at,
        type: executed
          ? "wedding_document_executed"
          : "wedding_document_signed",
        actor: session.email,
        detail: { id, hash: d.hash },
      });
    });
    refresh(ref);
    if (executed) {
      try {
        await deliverSignedWeddingDocument(ref, id);
        return {
          ok: true,
          message:
            "All signatures are recorded. The completed PDF was emailed to both partners.",
        };
      } catch {
        return {
          ok: true,
          message:
            "All signatures are safely recorded. PDF email delivery needs the studio’s attention; your signature does not need to be repeated.",
        };
      }
    }
    return {
      ok: true,
      message:
        "Your signature is recorded. Your partner still needs to sign. You will both receive the completed PDF afterward.",
    };
  } catch (e) {
    return failure(e);
  }
}
export async function retryWeddingDelivery(
  ref: string,
  id: string,
): Promise<Result> {
  await requireAdmin();
  try {
    await deliverSignedWeddingDocument(ref, id);
    refresh(ref);
    return { ok: true, message: "Completed PDF delivery retried." };
  } catch (e) {
    return failure(e);
  }
}
export async function withdrawWeddingDocument(
  ref: string,
  id: string,
  reason: string,
): Promise<Result> {
  const admin = await requireAdmin();
  try {
    if (reason.trim().length < 5) throw new Error("Record a reason");
    await updateBooking(ref, (b) => {
      const d = ensureWedding(b).documents.find((d) => d.id === id);
      if (!d || d.signatures.some((s) => s.party === "client"))
        throw new Error(
          "Signed records cannot be withdrawn. Issue a signed change order.",
        );
      d.status = "withdrawn";
      if (d.templateKey === "agreement") b.status = "draft";
      b.events.push({
        at: new Date().toISOString(),
        type: "wedding_document_withdrawn",
        actor: admin.email,
        detail: { id, reason },
      });
    });
    refresh(ref);
    return { ok: true };
  } catch (e) {
    return failure(e);
  }
}
export async function saveWeddingForm(
  ref: string,
  key: string,
  raw: Record<string, string>,
  submit: boolean,
  expectedUpdatedAt: string | null = null,
): Promise<Result> {
  const { session } = await requireBookingAccess(ref);
  try {
    const t = templateFor(key);
    if (session.role !== "admin" && !["form", "request"].includes(t.action))
      throw new Error("This record is managed by the studio");
    const fields = cleanFields(key, raw);
    let updatedAt = "";
    await updateBooking(ref, (b) => {
      const current = ensureWedding(b).forms[key];
      if ((current?.updatedAt || null) !== expectedUpdatedAt)
        throw new Error(
          "Your partner or the studio saved newer answers. Your entries remain on screen; reload and compare before saving.",
        );
      updatedAt = new Date().toISOString();
      ensureWedding(b).forms[key] = {
        fields,
        status: submit ? "submitted" : "draft",
        updatedAt,
        actor: session.email,
      };
      b.events.push({
        at: new Date().toISOString(),
        type: submit ? "wedding_form_submitted" : "wedding_form_saved",
        actor: session.email,
        detail: { key },
      });
    });
    refresh(ref);
    return {
      ok: true,
      updatedAt,
      message: submit
        ? "Submitted to the studio. Your saved answers remain available here."
        : "Draft saved. You can return and finish later.",
    };
  } catch (e) {
    return failure(e);
  }
}
export async function reportWeddingPayment(
  ref: string,
  installmentId: string,
): Promise<Result> {
  const { session } = await requireBookingAccess(ref);
  try {
    await updateBooking(ref, (b) => {
      const i = b.schedule.find((i) => i.id === installmentId);
      if (!i || i.totalCents <= i.paidCents)
        throw new Error("No payment is outstanding");
      i.clientReportedSentAt = new Date().toISOString();
      b.events.push({
        at: i.clientReportedSentAt,
        type: "payment_reported_sent",
        actor: session.email,
        detail: { installmentId },
      });
    });
    refresh(ref);
    return {
      ok: true,
      message:
        "Marked as sent. The studio will confirm receipt before your balance changes.",
    };
  } catch (e) {
    return failure(e);
  }
}
export async function recordWeddingPayment(
  ref: string,
  installmentId: string,
  cents: number,
  reference: string,
): Promise<Result> {
  const admin = await requireAdmin();
  try {
    if (
      !Number.isSafeInteger(cents) ||
      cents <= 0 ||
      reference.trim().length < 3
    )
      throw new Error("Enter the amount received and transaction reference");
    await updateBooking(ref, (b) => {
      const i = b.schedule.find((i) => i.id === installmentId);
      if (!i || cents > i.totalCents - i.paidCents)
        throw new Error("Amount exceeds the outstanding instalment");
      if (b.payments.some((p) => p.etransferReference === reference.trim()))
        throw new Error("That transaction reference is already recorded");
      const at = new Date().toISOString();
      b.payments.push({
        id: randomId(),
        installmentId,
        amountCents: cents,
        method: "interac_etransfer",
        status: "succeeded",
        etransferReference: reference.trim(),
        receivedAt: at,
        recordedBy: "admin",
        receiptNumber: `${ref}-R${b.payments.length + 1}`,
      });
      i.paidCents += cents;
      i.status = i.paidCents >= i.totalCents ? "paid" : "partially_paid";
      i.paidAt = at;
      if (
        i.kind === "deposit" &&
        i.status === "paid" &&
        weddingData(b).documents.some(
          (d) => d.templateKey === "agreement" && d.status === "executed",
        )
      )
        b.status = "booked";
      b.events.push({
        at,
        type: "payment_received",
        actor: admin.email,
        detail: { installmentId, cents, reference },
      });
    });
    refresh(ref);
    return { ok: true, message: "Receipt recorded and balance updated." };
  } catch (e) {
    return failure(e);
  }
}

export async function saveWeddingSchedule(
  ref: string,
  rows: { id: string; label: string; dueDate: string; totalCents: number }[],
): Promise<Result> {
  const admin = await requireAdmin();
  try {
    if (
      rows.length < 1 ||
      rows.length > 12 ||
      rows.some(
        (r) =>
          !Number.isSafeInteger(r.totalCents) ||
          r.totalCents < 0 ||
          !/^\d{4}-\d{2}-\d{2}$/.test(r.dueDate) ||
          !r.label.trim(),
      )
    )
      throw new Error("Enter valid dates, labels and amounts");
    await updateBooking(ref, (b) => {
      if (b.status !== "draft" || b.payments.length)
        throw new Error("Issued payment terms require a signed change order");
      if (rows.reduce((s, r) => s + r.totalCents, 0) !== b.totals.totalCents)
        throw new Error("The schedule must equal the contract total");
      const taxes = { ...b.totals.taxCents };
      b.schedule = rows.map((r, i) => {
        const last = i === rows.length - 1;
        const taxCents: Record<string, number> = {};
        for (const code of Object.keys(taxes)) {
          taxCents[code] = last
            ? taxes[code]
            : roundDiv(
                r.totalCents * b.totals.taxCents[code],
                b.totals.totalCents,
              );
          taxes[code] -= taxCents[code];
        }
        const subtotal =
          r.totalCents - Object.values(taxCents).reduce((s, v) => s + v, 0);
        return {
          id: `i${i + 1}`,
          label: r.label.trim(),
          kind: i === 0 ? "deposit" : "instalment",
          dueDate: r.dueDate,
          dueRule: "Exact date agreed in contract",
          subtotalCents: subtotal,
          taxCents,
          totalCents: r.totalCents,
          paidCents: 0,
          status: "scheduled",
          reference: `${ref}-${String(i + 1).padStart(2, "0")}`,
        };
      });
      b.events.push({
        at: new Date().toISOString(),
        type: "payment_schedule_updated",
        actor: admin.email,
      });
    });
    refresh(ref);
    return { ok: true, message: "Payment schedule saved" };
  } catch (e) {
    return failure(e);
  }
}

export async function reviewWeddingForm(
  ref: string,
  key: string,
): Promise<Result> {
  const admin = await requireAdmin();
  try {
    await updateBooking(ref, (b) => {
      const f = ensureWedding(b).forms[key];
      if (!f) throw new Error("Form not found");
      f.status = "reviewed";
      b.events.push({
        at: new Date().toISOString(),
        type: "wedding_form_reviewed",
        actor: admin.email,
        detail: { key },
      });
    });
    refresh(ref);
    return { ok: true, message: "Marked as reviewed" };
  } catch (e) {
    return failure(e);
  }
}

export async function saveWeddingDelivery(
  ref: string,
  input: {
    galleryUrl: string;
    filmUrl: string;
    galleryExpires: string;
    deliveryDate: string;
  },
): Promise<Result> {
  const admin = await requireAdmin();
  try {
    for (const url of [input.galleryUrl, input.filmUrl])
      if (url && new URL(url).protocol !== "https:")
        throw new Error("Use HTTPS links");
    for (const date of [input.galleryExpires, input.deliveryDate])
      if (date && !/^\d{4}-\d{2}-\d{2}$/.test(date))
        throw new Error("Use complete dates");
    await updateBooking(ref, (b) => {
      Object.assign(ensureWedding(b), input);
      b.events.push({
        at: new Date().toISOString(),
        type: "wedding_delivery_updated",
        actor: admin.email,
      });
    });
    refresh(ref);
    return { ok: true, message: "Delivery links saved" };
  } catch (e) {
    return failure(e);
  }
}

export async function saveWeddingOperations(
  ref: string,
  key: string,
  rows: string[][],
): Promise<Result> {
  const admin = await requireAdmin();
  try {
    const r = OPERATION_REGISTERS.find((r) => r.key === key);
    if (
      !r ||
      rows.length > 200 ||
      rows.some(
        (row) =>
          row.length !== r.columns.length ||
          row.some((v) => typeof v !== "string" || v.length > 4000),
      )
    )
      throw new Error("Invalid register data");
    await updateBooking(ref, (b) => {
      (ensureWedding(b).operations ??= {})[key] = rows.map((row) =>
        key === "budget-payments"
          ? calculateBudgetRow(row)
          : row.map((v) => v.trim()),
      );
      b.events.push({
        at: new Date().toISOString(),
        type: "wedding_register_saved",
        actor: admin.email,
        detail: { key, entries: rows.length },
      });
    });
    refresh(ref);
    return { ok: true };
  } catch (e) {
    return failure(e);
  }
}
