const { loader } = require("./wedding-test-loader.cjs"),
  fs = require("node:fs"),
  path = require("node:path");
(async () => {
  const load = loader(),
    b = load("@/lib/portal/demo").sampleWedding(),
    w = load("@/lib/portal/wedding"),
    d = b.wedding.documents.find((d) => d.templateKey === "agreement");
  const { renderWeddingPdf } = load("@/lib/portal/wedding-pdf");
  d.title = "SAMPLE — Wedding agreement";
  d.hash = "a".repeat(64);
  d.status = "executed";
  d.signatures = [
    {
      party: "company",
      email: "studio@example.com",
      legalName: "Arman Arai",
      signedAt: b.createdAt,
      consent: `SAMPLE ONLY. ${w.ELECTRONIC_CONSENT}`,
      ip: "192.0.2.1",
      userAgent: "Sample browser",
      hash: d.hash,
      answers: {},
    },
    ...b.clients.map((c, i) => ({
      party: "client",
      email: c.email,
      legalName: c.legalName,
      signedAt: b.createdAt,
      consent: `SAMPLE ONLY. ${w.ELECTRONIC_CONSENT}`,
      ip: "192.0.2.1",
      userAgent: "Sample browser",
      hash: d.hash,
      answers: {
        portfolio: i ? "portfolio_no_name" : "private",
        paidAdvertising: "no",
        testimonial: "no",
        marketing: "no",
      },
    })),
  ];
  const m = load("@/lib/portal/document-sections");
  for (const s of d.signatures)
    s.initials = Object.fromEntries(
      m
        .initialSectionsFor(d)
        .map((x) => [x.id, m.initialsForName(s.legalName)]),
    );
  const blocks = d.blocks;
  if (process.argv.includes("--diagnose")) {
    for (let n = 1; n <= blocks.length; n++) {
      try {
        await renderWeddingPdf(b, { ...d, blocks: blocks.slice(0, n) });
      } catch (e) {
        console.error(
          "First failing block",
          n,
          JSON.stringify(blocks[n - 1]).slice(0, 300),
        );
        throw e;
      }
    }
  }
  const bytes = await renderWeddingPdf(b, d, true),
    out = path.resolve(__dirname, "../../sample-signed-agreement.pdf");
  fs.writeFileSync(out, bytes);
  console.log(
    JSON.stringify({ path: out, bytes: bytes.length, blocks: blocks.length }),
  );
})().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
