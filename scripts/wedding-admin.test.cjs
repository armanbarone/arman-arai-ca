const test = require("node:test"),
  assert = require("node:assert/strict"),
  { createHash } = require("node:crypto");
const { loader } = require("./wedding-test-loader.cjs");
const pure = loader(),
  { sampleWedding } = pure("@/lib/portal/demo"),
  billing = pure("@/lib/portal/billing");
function fixture() {
  let b = sampleWedding(),
    tick = 0,
    ids = 0,
    role = "admin",
    email = "studio@example.com",
    failMail = false,
    failExpire = false;
  const sent = [],
    files = new Map(),
    config = {
      mode: "live",
      secret: "test-secret",
      accountId: "acct_test",
      webhookId: "we_test",
    };
  b.wedding.documents.find((d) => d.templateKey === "agreement").status =
    "executed";
  b.wedding.intake.status = "approved";
  const store = {
    getBooking: async () => structuredClone(b),
    updateBooking: async (ref, fn) => {
      const copy = structuredClone(b);
      await fn(copy);
      copy.updatedAt = new Date(1800000000000 + ++tick * 1000).toISOString();
      b = copy;
    },
    readJson: async () => ({ data: config }),
    writeJson: async () => {},
    writeFile: async (key, bytes) => files.set(key, bytes),
    readFile: async (key) =>
      files.has(key)
        ? {
            stream: new ReadableStream({
              start(c) {
                c.enqueue(files.get(key));
                c.close();
              },
            }),
          }
        : null,
  };
  const auth = {
    requireAdmin: async () => {
      if (role !== "admin") throw Error("Admin required");
      return { role, email };
    },
    requireBookingAccess: async (ref) => {
      if (
        ref !== b.ref ||
        (role !== "admin" && !b.clients.some((c) => c.email === email))
      )
        throw Error("Not found");
      return { session: { role, email }, booking: structuredClone(b) };
    },
    directWeddingLink: async () => `https://example.com/login-${++ids}`,
    requestMeta: async () => ({ ip: "192.0.2.1", userAgent: "Test" }),
  };
  const stripeStub = {
    paymentSetupStatus: async () => ({ connected: true, mode: "live" }),
    expireWeddingCheckouts: async () => {
      if (failExpire) throw Error("Stripe unavailable");
    },
    checkoutForInvoice: async () => {
      throw Error("Use the real integration double");
    },
  };
  const doubles = {
    "next/cache": { revalidatePath() {} },
    "@/lib/portal/auth": auth,
    "@/lib/portal/store": store,
    "./store": store,
    "@/lib/portal/token": {
      randomId: () => `test${++ids}`,
      sha256Hex: async (s) => createHash("sha256").update(s).digest("hex"),
    },
    "./token": { randomId: () => `test${++ids}` },
    "@/lib/portal/stripe": stripeStub,
    "@/lib/portal/invoice-pdf": {
      renderInvoicePdf: async () => Buffer.from("%PDF-fixture"),
    },
    "@/lib/portal/email": {
      sendEmail: async (data) => {
        sent.push(data);
        if (failMail && data.to === b.clients[1].email)
          throw Error("Second recipient unavailable");
        return { id: `mail-${sent.length}` };
      },
      layout: (data) => JSON.stringify(data),
      esc: (s) => s,
      footerText: () => "",
    },
  };
  const load = loader(doubles),
    actions = load("@/app/admin/invoice-actions"),
    manage = load("@/app/admin/manage-actions");
  return {
    actions,
    manage,
    store,
    doubles,
    load,
    sent,
    files,
    config,
    stripeStub,
    get b() {
      return b;
    },
    mutate(fn) {
      fn(b);
    },
    asClient() {
      role = "client";
      email = b.clients[0].email;
    },
    failMail(v) {
      failMail = v;
    },
    failExpire(v) {
      failExpire = v;
    },
  };
}
const portalInput = (b) => ({
  enabled: true,
  welcomeMessage: "Welcome to your wedding",
  hiddenWorkflows: [],
  internalNotes: "Studio only",
  planning: b.planning.map((p) => ({
    ...p,
    dueDate: p.dueDate || "",
    titleFr: p.titleFr || "",
  })),
});
test("new wedding creation accepts basic couple details and creates separate proposal and agreement drafts", async () => {
  const f = fixture(),
    created = [];
  f.store.nextReference = async () => "AA-CA-2027-099";
  f.store.createBooking = async (b) => created.push(structuredClone(b));
  const input = pure("@/lib/portal/blank").blankBookingInput();
  input.clients[0].legalName = "Sophia Chen";
  input.clients[0].email = "sophia@example.com";
  input.clients[1].legalName = "Oliver Park";
  input.clients[1].email = "oliver@example.com";
  input.event.date = "2027-07-17";
  input.event.serviceDates = input.event.date;
  input.event.location = "Vancouver";
  const result = await f
    .load("@/app/admin/actions")
    .saveBookingAction(null, input);
  assert.equal(result.ok, true);
  assert.equal(result.ref, "AA-CA-2027-099");
  assert.equal(created.length, 1);
  assert.equal(created[0].clients[0].phone, "");
  assert.equal(created[0].wedding.intake.status, "draft");
  assert.deepEqual(
    created[0].wedding.documents.map((d) => [d.templateKey, d.status]),
    [
      ["proposal", "draft"],
      ["agreement", "draft"],
    ],
  );
  assert.equal(
    created[0].schedule.reduce((sum, i) => sum + i.totalCents, 0),
    created[0].totals.totalCents,
  );
  assert.equal(f.sent.length, 0);
});
async function issue(f, card = false) {
  return f.actions.issueWeddingInvoice(
    f.b.ref,
    f.b.schedule[0].id,
    "Agreed booking instalment",
    card,
    f.b.updatedAt,
  );
}

test("draft deletion is recoverable, private to the studio and leaves the couple, invoice schedule and signed records intact", async () => {
  const f = fixture(),
    actions = f.load("@/app/admin/document-actions");
  const draft = {
    id: "agreement-draft-test",
    templateKey: "agreement",
    title: "Service agreement",
    version: 2,
    status: "draft",
    createdAt: f.b.createdAt,
    fields: { q2: "Keep these exact entries" },
    blocks: [],
    signatures: [],
    requiredEmails: [],
  };
  f.mutate((b) => b.wedding.documents.push(draft));
  const before = structuredClone(f.b);
  assert.equal(
    (await actions.deleteWeddingDraft(f.b.ref, draft.id, f.b.updatedAt)).ok,
    true,
  );
  const removed = f.b.wedding.documents.find((d) => d.id === draft.id);
  assert.equal(removed.status, "withdrawn");
  assert.ok(removed.deletedAt);
  assert.equal(removed.deletedBy, "studio@example.com");
  assert.deepEqual(removed.fields, draft.fields);
  assert.deepEqual(f.b.clients, before.clients);
  assert.deepEqual(f.b.schedule, before.schedule);
  assert.deepEqual(f.b.wedding.documents[0], before.wedding.documents[0]);
  assert.equal(
    pure("@/lib/portal/wedding")
      .serializeClientBooking(f.b)
      .wedding.documents.some((d) => d.id === draft.id),
    false,
  );
  assert.equal(f.b.events.at(-1).type, "wedding_draft_deleted");
  assert.equal(
    (await actions.restoreWeddingDraft(f.b.ref, draft.id, f.b.updatedAt)).ok,
    true,
  );
  const restored = f.b.wedding.documents.find((d) => d.id === draft.id);
  assert.equal(restored.status, "draft");
  assert.equal(restored.deletedAt, undefined);
  assert.deepEqual(restored.fields, draft.fields);
  assert.equal(f.b.events.at(-1).type, "wedding_draft_restored");
  assert.equal(f.sent.length, 0);
});

test("deleting or restoring drafts requires admin access and the current wedding version", async () => {
  const f = fixture(),
    actions = f.load("@/app/admin/document-actions");
  const draft = f.b.wedding.documents.find((d) => d.templateKey === "proposal");
  f.mutate(() => {
    draft.status = "draft";
    draft.signatures = [];
  });
  assert.equal(
    (await actions.deleteWeddingDraft(f.b.ref, draft.id, "old-version")).ok,
    false,
  );
  assert.equal(draft.deletedAt, undefined);
  const beforeDelete = f.b.updatedAt;
  assert.equal(
    (await actions.deleteWeddingDraft(f.b.ref, draft.id, beforeDelete)).ok,
    true,
  );
  assert.equal(
    (await actions.restoreWeddingDraft(f.b.ref, draft.id, beforeDelete)).ok,
    false,
  );
  f.asClient();
  await assert.rejects(
    () => actions.deleteWeddingDraft(f.b.ref, draft.id, f.b.updatedAt),
    /Admin required/,
  );
  await assert.rejects(
    () => actions.restoreWeddingDraft(f.b.ref, draft.id, f.b.updatedAt),
    /Admin required/,
  );
});

test("issued or signed documents cannot be deleted, including a signature added while deletion was pending", async () => {
  const f = fixture(),
    actions = f.load("@/app/admin/document-actions");
  const d = f.b.wedding.documents.find((d) => d.templateKey === "agreement");
  assert.equal(
    (await actions.deleteWeddingDraft(f.b.ref, d.id, f.b.updatedAt)).ok,
    false,
  );
  f.mutate(() => {
    d.status = "issued";
    d.signatures = [];
  });
  assert.equal(
    (await actions.deleteWeddingDraft(f.b.ref, d.id, f.b.updatedAt)).ok,
    false,
  );
  f.mutate(() => {
    d.status = "draft";
  });
  const expected = f.b.updatedAt;
  f.store.updateBooking = async (_ref, fn) => {
    const copy = structuredClone(f.b);
    copy.wedding.documents
      .find((x) => x.id === d.id)
      .signatures.push({ party: "client", email: copy.clients[0].email });
    await fn(copy);
  };
  assert.equal(
    (await actions.deleteWeddingDraft(f.b.ref, d.id, expected)).ok,
    false,
  );
  assert.equal(
    f.b.wedding.documents.find((x) => x.id === d.id).deletedAt,
    undefined,
  );
});

test("a deleted draft cannot be published and restoration never overwrites a newer active draft", async () => {
  const f = fixture(),
    actions = f.load("@/app/admin/document-actions");
  const draft = f.b.wedding.documents.find((d) => d.templateKey === "proposal");
  f.mutate(() => {
    draft.status = "draft";
    draft.signatures = [];
  });
  assert.equal(
    (await actions.deleteWeddingDraft(f.b.ref, draft.id, f.b.updatedAt)).ok,
    true,
  );
  const wedding = f.load("@/app/portal/wedding-actions");
  assert.equal(
    (
      await wedding.issueWeddingDocument(
        f.b.ref,
        draft.id,
        "",
        false,
        "old-revision",
      )
    ).ok,
    false,
  );
  const saved = await wedding.saveWeddingDraft(f.b.ref, "proposal", {}, "");
  assert.equal(saved.ok, true);
  assert.equal(
    (await actions.restoreWeddingDraft(f.b.ref, draft.id, f.b.updatedAt)).ok,
    false,
  );
  assert.equal(
    f.b.wedding.documents.find((d) => d.id === saved.id).status,
    "draft",
  );
  assert.ok(
    f.b.wedding.documents.find((d) => d.id === saved.id).version >
      draft.version,
  );
  assert.ok(f.b.wedding.documents.find((d) => d.id === draft.id).deletedAt);
});
test("invoices freeze the exact scheduled taxes and amounts, attach a PDF and email both partners", async () => {
  const f = fixture();
  assert.equal((await issue(f)).ok, true);
  const v = f.b.invoices[0],
    i = f.b.schedule[0];
  assert.equal(v.amountDueCents, i.totalCents);
  assert.equal(
    v.subtotalCents + v.taxes.reduce((s, t) => s + t.cents, 0),
    v.totalCents,
  );
  assert.equal(f.sent.length, 2);
  assert.match(f.sent[0].html, /View invoice & pay/);
  assert.match(f.sent[0].text, /due/);
  assert.equal(f.sent[0].attachments[0].content.toString(), "%PDF-fixture");
  assert.equal(Object.keys(v.deliveries).length, 2);
  assert.equal((await issue(f)).ok, false);
});
test("an email failure retains the invoice and retries only unsent recipients with the same payload and idempotency key", async () => {
  const f = fixture();
  f.failMail(true);
  assert.equal((await issue(f)).ok, true);
  const v = f.b.invoices[0];
  assert.ok(v.deliveryError);
  assert.equal(Object.keys(v.deliveries).length, 1);
  const failed = f.sent[1];
  f.failMail(false);
  assert.equal((await f.actions.retryInvoiceEmail(f.b.ref, v.id)).ok, true);
  assert.equal(f.sent.length, 3);
  assert.equal(f.sent[2].to, failed.to);
  assert.equal(f.sent[2].idempotencyKey, failed.idempotencyKey);
  assert.equal(f.sent[2].html, failed.html);
  assert.equal(f.b.invoices[0].deliveryError, undefined);
});
test("stale invoice requests and client attempts cannot issue financial records", async () => {
  const f = fixture();
  assert.equal(
    (
      await f.actions.issueWeddingInvoice(
        f.b.ref,
        f.b.schedule[0].id,
        "",
        false,
        "outdated",
      )
    ).ok,
    false,
  );
  assert.equal(f.b.invoices, undefined);
  f.asClient();
  await assert.rejects(() => issue(f), /Admin required/);
});
test("client portal editing preserves concurrent changes and required or already issued workflows", async () => {
  const f = fixture(),
    v = portalInput(f.b);
  assert.equal(
    (await f.manage.saveClientPortal(f.b.ref, v, "outdated")).ok,
    false,
  );
  v.hiddenWorkflows = ["agreement"];
  assert.equal(
    (await f.manage.saveClientPortal(f.b.ref, v, f.b.updatedAt)).ok,
    false,
  );
  v.hiddenWorkflows = ["engagement"];
  assert.equal(
    (await f.manage.saveClientPortal(f.b.ref, v, f.b.updatedAt)).ok,
    true,
  );
  const { workflowIsVisible } = pure("@/lib/portal/portal-controls");
  assert.equal(workflowIsVisible(f.b, "engagement"), false);
  f.mutate((b) =>
    b.wedding.documents.push({ templateKey: "engagement", status: "executed" }),
  );
  assert.equal(workflowIsVisible(f.b, "engagement"), true);
});
test("archive failures leave clients and invoices intact; archive revokes access and restore preserves signed records", async () => {
  const f = fixture();
  await issue(f);
  f.failExpire(true);
  assert.equal(
    (await f.manage.archiveWedding(f.b.ref, "Remove sample client")).ok,
    false,
  );
  assert.equal(f.b.archivedAt, undefined);
  assert.equal(f.b.invoices[0].status, "issued");
  f.failExpire(false);
  assert.equal(
    (await f.manage.archiveWedding(f.b.ref, "Remove sample client")).ok,
    true,
  );
  assert.ok(f.b.archivedAt);
  assert.equal(f.b.invoices[0].status, "void");
  const access = pure("@/lib/portal/portal-controls").assertClientPortalAccess;
  assert.throws(
    () => access(f.b, { role: "client", email: f.b.clients[0].email }),
    /access changed/,
  );
  assert.equal(
    (await f.manage.archiveWedding(f.b.ref, "Restore", true)).ok,
    true,
  );
  assert.equal(f.b.archivedAt, undefined);
  assert.equal(
    f.b.wedding.documents.find((d) => d.templateKey === "agreement").status,
    "executed",
  );
  assert.equal(f.b.invoices[0].status, "void");
});
test("the couple can complete only visible assigned tasks; suspended sessions cannot update them", async () => {
  const f = fixture();
  f.mutate((b) =>
    b.planning.push({
      id: "custom",
      section: "Planning",
      titleEn: "Send venue contact",
      titleFr: "",
      status: "todo",
      clientVisible: true,
      clientCanComplete: true,
      sortOrder: 90,
    }),
  );
  f.asClient();
  assert.equal(
    (await f.manage.completeClientTask(f.b.ref, "custom", true)).ok,
    true,
  );
  assert.equal(
    (await f.manage.completeClientTask(f.b.ref, f.b.planning[0].id, true)).ok,
    false,
  );
  f.mutate((b) => (b.portal = { enabled: false }));
  assert.equal(
    (await f.manage.completeClientTask(f.b.ref, "custom", false)).ok,
    false,
  );
});
test("a revoked session cannot save planning answers or report a transfer, and Interac cannot race an open card checkout", async () => {
  const f = fixture(),
    actions = f.load("@/app/portal/wedding-actions");
  f.asClient();
  f.mutate((b) => (b.archivedAt = new Date().toISOString()));
  assert.equal(
    (await actions.saveWeddingForm(f.b.ref, "discovery", {}, false, null)).ok,
    false,
  );
  assert.equal(
    (await actions.reportWeddingPayment(f.b.ref, f.b.schedule[0].id)).ok,
    false,
  );
  const f2 = fixture();
  f2.mutate(
    (b) =>
      (b.checkouts = [
        { id: "cs_open", status: "open", expiresAt: "2000-01-01" },
      ]),
  );
  assert.equal(
    (
      await f2
        .load("@/app/portal/wedding-actions")
        .recordWeddingPayment(
          f2.b.ref,
          f2.b.schedule[0].id,
          100,
          "Transfer-123",
        )
    ).ok,
    false,
  );
  assert.equal(f2.b.payments.length, 0);
});
test("client serialization removes private invoice login links, storage keys and Stripe references", async () => {
  const f = fixture();
  await issue(f);
  f.mutate((b) =>
    b.payments.push({
      id: "p",
      method: "stripe_card",
      status: "succeeded",
      stripePaymentIntentId: "pi_private",
      stripeCheckoutSessionId: "cs_private",
      amountCents: 1,
      recordedBy: "system",
    }),
  );
  const client = pure("@/lib/portal/wedding").serializeClientBooking(f.b);
  assert.equal(client.invoices[0].pdfKey, undefined);
  assert.equal(client.invoices[0].notificationRequests, undefined);
  assert.equal(client.payments[0].stripePaymentIntentId, undefined);
});
function stripeFixture(f) {
  const sessions = new Map(),
    created = [];
  class StripeDouble {
    constructor() {
      this.accounts = {
        retrieve: async () => ({
          id: "acct_test",
          country: "CA",
          charges_enabled: true,
        }),
      };
      this.webhookEndpoints = {
        retrieve: async () => ({
          status: "enabled",
          url: pure("@/lib/portal/business").APP_URL + "/api/stripe/webhook",
        }),
      };
      this.checkout = {
        sessions: {
          retrieve: async (id) => sessions.get(id),
          create: async (data) => {
            created.push(data);
            const s = {
              id: "cs_test",
              status: "open",
              payment_status: "unpaid",
              url: "https://checkout.stripe.com/test-only",
              expires_at: data.expires_at,
              livemode: true,
              currency: "cad",
              amount_total: data.line_items[0].price_data.unit_amount,
              metadata: data.metadata,
            };
            sessions.set(s.id, s);
            return s;
          },
          expire: async (id) => {
            sessions.get(id).status = "expired";
          },
        },
      };
    }
  }
  return {
    stripe: loader({ ...f.doubles, stripe: StripeDouble })(
      "./lib/portal/stripe",
    ),
    sessions,
    created,
  };
}
test("card checkout uses the stored invoice amount and a single reusable checkout for both partners", async () => {
  const oldEnv = process.env.VERCEL_ENV,
    oldKey = process.env.STRIPE_SECRET_KEY;
  process.env.VERCEL_ENV = "production";
  process.env.STRIPE_SECRET_KEY = "sk_live_fake_boundary_double";
  try {
    const f = fixture();
    await issue(f, true);
    const { stripe, created } = stripeFixture(f),
      v = f.b.invoices[0];
    assert.match(
      await stripe.checkoutForInvoice(f.b.ref, v.id, f.b.clients[0].email),
      /checkout.stripe.com/,
    );
    assert.equal(
      created[0].line_items[0].price_data.unit_amount,
      v.amountDueCents,
    );
    assert.deepEqual(created[0].allowed_payment_method_types, ["card"]);
    await stripe.checkoutForInvoice(f.b.ref, v.id, f.b.clients[1].email);
    assert.equal(created.length, 1);
    f.mutate((b) => (b.portal = { enabled: false }));
    await assert.rejects(
      () => stripe.checkoutForInvoice(f.b.ref, v.id, f.b.clients[0].email),
      /access/,
    );
  } finally {
    if (oldEnv === undefined) delete process.env.VERCEL_ENV;
    else process.env.VERCEL_ENV = oldEnv;
    if (oldKey === undefined) delete process.env.STRIPE_SECRET_KEY;
    else process.env.STRIPE_SECRET_KEY = oldKey;
  }
});
test("Stripe paid events are idempotent, reject mismatched totals, and refunds update only the refunded difference", async () => {
  const f = fixture();
  await issue(f);
  const { stripe } = stripeFixture(f),
    v = f.b.invoices[0],
    c = {
      id: "cs_test",
      invoiceId: v.id,
      installmentId: v.installmentId,
      amountCents: v.amountDueCents,
      email: f.b.clients[0].email,
      status: "open",
      livemode: true,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 3600000).toISOString(),
    };
  f.mutate((b) => (b.checkouts = [c]));
  const s = {
    id: c.id,
    metadata: { portal: "aa-ca-wedding", ref: f.b.ref, invoiceId: v.id },
    livemode: true,
    currency: "cad",
    amount_total: c.amountCents,
    status: "complete",
    payment_status: "paid",
    payment_intent: "pi_test",
  };
  await assert.rejects(
    () => stripe.reconcileStripeSession({ ...s, amount_total: 1 }),
    /mismatch/,
  );
  await stripe.reconcileStripeSession(s);
  await stripe.reconcileStripeSession(s);
  assert.equal(f.b.payments.length, 1);
  assert.equal(f.b.status, "booked");
  assert.equal(f.b.schedule[0].paidCents, c.amountCents);
  const refund = {
    metadata: s.metadata,
    payment_intent: "pi_test",
    currency: "cad",
    amount_refunded: 100,
  };
  await stripe.syncStripeRefund(refund);
  await stripe.syncStripeRefund(refund);
  assert.equal(f.b.schedule[0].paidCents, c.amountCents - 100);
  refund.amount_refunded = 200;
  await stripe.syncStripeRefund(refund);
  assert.equal(f.b.schedule[0].paidCents, c.amountCents - 200);
  assert.equal(f.b.payments[0].refundedCents, 200);
});
test("out-of-order refund events request a retry instead of losing the refund", async () => {
  const f = fixture(),
    { stripe } = stripeFixture(f);
  await assert.rejects(
    () =>
      stripe.syncStripeRefund({
        metadata: { portal: "aa-ca-wedding", ref: f.b.ref },
        payment_intent: "pi_later",
        currency: "cad",
        amount_refunded: 100,
      }),
    /Retry/,
  );
});
test("the webhook verifies the raw body signature and mode before processing", async () => {
  const Stripe = require("stripe"),
    sdk = new Stripe("sk_test_fake"),
    secret = "whsec_test",
    events = [];
  const route = loader({
    "@/lib/portal/stripe": {
      stripeClient: () => sdk,
      stripeConfiguration: async () => ({ secret, mode: "test" }),
      reconcileStripeSession: async (s) => events.push(s),
      syncStripeRefund: async () => {},
    },
  })("@/app/api/stripe/webhook/route");
  const payload = JSON.stringify({
      id: "evt_test",
      object: "event",
      type: "checkout.session.completed",
      livemode: false,
      data: { object: { id: "cs_signed" } },
    }),
    header = sdk.webhooks.generateTestHeaderString({ payload, secret });
  assert.equal(
    (
      await route.POST(
        new Request("https://example.com/api/stripe/webhook", {
          method: "POST",
          body: payload,
        }),
      )
    ).status,
    400,
  );
  assert.equal(
    (
      await route.POST(
        new Request("https://example.com/api/stripe/webhook", {
          method: "POST",
          headers: { "stripe-signature": header },
          body: payload + " ",
        }),
      )
    ).status,
    400,
  );
  assert.equal(
    (
      await route.POST(
        new Request("https://example.com/api/stripe/webhook", {
          method: "POST",
          headers: { "stripe-signature": header },
          body: payload,
        }),
      )
    ).status,
    200,
  );
  assert.equal(events.length, 1);
});
