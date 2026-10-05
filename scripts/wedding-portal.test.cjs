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
  booking.wedding.intake.status = "approved";
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
      d.hash = await hash(w.documentFingerprint(d));
      return d;
    },
  };
}
test("signed commercial tables use exact booking totals and all three website payment dates", () => {
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
  assert.equal(p.rows.at(-1)[2].text, "$3,150.00");
  assert.equal(s.rows.length, 4);
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
    initialsFor(f.booking, d.id, "Maya Bennett"),
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
    initialsFor(f.booking, d.id, "James Ellis"),
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
        initialsFor(f.booking, d.id, "Maya Bennett"),
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
        initialsFor(f.booking, d.id, "Maya Bennett"),
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
        initialsFor(f.booking, d.id, "Maya Bennett"),
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
    initialsFor(f.booking, d.id, "Maya Bennett"),
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
        initialsFor(f.booking, d.id, "Maya Bennett"),
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
    initialsFor(f.booking, d.id, "James Ellis"),
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
          initialsFor(f.booking, d.id, name),
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
        initialsFor(f.booking, d.id, "Maya Bennett"),
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
        initialsFor(f.booking, d.id, "Maya Bennett"),
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
        "AA",
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
    "AA",
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
    "AA",
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
    { id: "b", label: "Final", dueDate: "2027-05-01", totalCents: 191543 },
  ]);
  assert(r.ok);
  for (const i of f.booking.schedule)
    assert.equal(
      i.totalCents,
      i.subtotalCents + Object.values(i.taxCents).reduce((s, x) => s + x, 0),
    );
  assert.equal(
    f.booking.schedule.reduce((s, i) => s + i.taxCents.GST, 0),
    15000,
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
        "AA",
      )
    ).ok,
  );
  const r = await f.actions.issueWeddingDocument(
    f.booking.ref,
    saved.id,
    "Arman Arai",
    true,
    saved.revision,
    "AA",
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
        94500,
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
  assert.equal(f.booking.totals.totalCents, 315000);
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
        "AA",
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
        initialsFor(f.booking, d.id, "Maya Bennett"),
      )
    ).ok,
  );
  assert.equal(f.booking.totals.totalCents, 315000);
  f.session = { role: "client", email: "james@example.com" };
  const result = await f.actions.signWeddingDocument(
    f.booking.ref,
    d.id,
    d.hash,
    "James Ellis",
    true,
    {},
    initialsFor(f.booking, d.id, "James Ellis"),
  );
  assert(result.ok, result.error);
  assert.equal(f.booking.totals.totalCents, 525000);
  assert.equal(f.booking.event.date, "2027-06-20");
  assert.equal(
    f.booking.schedule.reduce((s, i) => s + i.paidCents, 0),
    94500,
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
        "AA",
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
    initialsFor(f.booking, d.id, "Maya Bennett"),
  );
  assert(!r.ok);
  assert.match(r.error, /record changed/);
  assert.equal(f.booking.schedule[0].paidCents, 1000);
  assert.equal(f.booking.totals.totalCents, 315000);
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
        initialsFor(f.booking, d.id, "Maya Bennett"),
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

function initialsFor(b, id, name) {
  const d = b.wedding.documents.find((x) => x.id === id);
  const m = pure("@/lib/portal/document-sections");
  return Object.fromEntries(
    m.initialSectionsFor(d).map((s) => [s.id, m.initialsForName(name)]),
  );
}

test("current catalogue and website payment percentages use one shared source", () => {
  const b = sampleWedding(),
    { TIERS } = pure("@/lib/site"),
    { PACKAGES } = pure("@/lib/portal/presets");
  assert.deepEqual(
    PACKAGES.slice(0, 3).map((p) => [p.key, p.name, p.priceCents]),
    TIERS.map((t) => [t.slug, t.name, t.price * 100]),
  );
  assert.deepEqual(
    b.schedule.map((i) => i.totalCents),
    [94500, 110250, 110250],
  );
  assert.deepEqual(
    b.schedule.map((i) => i.dueDate),
    ["2026-10-03", "2027-04-20", "2027-05-20"],
  );
  const money = pure("@/lib/portal/money");
  b.totals = money.computeTotals([{ cents: 300001 }], b.taxes);
  const rows = money.buildSchedule(b, "2026-10-03");
  assert.equal(
    rows.reduce((n, i) => n + i.totalCents, 0),
    b.totals.totalCents,
  );
});
test("every reviewed section needs the authenticated person's initials before signing", async () => {
  const f = fixture(),
    d = await f.prepare();
  const correct = initialsFor(f.booking, d.id, "Maya Bennett");
  for (const initials of [
    {},
    { ...correct, [Object.keys(correct)[0]]: "JE" },
    { ...correct, unknown: "MB" },
  ]) {
    const r = await f.actions.signWeddingDocument(
      f.booking.ref,
      d.id,
      d.hash,
      "Maya Bennett",
      true,
      { portfolio: "private" },
      initials,
    );
    assert(!r.ok);
    assert.equal(f.booking.wedding.documents[0].signatures.length, 0);
  }
  const r = await f.actions.signWeddingDocument(
    f.booking.ref,
    d.id,
    d.hash,
    "Maya Bennett",
    true,
    { portfolio: "private" },
    correct,
  );
  assert(r.ok, r.error);
  assert.deepEqual(
    f.booking.wedding.documents[0].signatures[0].initials,
    correct,
  );
});
test("couple enters venues and names; studio approves package details; signed records stay fixed", async () => {
  const f = fixture(),
    a = f.load("@/app/portal/contract-actions"),
    details = pure("@/lib/portal/contract-details");
  f.booking.wedding.intake.status = "draft";
  const oldProposal = JSON.stringify(
    f.booking.wedding.documents.find((d) => d.templateKey === "proposal"),
  );
  const v = details.initialContractDetails(f.booking);
  v.people[0].legalName = "Maya Marie Bennett";
  v.eventVenue = "Lakeside House, 10 Lake Road";
  v.ceremonyLocation = "Lake Gardens, 20 Lake Road";
  v.receptionLocation = "Lakeside Ballroom, 10 Lake Road";
  v.ceremonyTime = "14:30";
  v.collectionKey = "complete";
  let r = await a.saveWeddingContractDetails(
    f.booking.ref,
    { ...v, priceCents: 1 },
    true,
    f.booking.wedding.intake.updatedAt,
  );
  assert(!r.ok);
  r = await a.saveWeddingContractDetails(
    f.booking.ref,
    v,
    true,
    f.booking.wedding.intake.updatedAt,
  );
  assert(r.ok, r.error);
  assert.equal(f.booking.clients[0].legalName, "Maya Bennett");
  const revision = r.updatedAt;
  r = await a.saveWeddingContractDetails(f.booking.ref, v, true, "stale");
  assert(!r.ok);
  assert.match(r.error, /newer/);
  await assert.rejects(
    a.approveWeddingContractDetails(f.booking.ref, revision),
    /Admin required/,
  );
  f.session = { role: "admin", email: "i@armanarai.com" };
  r = await a.approveWeddingContractDetails(f.booking.ref, revision);
  assert(r.ok, r.error);
  assert.equal(f.booking.clients[0].legalName, "Maya Marie Bennett");
  assert.equal(f.booking.clients[0].email, "maya@example.com");
  assert.equal(f.booking.packageName, "Legacy");
  assert.equal(f.booking.lines[0].cents, 420000);
  assert.equal(
    JSON.stringify(
      f.booking.wedding.documents.find(
        (d) => d.templateKey === "proposal" && d.status === "executed",
      ),
    ),
    oldProposal,
  );
  const d = f.booking.wedding.documents.find(
    (d) => d.templateKey === "agreement" && d.status === "draft",
  );
  const text = JSON.stringify(d.blocks);
  for (const value of [
    "Maya Marie Bennett",
    v.eventVenue,
    v.ceremonyLocation,
    v.receptionLocation,
    "14:30",
    "800+",
  ])
    assert(text.includes(value), value);
  f.session = { role: "client", email: "maya@example.com" };
  d.status = "partial";
  d.signatures.push({ party: "client", email: f.session.email });
  r = await a.saveWeddingContractDetails(
    f.booking.ref,
    v,
    false,
    f.booking.wedding.intake.updatedAt,
  );
  assert(!r.ok);
  assert.match(r.error, /fixed/);
});
test("draft details block issuing and signing an out-of-date agreement", async () => {
  const f = fixture(),
    d = await f.prepare();
  f.booking.wedding.intake.status = "submitted";
  const r = await f.actions.signWeddingDocument(
    f.booking.ref,
    d.id,
    d.hash,
    "Maya Bennett",
    true,
    { portfolio: "private" },
    initialsFor(f.booking, d.id, "Maya Bennett"),
  );
  assert(!r.ok);
  assert.match(r.error, /review/);
  assert.equal(
    w.nextActions(f.booking, f.session.email)[0].href,
    `/portal/${f.booking.ref}/agreement`,
  );
});
test("studio collection edits reach draft scope without changing previously issued versions", async () => {
  const f = fixture();
  f.session = { role: "admin", email: "i@armanarai.com" };
  f.booking.status = "draft";
  const issued = f.booking.wedding.documents.find(
      (d) => d.templateKey === "proposal",
    ),
    snapshot = JSON.stringify(issued);
  const agreement = f.booking.wedding.documents.find(
    (d) => d.templateKey === "agreement",
  );
  agreement.status = "draft";
  const input = structuredClone(
    f.load("@/lib/portal/blank").existingBookingInput(f.booking),
  );
  input.fields.photoSpec = "9 hours, one lead photographer, 700+ images";
  input.fields.coverageHours = "9";
  input.lines[0].cents = 330000;
  const r = await f
    .load("@/app/admin/actions")
    .saveBookingAction(f.booking.ref, input);
  assert(r.ok, r.error);
  const d = f.booking.wedding.documents.find((d) => d.id === agreement.id);
  assert(JSON.stringify(d.blocks).includes("700+"));
  assert(JSON.stringify(d.blocks).includes("9 hours"));
  assert.equal(
    JSON.stringify(f.booking.wedding.documents.find((d) => d.id === issued.id)),
    snapshot,
  );
});
test("image uploads validate content, enforce booking privacy and strip photo metadata", async () => {
  const { validateWeddingImage, MAX_WEDDING_IMAGE_BYTES } = pure(
    "@/lib/portal/wedding-media",
  );
  assert.throws(() =>
    validateWeddingImage(
      Buffer.from("<svg><script>alert(1)</script></svg>"),
      "image/png",
    ),
  );
  assert.throws(() =>
    validateWeddingImage(
      Buffer.alloc(MAX_WEDDING_IMAGE_BYTES + 1),
      "image/png",
    ),
  );
  const f = fixture(),
    writes = [];
  f.store.writeFile = async (...args) => writes.push(args);
  f.store.remove = async () => {};
  f.store.readFile = async () => null;
  const route = f.load("@/app/api/portal/wedding-media/route");
  assert.equal(
    (
      await route.POST(
        new Request(
          `https://example.com/api/portal/wedding-media?ref=${f.booking.ref}`,
          { method: "POST", headers: { origin: "https://evil.test" } },
        ),
      )
    ).status,
    403,
  );
  const sharp = require("sharp"),
    png = await sharp({
      create: { width: 3, height: 3, channels: 3, background: "#b8956a" },
    })
      .png()
      .toBuffer(),
    form = new FormData();
  form.append("file", new File([png], "portrait.png", { type: "image/png" }));
  form.append("kind", "portrait-1");
  const res = await route.POST(
    new Request(
      `https://example.com/api/portal/wedding-media?ref=${f.booking.ref}`,
      {
        method: "POST",
        headers: { origin: "https://example.com" },
        body: form,
      },
    ),
  );
  assert.equal(res.status, 200, await res.clone().text());
  assert.equal(writes.length, 1);
  assert.equal((await sharp(writes[0][1]).metadata()).format, "webp");
  const asset = f.booking.wedding.media[0];
  assert.equal(asset.kind, "portrait-1");
  f.session = { role: "client", email: "someone-else@example.com" };
  await assert.rejects(
    route.GET(
      new Request(
        `https://example.com/api/portal/wedding-media?ref=${f.booking.ref}&id=${asset.id}`,
      ),
    ),
    /Not found/,
  );
});
test("full pack exposes fifteen client workflows, five private records and the native system guide", () => {
  assert.equal(
    w.WEDDING_TEMPLATES.filter((t) => t.audience === "client").length,
    15,
  );
  assert.equal(
    w.WEDDING_TEMPLATES.filter((t) => t.audience !== "client").length,
    5,
  );
  const g = pure("@/lib/portal/wedding-source-guide.json");
  assert.match(g.source, /^00_/);
  assert(g.blocks.length > 20);
  assert.match(g.sourceSha256, /^[a-f0-9]{64}$/);
  assert.equal(pure("@/lib/portal/operations").OPERATION_REGISTERS.length, 10);
});
