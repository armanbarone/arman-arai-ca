const test = require("node:test");
const assert = require("node:assert/strict");
const { loader } = require("./wedding-test-loader.cjs");

function harness() {
  const notifications = [], guides = [], replies = [], queued = [];
  const load = loader({
    "next/server": {
      after: (work) => queued.push(work),
      NextResponse: { json: (data, options = {}) => ({ status: options.status ?? 200, json: async () => data }) },
    },
    resend: { Resend: class { emails = { send: async (message) => { notifications.push(message); return { error: null }; } }; } },
    "@/lib/guide": {
      createGuide: async (data) => { guides.push(data); return "abcdefghijklmnopqrstuv"; },
      guidePath: (id) => `/guide/${id}`,
      guideUrl: (id) => `https://www.armanarai.ca/guide/${id}`,
    },
    "@/lib/auto-reply": {
      autoReplyEnabled: () => true,
      sendInquiryAutoReply: async (data) => replies.push(data),
    },
  });
  const { POST } = load("@/app/api/contact/route");
  return { POST, notifications, guides, replies, queued };
}

const inquiry = {
  type: "wedding-inquiry", pricingMarket: "vancouver", subjectLabel: "Wedding inquiry — Vancouver",
  name: "Sarah & James", email: "couple@example.com", weddingDate: "2027-08-14",
  location: "Cecil Green Park House", coverage: "unsure", budget: "unsure",
  guests: "50-120", setup: "same", priorities: ["candid", "family"], company: "",
};

test("names and email alone deliver an inquiry and guide without invented wedding details", async () => {
  const previous = process.env.RESEND_API_KEY;
  process.env.RESEND_API_KEY = "stub-only";
  try {
    for (const market of ["vancouver", "toronto", "montreal", "calgary", "victoria"]) {
      const h = harness();
      const response = await h.POST({ json: async () => ({
        type: "wedding-inquiry", pricingMarket: market,
        name: "  Sarah & James  ", email: "  couple@example.com  ",
      }) });
      assert.equal(response.status, 200);
      assert.equal((await response.json()).guide, "/guide/abcdefghijklmnopqrstuv");
      assert.equal(h.guides[0].names, "Sarah & James");
      assert.equal(h.guides[0].email, "couple@example.com");
      assert.equal(h.guides[0].location, "");
      assert.equal(h.guides[0].coverage, "unsure");
      assert.equal(h.guides[0].budget, "unsure");
      assert.equal(h.guides[0].weddingDate, undefined);
      assert.equal(h.guides[0].weddingSeason, undefined);
      assert.equal(h.guides[0].priorities, undefined);
      assert.equal(h.notifications.length, 1);
      assert.match(h.notifications[0].html, /Guide starting point/);
      assert.doesNotMatch(h.notifications[0].html, /undefined|dates open in/);
      assert.equal(h.queued.length, 1);
      await h.queued[0]();
      assert.equal(h.replies[0].dateStatus, undefined);
      assert.equal(h.replies[0].market.slug, market);
      assert.equal(h.replies[0].guideUrl, "https://www.armanarai.ca/guide/abcdefghijklmnopqrstuv");
    }
  } finally {
    if (previous === undefined) delete process.env.RESEND_API_KEY;
    else process.env.RESEND_API_KEY = previous;
  }
});

test("optional date, venue and message are preserved without qualification answers", async () => {
  const previous = process.env.RESEND_API_KEY;
  process.env.RESEND_API_KEY = "stub-only";
  try {
    const h = harness();
    const response = await h.POST({ json: async () => ({
      type: "wedding-inquiry", pricingMarket: "vancouver", name: inquiry.name, email: inquiry.email,
      weddingDate: inquiry.weddingDate, location: "  Cecil Green Park House  ",
      note: "We’re camera shy. Can you help us feel comfortable?",
    }) });
    assert.equal(response.status, 200);
    assert.equal(h.guides[0].weddingDate, inquiry.weddingDate);
    assert.equal(h.guides[0].location, inquiry.location);
    assert.match(h.guides[0].note, /camera shy/);
    await h.queued[0]();
    assert.equal(h.replies[0].dateStatus, "open");
    assert.equal(h.replies[0].coverage, "unsure");
  } finally {
    if (previous === undefined) delete process.env.RESEND_API_KEY;
    else process.env.RESEND_API_KEY = previous;
  }
});

test("an invalid optional date fails before creating a guide or sending mail", async () => {
  const h = harness();
  const response = await h.POST({ json: async () => ({
    type: "wedding-inquiry", pricingMarket: "vancouver", name: inquiry.name, email: inquiry.email,
    weddingDate: "2027-02-30",
  }) });
  assert.equal(response.status, 400);
  assert.equal(h.guides.length + h.notifications.length + h.queued.length, 0);
});

test("the minimal-inquiry reply presents a starting point and makes no availability claim", () => {
  const load = loader();
  const { fallbackBody, checkedBody, render } = load("@/lib/auto-reply");
  const { pricingMarket } = load("@/lib/ads/pricing-request");
  const minimal = {
    names: inquiry.name, email: inquiry.email, location: "", coverage: "unsure", budget: "unsure",
    cityName: "Vancouver", market: pricingMarket("vancouver"),
    page: "wedding-photography/vancouver-pricing", receivedAt: Date.now(),
    guideUrl: "https://www.armanarai.ca/guide/abcdefghijklmnopqrstuv",
  };
  const body = fallbackBody(minimal, "Signature");
  assert.match(body, /starting point/);
  assert.doesNotMatch(body, /available|calendar is open|dates open|right for you|first come/i);
  assert.equal(checkedBody(body), body);
  assert.equal(checkedBody(body + "\n\nMy calendar is open as of now."), null);
  const email = render(minimal, body, "signature");
  assert.match(email.html, /Open your wedding guide/);
  assert.doesNotMatch(email.html, /Coverage:<\/span>|Budget:<\/span>|undefined/);
});

test("an inquiry without mobile creates its guide, notifies the studio and queues the couple's email", async () => {
  const previous = process.env.RESEND_API_KEY;
  process.env.RESEND_API_KEY = "stub-only";
  try {
    const h = harness();
    const response = await h.POST({ json: async () => ({ ...inquiry }) });
    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), { success: true, autoReply: true, guide: "/guide/abcdefghijklmnopqrstuv" });
    assert.equal(h.notifications.length, 1);
    assert.equal(h.notifications[0].replyTo, inquiry.email);
    assert.doesNotMatch(h.notifications[0].html, /Mobile|mobile number/);
    assert.equal(h.guides.length, 1);
    assert.equal(h.guides[0].coverage, "unsure");
    assert.equal(h.guides[0].budget, "unsure");
    assert.equal(h.queued.length, 1);
    await h.queued[0]();
    assert.equal(h.replies[0].guideUrl, "https://www.armanarai.ca/guide/abcdefghijklmnopqrstuv");
    assert.deepEqual(h.replies[0].priorities, ["candid", "family"]);
  } finally {
    if (previous === undefined) delete process.env.RESEND_API_KEY;
    else process.env.RESEND_API_KEY = previous;
  }
});

test("an older open form's mobile is ignored without blocking delivery", async () => {
  const previous = process.env.RESEND_API_KEY;
  process.env.RESEND_API_KEY = "stub-only";
  try {
    const h = harness();
    const response = await h.POST({ json: async () => ({ ...inquiry, phone: "obsolete-field" }) });
    assert.equal(response.status, 200);
    assert.doesNotMatch(h.notifications[0].html, /obsolete-field|Mobile/);
    assert.equal(Object.hasOwn(h.guides[0], "phone"), false);
    await h.queued[0]();
    assert.equal(Object.hasOwn(h.replies[0], "phone"), false);
  } finally {
    if (previous === undefined) delete process.env.RESEND_API_KEY;
    else process.env.RESEND_API_KEY = previous;
  }
});

test("invalid email still fails before guide creation or email delivery", async () => {
  const h = harness();
  const response = await h.POST({ json: async () => ({ ...inquiry, email: "invalid" }) });
  assert.equal(response.status, 400);
  assert.match((await response.json()).error, /valid email/);
  assert.equal(h.guides.length + h.notifications.length + h.queued.length, 0);
});

test("the existing date-check form still reports availability and delivers its notification", async () => {
  const previous = process.env.RESEND_API_KEY;
  process.env.RESEND_API_KEY = "stub-only";
  try {
    const h = harness();
    const response = await h.POST({ json: async () => ({
      type: "wedding-date-check", name: "Test Couple", email: "couple@example.com",
      location: "Vancouver", weddingDate: "2027-08-14",
    }) });
    assert.equal(response.status, 200);
    assert.equal((await response.json()).availability, "available");
    assert.equal(h.notifications.length, 1);
    assert.equal(h.guides.length + h.queued.length, 0);
  } finally {
    if (previous === undefined) delete process.env.RESEND_API_KEY;
    else process.env.RESEND_API_KEY = previous;
  }
});

test("other contact forms retain their phone number in the studio notification", async () => {
  const previous = process.env.RESEND_API_KEY;
  process.env.RESEND_API_KEY = "stub-only";
  try {
    const h = harness();
    const response = await h.POST({ json: async () => ({
      type: "quick", name: "Test Couple", email: "couple@example.com", phone: "6045550101",
    }) });
    assert.equal(response.status, 200);
    assert.match(h.notifications[0].html, /6045550101/);
    assert.equal(h.guides.length + h.queued.length, 0);
  } finally {
    if (previous === undefined) delete process.env.RESEND_API_KEY;
    else process.env.RESEND_API_KEY = previous;
  }
});
