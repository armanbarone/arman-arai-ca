const test = require("node:test");
const assert = require("node:assert/strict");
const { loader } = require("./wedding-test-loader.cjs");

/* The welcome email is fixed copy that no model writes, so what it says is
   whatever the last person to edit lib/auto-reply.ts put there. These tests
   guard the promises in it that a couple could hold Arman to, and they check
   both twins: every claim has to appear in the HTML and in the plain text,
   because some inboxes only ever render the second one. */

const inquiry = {
  firstName: "Test",
  lastName: "Couple",
  email: "test@example.com",
  phone: "5145550100",
  referral: "Instagram",
  weddingDate: "2027-08-14",
  location: "Halifax, NS",
  message: "Our wedding",
  page: "wedding-photography/canada",
  receivedAt: Date.now(),
};

const doubles = { "@/lib/wedding-booking": { weddingCalendarUrl: () => "https://cal.example/arman" } };
const twins = () => {
  const { html, text } = loader(doubles)("@/lib/auto-reply").render(inquiry);
  return [html, text];
};

test("the email leads on the approach, in Arman's first person", () => {
  for (const body of twins()) {
    assert.match(body, /How I approach wedding photography/i);
    assert.match(body, /genuine and unhurried/i);
    assert.match(body, /[Cc]andid and documentary/);
    assert.match(body, /editorial portraits/i);
    assert.match(body, /living the day all over again/i);
    /* His claim, kept in substance: cinematic work, and a handful of people in
       North America shooting this way. */
    assert.match(body, /cinematic/i);
    assert.match(body, /handful of photographers in North America/);
    /* The detailed brief he sent was written from the couple's side ("we
       want"); this email is written from his. */
    assert.doesNotMatch(body, /\bwe want\b/i);
  }
});

test("travel is included and the two-day scout is promised, in both twins", () => {
  for (const body of twins()) {
    assert.match(body, /Travel is included/i);
    assert.match(body, /two days before the wedding/i);
    assert.match(body, /no out-of-town surcharge/i);
    /* Nothing may suggest a travel fee still lands later: the whole point of
       the section is the couple who are nervous about hiring out of town. */
    assert.doesNotMatch(body, /quoted separately/i);
    assert.doesNotMatch(body, /travel fee/i);
  }
});

test("the 48-hour date hold is gone and the deposit is what secures a date", () => {
  for (const body of twins()) {
    /* Not a bare /48/: the album thumbnails are 480px tall. */
    assert.doesNotMatch(body, /48[- ]hour/i);
    assert.doesNotMatch(body, /48 hours/);
    assert.doesNotMatch(body, /hold your date/i);
    assert.match(body, /50% deposit secures your date/i);
  }
});

test("prices come from lib/site.ts, and tax is all that is left of the small print", () => {
  const { TIERS } = loader(doubles)("@/lib/site");
  for (const body of twins()) {
    for (const tier of TIERS) assert.match(body, new RegExp(`C\\$${tier.price.toLocaleString("en-CA")}`));
    assert.match(body, /Prices in CAD, before tax\./);
  }
});
