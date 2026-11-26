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

test("the email leads on the approach, in the owner's own words", () => {
  for (const body of twins()) {
    assert.match(body, /How I approach wedding photography/i);
    assert.match(body, /How I portray couples as lovers/i);
    /* His rewrite of 2026-11-25, pasted whole. */
    assert.match(body, /My philosophy in photography is simple/i);
    assert.match(body, /the same slop that can be repeated by anyone/i);
    assert.match(body, /your cousin with a smartphone/i);
    assert.match(body, /spiritual quest rather than an event photography/i);
    assert.match(body, /candid documentary storytelling and romantic, editorial artistry/i);
    assert.match(body, /colour, contrast and a film look/i);
    /* And the two spellings that were corrected on the way in stay corrected. */
    assert.doesNotMatch(body, /essense/i);
    assert.doesNotMatch(body, /\bcliche\b/i);
    /* What the rewrite replaced. None of it is to come back. */
    assert.doesNotMatch(body, /Showcase the love between you two/i);
    assert.doesNotMatch(body, /genuine and unhurried/i);
    assert.doesNotMatch(body, /go far beyond what we agree in the contract/i);
    assert.doesNotMatch(body, /living the day all over again/i);
    assert.doesNotMatch(body, /handful of photographers in North America/i);
    /* The detailed brief he sent was written from the couple's side ("we
       want"); this email is written from his. */
    assert.doesNotMatch(body, /\bwe want\b/i);
  }
});

test("the plain-text twin leaves a blank line between paragraphs", () => {
  const [, text] = twins();
  /* Owner, 2026-11-25: "make sure to put space in between sentences/
     paragraphs". The approach paragraphs used to be joined by one newline,
     which in a mail client reads as one block. */
  assert.match(text, /looking pretty[^]*?\n\n[^]*?How is my work so different/);
  assert.match(text, /editorial artistry\.\n\nIn essence/);
});

test("the opening is his, and the date is never invented", () => {
  for (const body of twins()) {
    assert.match(body, /Congratulations, and thank you for the interest in my photography service/);
    assert.match(body, /I have your inquiry and I will personally reply within an hour/);
    assert.match(body, /an overview of how I work, so please take 2 minutes/);
    assert.match(body, /see the album samples/);
    /* He cut the date out of the opening on 2026-11-25. It must not creep
       back into the greeting, with or without a date to print. */
    assert.doesNotMatch(body, /inquiry about your wedding/i);
    assert.doesNotMatch(body, /an overview of my services/i);
  }
  /* And a couple who gave no date still gets the same two sentences, with no
     gap, no "to be decided" and nothing invented. */
  const undated = loader(doubles)("@/lib/auto-reply").render({ ...inquiry, weddingDate: "" });
  for (const body of [undated.html, undated.text]) {
    assert.match(body, /I have your inquiry and I will personally reply within an hour/);
  }
});

test("the albums are samples of what he may publish, not every frame", () => {
  for (const body of twins()) {
    /* His headline, 2026-11-25. */
    assert.match(body, /Samples of my work as much as I am allowed to share/i);
    assert.doesNotMatch(body, /Three complete weddings/i);
    /* The opposite claim, which ran until 2026-11-18, and was never true of a
       published gallery. */
    assert.doesNotMatch(body, /Not a highlight reel/i);
    assert.doesNotMatch(body, /every frame I delivered/i);
  }
});

test("there is no WhatsApp button, in either twin", () => {
  /* Owner, 2026-11-25: "nobody msgs me on whatsapp btw so take out that
     button". The phone number stays in the footer; the panel and its link
     are gone and are not to come back. */
  for (const body of twins()) {
    assert.doesNotMatch(body, /whatsapp/i);
    assert.doesNotMatch(body, /wa\.me/i);
    assert.doesNotMatch(body, /rather not wait for my email/i);
  }
});

test("the email offers no custom collection builder, because there is no page", () => {
  /* It was offered for one day, 2026-11-18 to 2026-11-19, then the owner
     deleted the page outright with no redirect. A link to it from here would
     be a 404 in every couple's inbox. */
  for (const body of twins()) {
    assert.doesNotMatch(body, /build-your-collection/);
    assert.doesNotMatch(body, /build your own/i);
    assert.doesNotMatch(body, />Build it</);
    /* And the line he cut before that one has not crept back either. */
    assert.doesNotMatch(body, /Three collections, and only three/);
  }
});

test("every link in the email points at a page that still exists", () => {
  const [html] = twins();
  const own = [...html.matchAll(/href="(https:\/\/www\.armanarai\.ca[^"]*)"/g)].map((m) => m[1]);
  const live = ["/wedding-guide", "/preferred-vendors", "/galleries/", "https://www.armanarai.ca\""];
  for (const href of own) {
    const path = href.replace("https://www.armanarai.ca", "") || "/";
    assert.ok(
      path === "/" || live.some((ok) => path.startsWith(ok)),
      `${path} is linked from the welcome email and is not a known page`,
    );
  }
});

test("travel is a headline and nothing under it, in both twins", () => {
  for (const body of twins()) {
    assert.match(body, /Travel is included/i);
    /* The owner cut the two paragraphs on 2026-11-24 ("the travel part only
       needs a headline not a gigantic explanation") and the scouting trip out
       of the headline on 2026-11-25 ("take out 'I arrive two days early'").
       Both facts live in the travel section of the wedding guide, which this
       email links to, and the guide's own test holds them there. */
    assert.doesNotMatch(body, /two days early/i);
    /* The scouting trip itself is still in "What happens next", which is a
       different segment and is the one he did not touch. */
    assert.match(body, /at your venue two days before the wedding/i);
    assert.doesNotMatch(body, /no out-of-town surcharge/i);
    assert.doesNotMatch(body, /mileage line/i);
    assert.doesNotMatch(body, /the travel risk is mine/i);
    /* Nothing may suggest a travel fee still lands later: the whole point of
       the line is the couple who are nervous about hiring out of town. */
    assert.doesNotMatch(body, /quoted separately/i);
    assert.doesNotMatch(body, /travel fee/i);
  }
});

test("no date hold, and no payment terms at all", () => {
  for (const body of twins()) {
    /* Not a bare /48/: the album thumbnails are 480px tall. */
    assert.doesNotMatch(body, /48[- ]hour/i);
    assert.doesNotMatch(body, /hold your date/i);
    /* The owner took the payment schedule out of this email on 2026-11-23.
       It is still the real schedule, stated on /pricing, in the wedding guide
       and in the contract; it is simply not said here. */
    assert.doesNotMatch(body, /Payment is in three parts/i);
    assert.doesNotMatch(body, /35% due 60 days/);
    assert.doesNotMatch(body, /deposit secures your date/i);
    assert.doesNotMatch(body, /non-refundable/i);
  }
});

test("all three collections are priced, and Photo + Film is the most booked", () => {
  const { TIERS } = loader(doubles)("@/lib/site");
  for (const body of twins()) {
    /* Signature came out on 2026-11-23 and went back in on 2026-11-25
       ("put back the signature 3000 dollar into packages"), so the email
       prices every collection the site sells. */
    for (const tier of TIERS) {
      assert.match(body, new RegExp(`C\\$${tier.price.toLocaleString("en-CA")}`), `${tier.name} is not priced`);
      assert.ok(body.includes(tier.name), `${tier.name} is missing`);
    }
  }
  /* And the pill sits on Photo + Film, not on either cheaper card. */
  const [html] = twins();
  const pill = html.indexOf("Most booked");
  assert.ok(pill > 0, "no most-booked pill");
  assert.ok(
    html.lastIndexOf("Photo + Film", pill) > html.lastIndexOf("Legacy", pill),
    "the most-booked pill is not on Photo + Film",
  );
  assert.ok(
    html.lastIndexOf("Photo + Film", pill) > html.lastIndexOf("Signature", pill),
    "the most-booked pill is not on Photo + Film",
  );
  assert.equal(html.split("Most booked").length - 1, 1, "more than one most-booked pill");
});

test("the comparison table has moved to the wedding guide", () => {
  for (const body of twins()) {
    assert.doesNotMatch(body, /The same money, a different list/i);
    assert.doesNotMatch(body, /Typical at this price/i);
  }
  /* And it is actually there, priced from the entry collection. */
  const { marketComparisonHtml } = loader(doubles)("@/lib/market-comparison");
  const { ENTRY } = loader(doubles)("@/lib/site");
  const guide = marketComparisonHtml();
  assert.match(guide, /The same money, a different list/);
  assert.match(guide, new RegExp(`C\\$${ENTRY.price.toLocaleString("en-CA")}`));
  assert.match(guide, /Typical at this price/);
});

test("the preferred vendor list is not sold in this email", () => {
  for (const body of twins()) {
    assert.doesNotMatch(body, /preferred-vendors/);
    assert.doesNotMatch(body, /vendor list/i);
    assert.doesNotMatch(body, /florists/i);
  }
});

test("section three is his heading and the button, with nothing in between", () => {
  const [html, text] = twins();
  /* The apostrophe is escaped in the HTML twin and bare in the text one. */
  const HEADING = /Let(?:'|&#39;)s hop on a call and talk face to face/i;
  for (const body of [html, text]) {
    assert.match(body, HEADING);
    assert.doesNotMatch(body, /Securing your date/i);
    assert.doesNotMatch(body, /7:30 PM/);
    assert.doesNotMatch(body, /one wedding at a time/i);
  }
  const three = html.slice(html.indexOf(">Three</td>"));
  const heading = three.search(HEADING);
  const button = three.indexOf("Book your free 30-minute call");
  assert.ok(button > heading, "the call button must follow the heading");
  assert.doesNotMatch(three.slice(heading, button), /<p[^>]*>[A-Za-z]/, "copy crept back under the heading");
});


test("the email paints its own background, so a dark inbox cannot supply one", () => {
  const [html] = twins();
  /* The owner's report on 2026-11-17 was "it's just text against a blackish
     background": the email set no background, so the client chose it. These
     four together are the fix, and none of them works alone. */
  assert.match(html, /^<!doctype html>/i);
  assert.match(html, /<meta name="color-scheme" content="light only">/);
  assert.match(html, /<meta name="supported-color-schemes" content="light only">/);
  assert.match(html, /<body style="margin:0;padding:0;background:#[0-9A-F]{6};">/i);
  /* Every coloured cell needs the attribute as well as the CSS, because
     Outlook ignores one and some webmail strips the other. */
  for (const match of html.match(/<t[dr][^>]*style="[^"]*background:#[0-9A-F]{6}/gi) ?? []) {
    assert.match(match, /bgcolor="#[0-9A-F]{6}"/i, `missing bgcolor: ${match.slice(0, 90)}`);
  }
});

test("the layout is one 600px column that collapses on a phone", () => {
  const [html] = twins();
  assert.match(html, /class="card"[^>]*width="600"/);
  assert.match(html, /@media screen and \(max-width:620px\)/);
  assert.match(html, /\.card \{ width:100% !important/);
  assert.match(html, /\.stack \{ display:block !important/);
  /* No fixed pixel width may survive the collapse except the card itself and
     the single full-bleed photograph, which is capped by max-width. */
  const widths = [...html.matchAll(/width="(\d+)"/g)].map((m) => Number(m[1])).filter((w) => w > 180);
  assert.deepEqual(widths, [600, 600]);
});

test("section numbers cannot break across two lines on a phone", () => {
  const [html] = twins();
  /* The owner read "Three" as "Th / ree" on mobile. Two causes, both fixed
     here: the number cell carried a 34px width hint, which is narrower than
     THREE at 12px with .2em tracking, and the mobile styles broke words in
     every cell in the email. */
  for (const number of ["One", "Two", "Three"]) {
    const cell = html.match(new RegExp(`<td[^>]*>${number}</td>`));
    assert.ok(cell, `no cell for ${number}`);
    assert.match(cell[0], /white-space:nowrap/);
    assert.match(cell[0], /width:64px/);
  }
  /* word-break belongs to the three-column comparison and nowhere else. */
  const mobile = html.slice(html.indexOf("@media screen"), html.indexOf("</style>"));
  for (const line of mobile.split("\n").filter((l) => l.includes("word-break"))) {
    assert.match(line, /^\s*\.cmp td \{/, `word-break outside .cmp: ${line.trim()}`);
  }
});

test("one photograph at the top, and sections divided by rules rather than images", () => {
  const [html] = twins();
  /* The owner removed a second full-bleed frame on 2026-11-17: sections are
     separated typographically here, never by dropping in another photograph.
     The only images left are the hero and the three clickable album frames. */
  const images = [...html.matchAll(/<img[^>]*src="([^"]+)"/g)].map((m) => m[1]);
  assert.equal(images.length, 4, images.join(", "));
  assert.equal(images.filter((src) => src.includes("/galleries/")).length, 3);
  assert.match(images.find((src) => !src.includes("/galleries/")), /vancouver-island-04/);
  assert.doesNotMatch(html, /motion-blur/);
  /* The divider that replaced it. */
  assert.match(html, /&#10022;/);
});

test("every numbered section is pushed clear of the one above it", () => {
  const [html] = twins();
  /* The owner read TWO and THREE as "literally touching the rest of the
     body". Margins are not enough: enough clients drop them that the space
     has to be a cell with a real height. */
  assert.doesNotMatch(html, />Four</, "there is no fourth section any more");
  for (const number of ["One", "Two", "Three"]) {
    const before = html.slice(0, html.indexOf(`>${number}</td>`));
    assert.match(before.slice(-420), /height="40"[^>]*style="height:40px/, `no spacer above ${number}`);
  }
});
