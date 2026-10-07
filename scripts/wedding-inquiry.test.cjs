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
