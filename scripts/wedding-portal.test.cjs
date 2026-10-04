const test = require("node:test"),
  assert = require("node:assert/strict"),
  { createHash } = require("node:crypto");
const { loader } = require("./wedding-test-loader.cjs");
const pure = loader(),
  w = pure("@/lib/portal/wedding"),
  { sampleWedding } = pure("@/lib/portal/demo");
const hash = async (s) => createHash("sha256").update(s).digest("hex");
function fixture() {
  let booking = sampleWedding();
  booking.wedding.documents.sort(
    (a, b) =>
      Number(b.templateKey === "agreement") -
      Number(a.templateKey === "agreement"),
  );
  let session = { role: "client", email: booking.clients[0].email },
    ids = 0,
    failDelivery = false,
    afterMutation;
  const emails = [],
    deliveries = [];
  const store = {
    getBooking: async () => structuredClone(booking),
    updateBooking: async (ref, fn) => {
      let copy = structuredClone(booking);
      await fn(copy);
      if (afterMutation) {
        const next = afterMutation;
        afterMutation = null;
        await next(booking);
        copy = structuredClone(booking);
        await fn(copy);
      }
      booking = copy;
    },
  };
  const auth = {
    requireAdmin: async () => {
      if (session.role !== "admin") throw Error("Admin required");
      return session;
    },
    requireBookingAccess: async (ref) => {
      if (
        ref !== booking.ref ||
        (session.role !== "admin" &&
          !booking.clients.some((c) => c.email === session.email))
      )
        throw Error("Not found");
      return { session, booking: structuredClone(booking) };
    },
    requestMeta: async () => ({ ip: "192.0.2.1", userAgent: "Test browser" }),
    directWeddingLink: async () => "https://example.com/test-only",
  };
  const doubles = {
    "next/cache": { revalidatePath: () => {} },
    "@/lib/portal/auth": auth,
    "@/lib/portal/store": store,
    "@/lib/portal/token": { sha256Hex: hash, randomId: () => `test${++ids}` },
    "@/lib/portal/email": {
      sendEmail: async (data) => {
        emails.push(data);
        return { id: "test-email" };
      },
      layout: () => "",
      esc: (s) => s,
      footerText: () => "",
    },
    "@/lib/portal/wedding-delivery": {
      deliverSignedWeddingDocument: async (...args) => {
        deliveries.push(args);
        if (failDelivery) throw Error("Email unavailable");
      },
    },
  };
  const load = loader(doubles),
    actions = load("@/app/portal/wedding-actions");
  return {
    actions,
    store,
    doubles,
    load,
    emails,
    deliveries,
    get booking() {
      return booking;
    },
    get session() {
      return session;
    },
    set session(s) {
      session = s;
    },
    set failDelivery(v) {
      failDelivery = v;
    },
    set afterMutation(fn) {
      afterMutation = fn;
    },
    async prepare(key = "agreement") {
      const d = booking.wedding.documents.find((d) => d.templateKey === key);
      d.hash = await hash(
        JSON.stringify({
          blocks: d.blocks,
          requiredEmails: d.requiredEmails,
          version: d.version,
          templateKey: d.templateKey,
        }),
      );
      return d;
    },
  };
}
test("signed commercial tables use exact booking totals and all four dates", () => {
  const b = sampleWedding(),
    t = w.templateFor("agreement", b);
  const fields = {
    ...Object.fromEntries(
      w.templateFields(t).map((f) => [f.id, "Not applicable"]),
    ),
    ...w.seedFields(t, b),
  };
  const blocks = w.resolveBlocks(t, fields),
    p = blocks.find((x) => x.id === "calculated-prices"),
    s = blocks.find((x) => x.id === "calculated-schedule");
  assert.equal(p.rows.at(-1)[2].text, "$4,725.00");
  assert.equal(s.rows.length, 5);
  assert.equal(s.rows.at(-1).at(-1).text, "$0.00");
  assert.equal(w.missingDocumentFields(t, fields).length, 0);
});
test("all 24 supplied standard agreement clauses and provenance are preserved", () => {
  const t = w.templateFor("agreement"),
    headings = t.blocks.filter((b) => b.kind === "h").map((b) => b.text);
  for (let i = 1; i <= 24; i++)
    assert(
      headings.some((h) => h.startsWith(i + ". ") || h.startsWith(i + " ")),
      `Clause ${i}`,
    );
  assert.match(t.sourceSha256, /^[a-f0-9]{64}$/);
  assert.equal(w.WEDDING_TEMPLATES.length, 20);
});
test("client serialization excludes private records, operations and IP addresses", () => {
  const b = sampleWedding();
  b.wedding.operations = { compliance: [["SECRET"]] };
  b.wedding.documents.push({
    ...b.wedding.documents[0],
    id: "private",
    templateKey: "production",
    status: "draft",
  });
  b.wedding.forms.production = {
    fields: { secret: "STUDIO_SECRET_SENTINEL" },
    status: "draft",
    actor: "admin",
    updatedAt: b.updatedAt,
  };
  const text = JSON.stringify(w.serializeClientBooking(b));
  assert(!text.includes("SAMPLE_INTERNAL_NOTE"));
  assert(!text.includes("SECRET"));
  assert(!text.includes("STUDIO_SECRET_SENTINEL"));
  assert(!text.includes('"id":"private"'));
});
test("each partner signs separately; Private stays permitted; PDF follows the last signature", async () => {
  const f = fixture(),
    d = await f.prepare();
  let r = await f.actions.signWeddingDocument(
    f.booking.ref,
    d.id,
    d.hash,
    "Maya Bennett",
    true,
    { portfolio: "private" },
  );
  assert(r.ok);
  assert.equal(f.booking.wedding.documents[0].status, "partial");
  assert.equal(f.deliveries.length, 0);
  f.session = { role: "client", email: "james@example.com" };
  r = await f.actions.signWeddingDocument(
    f.booking.ref,
    d.id,
    d.hash,
    "James Ellis",
    true,
    { portfolio: "portfolio_no_name" },
  );
  assert(r.ok);
  assert.equal(f.booking.wedding.documents[0].status, "executed");
  assert.equal(f.deliveries.length, 1);
  assert.equal(f.booking.status, "signed");
  assert.equal(
    f.booking.wedding.documents[0].signatures[0].answers.portfolio,
    "private",
  );
});
test("a duplicate signature and a stale or tampered hash cannot change the record", async () => {
  const f = fixture(),
    d = await f.prepare();
  assert(
    !(
      await f.actions.signWeddingDocument(
        f.booking.ref,
        d.id,
        "wrong",
        "Maya Bennett",
        true,
        { portfolio: "private" },
      )
    ).ok,
  );
  assert.equal(f.booking.wedding.documents[0].signatures.length, 0);
  assert(
    (
      await f.actions.signWeddingDocument(
        f.booking.ref,
        d.id,
        d.hash,
        "Maya Bennett",
        true,
        { portfolio: "private" },
      )
    ).ok,
  );
  assert(
    !(
      await f.actions.signWeddingDocument(
        f.booking.ref,
        d.id,
        d.hash,
        "Maya Bennett",
        true,
        { portfolio: "private" },
      )
    ).ok,
  );
  assert.equal(f.booking.wedding.documents[0].signatures.length, 1);
});
test("signature duplicate protection is rechecked after a concurrent storage retry", async () => {
  const f = fixture(),
    d = await f.prepare();
  f.afterMutation = (b) => {
    b.wedding.documents[0].signatures.push({
      party: "client",
      email: "maya@example.com",
    });
  };
  const r = await f.actions.signWeddingDocument(
    f.booking.ref,
    d.id,
    d.hash,
    "Maya Bennett",
    true,
    { portfolio: "private" },
  );
  assert(!r.ok);
  assert.match(r.error, /already recorded/);
  assert.equal(f.booking.wedding.documents[0].signatures.length, 1);
});
test("signature survives failed PDF email delivery", async () => {
  const f = fixture(),
    d = await f.prepare();
  assert(
    (
      await f.actions.signWeddingDocument(
        f.booking.ref,
        d.id,
        d.hash,
        "Maya Bennett",
        true,
        { portfolio: "private" },
      )
    ).ok,
  );
  f.session = { role: "client", email: "james@example.com" };
  f.failDelivery = true;
  const r = await f.actions.signWeddingDocument(
    f.booking.ref,
    d.id,
    d.hash,
    "James Ellis",
    true,
    { portfolio: "private" },
  );
  assert(r.ok);
  assert.match(r.message, /attention/);
  assert.equal(f.booking.wedding.documents[0].signatures.length, 2);
});
test("wrong legal names, missing consent and incomplete separate opt-ins are rejected", async () => {
  const f = fixture(),
    d = await f.prepare("privacy");
  for (const [name, consent, answers] of [
    ["Maya", true, { portfolio: "private" }],
    ["Maya Bennett", false, { portfolio: "private" }],
    [
      "Maya Bennett",
      true,
      {
        portfolio: "private",
        paidAdvertising: "yes",
        testimonial: "no",
        marketing: "no",
      },
    ],
  ])
    assert(
      !(
        await f.actions.signWeddingDocument(
          f.booking.ref,
          d.id,
          d.hash,
          name,
          consent,
          answers,
        )
      ).ok,
    );
  assert.equal(
    f.booking.wedding.documents.find((x) => x.id === d.id).signatures.length,
    0,
  );
  assert(
    (
      await f.actions.signWeddingDocument(
        f.booking.ref,
        d.id,
        d.hash,
        "Maya Bennett",
        true,
        {
          portfolio: "private",
          paidAdvertising: "no",
          testimonial: "no",
          marketing: "no",
          crossBorderNotice: "read",
        },
      )
    ).ok,
  );
});
test("studio cannot sign for either client or publish incomplete documents", async () => {
  const f = fixture(),
    d = await f.prepare();
  f.session = { role: "admin", email: "i@armanarai.com" };
  assert(
    !(
      await f.actions.signWeddingDocument(
        f.booking.ref,
        d.id,
        d.hash,
        "Maya Bennett",
        true,
        { portfolio: "private" },
      )
    ).ok,
  );
  const r = await f.actions.saveWeddingDraft(f.booking.ref, "proposal", {}, "");
  assert(r.ok);
  assert(
    !(
      await f.actions.issueWeddingDocument(
        f.booking.ref,
        r.id,
        "",
        false,
        r.revision,
      )
    ).ok,
  );
});
test("changing the booking invalidates accepted proposal; Quebec issuance is gated", async () => {
  const f = fixture();
  f.session = { role: "admin", email: "i@armanarai.com" };
  const b = f.booking,
    p = b.wedding.documents.find((d) => d.templateKey === "proposal");
  p.bookingHash = await hash(w.commercialFingerprint(b));
  b.lines[0].cents++;
  b.wedding.documents = b.wedding.documents.filter(
    (d) => d.templateKey !== "agreement",
  );
  const t = w.templateFor("agreement", b),
    fields = {
      ...Object.fromEntries(
        w.templateFields(t).map((f) => [f.id, "Not applicable"]),
      ),
      ...w.seedFields(t, b),
    };
  let r = await f.actions.saveWeddingDraft(b.ref, "agreement", fields, "");
  assert(r.ok);
  r = await f.actions.issueWeddingDocument(
    b.ref,
    r.id,
    "Arman Arai",
    true,
    r.revision,
  );
  assert(!r.ok);
  assert.match(r.error, /no longer matches/);
  f.booking.event.province = "QC";
  const qcDraft = await f.actions.saveWeddingDraft(
    b.ref,
    "agreement",
    fields,
    "",
  );
  r = await f.actions.issueWeddingDocument(
    b.ref,
    qcDraft.id,
    "Arman Arai",
    true,
    qcDraft.revision,
  );
  assert(!r.ok);
  assert.match(r.error, /French/);
});
test("payment reports do not create receipts; verified receipts reject duplicates and overpayments", async () => {
  const f = fixture(),
    i = f.booking.schedule[0];
  assert((await f.actions.reportWeddingPayment(f.booking.ref, i.id)).ok);
  assert.equal(f.booking.schedule[0].paidCents, 0);
  assert.equal(f.booking.payments.length, 0);
  f.session = { role: "admin", email: "i@armanarai.com" };
  assert(
    !(
      await f.actions.recordWeddingPayment(
        f.booking.ref,
        i.id,
        i.totalCents + 1,
        "bank-123",
      )
    ).ok,
  );
  assert(
    (
      await f.actions.recordWeddingPayment(
        f.booking.ref,
        i.id,
        5000,
        "bank-123",
      )
    ).ok,
  );
  assert(
    !(
      await f.actions.recordWeddingPayment(
        f.booking.ref,
        i.id,
        5000,
        "bank-123",
      )
    ).ok,
  );
  assert.equal(f.booking.schedule[0].paidCents, 5000);
});
test("custom schedule reconciles each instalment and every tax to the cent", async () => {
  const f = fixture();
  f.booking.status = "draft";
  f.session = { role: "admin", email: "i@armanarai.com" };
  const r = await f.actions.saveWeddingSchedule(f.booking.ref, [
    { id: "a", label: "Booking", dueDate: "2026-10-03", totalCents: 123457 },
    { id: "b", label: "Final", dueDate: "2027-05-01", totalCents: 349043 },
  ]);
  assert(r.ok);
  for (const i of f.booking.schedule)
    assert.equal(
      i.totalCents,
      i.subtotalCents + Object.values(i.taxCents).reduce((s, x) => s + x, 0),
    );
  assert.equal(
    f.booking.schedule.reduce((s, i) => s + i.taxCents.GST, 0),
    22500,
  );
});
test("shared planning forms preserve newer partner answers instead of silently overwriting", async () => {
  const f = fixture();
  let r = await f.actions.saveWeddingForm(
    f.booking.ref,
    "discovery",
    {},
    false,
    null,
  );
  assert(r.ok);
  const previous = r.updatedAt;
  f.booking.wedding.forms.discovery.updatedAt = "2026-10-04T12:00:00Z";
  r = await f.actions.saveWeddingForm(
    f.booking.ref,
    "discovery",
    {},
    true,
    previous,
  );
  assert(!r.ok);
  assert.match(r.error, /newer answers/);
  assert.equal(f.booking.wedding.forms.discovery.status, "draft");
});
test("complete agreement issues only against the reviewed draft and accepted matching proposal", async () => {
  const f = fixture();
  f.session = { role: "admin", email: "i@armanarai.com" };
  f.booking.wedding.documents = f.booking.wedding.documents.filter(
    (d) => d.templateKey === "proposal",
  );
  f.booking.wedding.documents[0].bookingHash = await hash(
    w.commercialFingerprint(f.booking),
  );
  const t = w.templateFor("agreement", f.booking),
    fields = {
      ...Object.fromEntries(
        w.templateFields(t).map((f) => [f.id, "Not applicable"]),
      ),
      ...w.seedFields(t, f.booking),
    };
  const saved = await f.actions.saveWeddingDraft(
    f.booking.ref,
    "agreement",
    fields,
    "",
  );
  assert(saved.ok);
  assert(
    !(
      await f.actions.issueWeddingDocument(
        f.booking.ref,
        saved.id,
        "Arman Arai",
        true,
        "wrong",
      )
    ).ok,
  );
  const r = await f.actions.issueWeddingDocument(
    f.booking.ref,
    saved.id,
    "Arman Arai",
    true,
    saved.revision,
  );
  assert(r.ok);
  const d = f.booking.wedding.documents.find((d) => d.id === saved.id);
  assert.equal(d.status, "issued");
  assert.equal(d.signatures[0].party, "company");
  assert(d.blocks.some((b) => b.kind === "h" && b.text.startsWith("Appendix")));
  assert.deepEqual(
    f.emails.map((x) => x.to),
    ["maya@example.com", "james@example.com"],
  );
});
test("client cannot write a studio form or operations register", async () => {
  const f = fixture();
  assert(
    !(await f.actions.saveWeddingForm(f.booking.ref, "production", {}, true))
      .ok,
  );
  await assert.rejects(
    f.actions.saveWeddingOperations(f.booking.ref, "compliance", []),
    /Admin required/,
  );
});
test("a booking revision applies only after company and both client signatures, preserving receipts", async () => {
  const f = fixture();
  f.booking.status = "booked";
  f.booking.wedding.documents.find(
    (d) => d.templateKey === "agreement",
  ).status = "executed";
  f.session = { role: "admin", email: "i@armanarai.com" };
  assert(
    (
      await f.actions.recordWeddingPayment(
        f.booking.ref,
        "i1",
        118125,
        "received-before-change",
      )
    ).ok,
  );
  const input = f.load("@/lib/portal/blank").existingBookingInput(f.booking);
  input.lines[0].cents = 500000;
  input.event.date = "2027-06-20";
  input.fields.coverage = "10 hours, 12:00 to 22:00 America/Vancouver";
  const adminActions = f.load("@/app/admin/actions");
  const staged = await adminActions.saveBookingAmendmentAction(
    f.booking.ref,
    input,
    "Add two coverage hours and move the wedding to June 20, 2027.",
    "2027-05-20",
  );
  assert(staged.ok, staged.error);
  assert.equal(f.booking.totals.totalCents, 472500);
  assert.equal(f.booking.event.date, "2027-06-19");
  let d = f.booking.wedding.documents.find((d) => d.templateKey === "change");
  const t = w.templateFor("change", f.booking, d.amendment),
    fields = {
      ...Object.fromEntries(
        w.templateFields(t).map((f) => [f.id, "Not applicable"]),
      ),
      ...w.seedFields(t, f.booking),
    };
  const saved = await f.actions.saveWeddingDraft(
    f.booking.ref,
    "change",
    fields,
    "",
  );
  assert(saved.ok);
  assert(
    (
      await f.actions.issueWeddingDocument(
        f.booking.ref,
        saved.id,
        "Arman Arai",
        true,
        saved.revision,
      )
    ).ok,
  );
  d = f.booking.wedding.documents.find((d) => d.id === saved.id);
  f.session = { role: "client", email: "maya@example.com" };
  assert(
    (
      await f.actions.signWeddingDocument(
        f.booking.ref,
        d.id,
        d.hash,
        "Maya Bennett",
        true,
        {},
      )
    ).ok,
  );
  assert.equal(f.booking.totals.totalCents, 472500);
  f.session = { role: "client", email: "james@example.com" };
  const result = await f.actions.signWeddingDocument(
    f.booking.ref,
    d.id,
    d.hash,
    "James Ellis",
    true,
    {},
  );
  assert(result.ok, result.error);
  assert.equal(f.booking.totals.totalCents, 525000);
  assert.equal(f.booking.event.date, "2027-06-20");
  assert.equal(
    f.booking.schedule.reduce((s, i) => s + i.paidCents, 0),
    118125,
  );
  assert.equal(
    f.booking.schedule.reduce((s, i) => s + i.totalCents, 0),
    525000,
  );
  assert.equal(f.booking.payments.length, 1);
  assert.equal(
    f.booking.wedding.documents.find(
      (d) => d.id === d.id && d.templateKey === "change",
    ).status,
    "executed",
  );
});
test("a concurrent payment invalidates an outstanding change order instead of overwriting receipts", async () => {
  const f = fixture();
  f.booking.status = "booked";
  f.booking.wedding.documents.find(
    (d) => d.templateKey === "agreement",
  ).status = "executed";
  f.session = { role: "admin", email: "i@armanarai.com" };
  const input = f.load("@/lib/portal/blank").existingBookingInput(f.booking);
  input.lines[0].cents = 500000;
  assert(
    (
      await f
        .load("@/app/admin/actions")
        .saveBookingAmendmentAction(
          f.booking.ref,
          input,
          "Add two hours of wedding photography coverage.",
          "2027-05-20",
        )
    ).ok,
  );
  let d = f.booking.wedding.documents.find((d) => d.templateKey === "change");
  const t = w.templateFor("change", f.booking, d.amendment),
    fields = {
      ...Object.fromEntries(
        w.templateFields(t).map((f) => [f.id, "Not applicable"]),
      ),
      ...w.seedFields(t, f.booking),
    };
  const saved = await f.actions.saveWeddingDraft(
    f.booking.ref,
    "change",
    fields,
    "",
  );
  assert(
    (
      await f.actions.issueWeddingDocument(
        f.booking.ref,
        saved.id,
        "Arman Arai",
        true,
        saved.revision,
      )
    ).ok,
  );
  d = f.booking.wedding.documents.find((d) => d.id === saved.id);
  assert(
    (
      await f.actions.recordWeddingPayment(
        f.booking.ref,
        "i1",
        1000,
        "new-receipt-after-issue",
      )
    ).ok,
  );
  f.session = { role: "client", email: "maya@example.com" };
  const r = await f.actions.signWeddingDocument(
    f.booking.ref,
    d.id,
    d.hash,
    "Maya Bennett",
    true,
    {},
  );
  assert(!r.ok);
  assert.match(r.error, /record changed/);
  assert.equal(f.booking.schedule[0].paidCents, 1000);
  assert.equal(f.booking.totals.totalCents, 472500);
});
test("Quebec revisions and invalid calendar dates are blocked before staging", async () => {
  const f = fixture();
  f.booking.status = "booked";
  f.booking.wedding.documents.find(
    (d) => d.templateKey === "agreement",
  ).status = "executed";
  f.session = { role: "admin", email: "i@armanarai.com" };
  const admin = f.load("@/app/admin/actions"),
    input = f.load("@/lib/portal/blank").existingBookingInput(f.booking);
  input.event.date = "2027-02-30";
  const bad = await admin.saveBookingAmendmentAction(
    f.booking.ref,
    input,
    "Revise the event date for this wedding.",
    "2027-05-20",
  );
  assert(!bad.ok);
  assert.match(bad.error, /valid full date/);
  input.event.date = "2027-06-19";
  input.event.province = "QC";
  const qc = await admin.saveBookingAmendmentAction(
    f.booking.ref,
    input,
    "Move the wedding venue to Quebec.",
    "2027-05-20",
  );
  assert(!qc.ok);
  assert.match(qc.error, /French/);
  assert(!f.booking.wedding.documents.some((d) => d.templateKey === "change"));
});
test("cancelled bookings and superseded document versions cannot create signing tasks", async () => {
  const f = fixture(),
    d = await f.prepare();
  d.status = "superseded";
  assert(
    !w
      .nextActions(f.booking, "maya@example.com")
      .some((t) => t.href.endsWith(d.id)),
  );
  f.booking.status = "cancelled";
  d.status = "issued";
  assert.equal(w.nextActions(f.booking, "maya@example.com").length, 0);
  assert(
    !(
      await f.actions.signWeddingDocument(
        f.booking.ref,
        d.id,
        d.hash,
        "Maya Bennett",
        true,
        { portfolio: "private" },
      )
    ).ok,
  );
});
test("PDF delivery uses both client addresses, stores the file, and retries only unsent recipients", async () => {
  const f = fixture(),
    d = await f.prepare();
  d.status = "executed";
  const sent = [],
    files = new Map();
  let fail = true;
  f.doubles["./store"] = {
    ...f.store,
    writeFile: async (k, b) => files.set(k, b),
    readFile: async (k) =>
      files.has(k)
        ? {
            stream: new ReadableStream({
              start(c) {
                c.enqueue(files.get(k));
                c.close();
              },
            }),
          }
        : null,
  };
  f.doubles["./wedding-pdf"] = {
    renderWeddingPdf: async () => Buffer.from("%PDF test"),
  };
  f.doubles["./email"] = {
    sendEmail: async (x) => {
      if (x.to === "james@example.com" && fail) throw Error("Transient outage");
      sent.push(x);
      return { id: `id-${x.to}` };
    },
    layout: () => "",
    esc: (s) => s,
    footerText: () => "",
  };
  delete f.doubles["@/lib/portal/wedding-delivery"];
  const delivery = loader(f.doubles)("@/lib/portal/wedding-delivery");
  await assert.rejects(
    delivery.deliverSignedWeddingDocument(f.booking.ref, d.id),
  );
  assert.equal(sent.length, 1);
  assert(f.booking.wedding.documents[0].pdfKey);
  fail = false;
  await delivery.deliverSignedWeddingDocument(f.booking.ref, d.id);
  assert.deepEqual(
    sent.map((x) => x.to),
    ["maya@example.com", "james@example.com", "i@armanarai.com"],
  );
  await delivery.deliverSignedWeddingDocument(f.booking.ref, d.id);
  assert.equal(sent.length, 3);
  assert(
    sent.every((x) => x.attachments[0].content.toString() === "%PDF test"),
  );
});
