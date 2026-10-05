const { loader } = require("./wedding-test-loader.cjs"),
  fs = require("node:fs"),
  path = require("node:path");
(async () => {
  const load = loader(),
    w = load("@/lib/portal/wedding"),
    details = load("@/lib/portal/contract-details"),
    m = load("@/lib/portal/document-sections"),
    money = load("@/lib/portal/money"),
    b = load("@/lib/portal/demo").sampleWedding();
  const v = details.initialContractDetails(b);
  v.collectionKey = "photo-film";
  v.eventVenue = "Sample Lakeside House, 10 Example Lake Road, Victoria";
  v.ceremonyLocation = "Sample Lake Gardens, 20 Example Lake Road, Victoria";
  v.receptionLocation =
    "Sample Lakeside Ballroom, 10 Example Lake Road, Victoria";
  details.applyContractDetails(b, v);
  b.packageKey = v.collectionKey;
  b.packageName = "Photo + Film";
  b.lines[0].cents = 590000;
  b.lines[0].label = "Photo + Film — 12 continuous hours";
  Object.assign(
    b.fields,
    details.collectionBookingFields(
      details.collectionFor(v.collectionKey),
      v.date,
    ),
  );
  b.totals = money.computeTotals(b.lines, b.taxes);
  b.schedule = money.buildSchedule(b, "2026-10-03");
  b.wedding.intake = { ...b.wedding.intake, values: v, status: "approved" };
  const t = w.templateFor("agreement", b),
    d = b.wedding.documents.find((d) => d.templateKey === "agreement");
  d.fields = {
    ...d.fields,
    ...w.defaultDocumentFields(t, b),
    "t3.0.1": "Wedding",
    "t3.9.1": "12:00 pm–12:00 am, America/Vancouver",
    "t4.3.2":
      "12 continuous hours, one lead photographer, 850+ edited images, high resolution with print permission. Sample studio customization.",
    "t4.11.3":
      "Sample quote: album proof by September 11, 2027; production within 6 weeks of approval. Instant prints on the wedding night.",
    "t4.1.3": "Sample planning calls: May 1 and June 5, 2027",
    "t4.2.3": "Sample engagement session: May 8, 2027",
    "t4.12.3":
      "Instant prints June 19, 2027; processed film scans July 10, 2027",
  };
  if (w.missingDocumentFields(t, d.fields).length)
    throw new Error("Sample fields are incomplete");
  d.blocks = w.resolveBlocks(t, d.fields);
  d.initialSections = m
    .documentSections(d.blocks)
    .map(({ id, title }) => ({ id, title }));
  d.status = "executed";
  d.hash = "sample-qa-hash";
  d.signatures = [
    { party: "company", email: "studio@example.com", legalName: "Arman Arai" },
    ...b.clients.map((c) => ({
      party: "client",
      email: c.email,
      legalName: c.legalName,
    })),
  ].map((s) => ({
    ...s,
    signedAt: "2026-10-04T18:00:00Z",
    consent: "SAMPLE ONLY. " + w.ELECTRONIC_CONSENT,
    hash: d.hash,
    ip: "",
    userAgent: "Sample browser",
    answers: { portfolio: "private" },
    initials: Object.fromEntries(
      m
        .initialSectionsFor(d)
        .map((x) => [x.id, m.initialsForName(s.legalName)]),
    ),
  }));
  process.env.PORTAL_DEMO = "1";
  process.env.VERCEL_ENV = "preview";
  const route = load("@/app/portal/preview/pdf/route");
  const response = await route.POST(
    new Request("http://localhost:3100/portal/preview/pdf", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ document: d }),
    }),
  );
  if (response.status !== 200) throw new Error(await response.text());
  const out = path.resolve(
    __dirname,
    "../../sample-edited-signed-agreement.pdf",
  );
  fs.writeFileSync(out, Buffer.from(await response.arrayBuffer()));
  fs.writeFileSync(
    path.resolve(__dirname, "../../sample-edited-agreement-input.json"),
    JSON.stringify({ document: d }),
  );
  console.log(
    JSON.stringify({
      path: out,
      status: response.status,
      sections: d.initialSections.length,
    }),
  );
})().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
