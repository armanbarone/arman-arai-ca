const { test } = require('node:test');
const assert = require('node:assert/strict');
const { loader } = require('./wedding-test-loader.cjs');
const id = '11111111-2222-4333-8444-555555555555';
const requestHeaders = new Headers({ 'user-agent': 'Test browser', 'x-forwarded-for': '192.0.2.4' });
const fields = { firstName: 'Test', lastName: 'Couple', email: 'test@example.com', phone: '+1 (604) 555-0100', referral: 'Instagram', location: 'Edmonton', message: 'Private details', promise: 'I promise' };

async function configured(work) {
  const keys = ['VERCEL_ENV', 'META_WEDDING_CONVERSIONS_ACCESS_TOKEN', 'META_CONVERSIONS_ACCESS_TOKEN', 'RESEND_API_KEY', 'META_WEDDING_TEST_EMAIL_HASH', 'META_WEDDING_TEST_EVENT_CODE'];
  const previous = Object.fromEntries(keys.map(key => [key, process.env[key]]));
  try {
    process.env.VERCEL_ENV = 'production';
    process.env.META_WEDDING_CONVERSIONS_ACCESS_TOKEN = 'offline-wedding-test-only';
    delete process.env.META_CONVERSIONS_ACCESS_TOKEN;
    process.env.RESEND_API_KEY = 'offline-test-only';
    delete process.env.META_WEDDING_TEST_EMAIL_HASH;
    delete process.env.META_WEDDING_TEST_EVENT_CODE;
    return await work();
  } finally { for (const [key, value] of Object.entries(previous)) value === undefined ? delete process.env[key] : process.env[key] = value; }
}

test('encrypted confirmation receipt qualifies for the existing conversion and preserves browser/server deduplication', () => configured(() => {
  const load = loader();
  const { weddingLeadEvent } = load('@/lib/meta-conversions');
  const { createEdmontonLeadReceipt, edmontonConfirmationEvent } = load('@/lib/edmonton-lead-receipt');
  const now = Date.now();
  const original = weddingLeadEvent({ id, ...fields, page: '/wedding-photography/edmonton-simple', fbclid: 'actual-click', headers: requestHeaders, cookies: { get() {} } }, now);
  const receipt = createEdmontonLeadReceipt(original, requestHeaders);
  assert.ok(receipt && receipt.length < 3800);
  assert.doesNotMatch(Buffer.from(receipt, 'base64url').toString('utf8'), /test@example|Couple|actual-click|Private details/);
  const event = edmontonConfirmationEvent(receipt, requestHeaders, now);
  assert.equal(event.event_id, `ca-lead-${id}`);
  assert.equal(event.event_name, 'Lead');
  assert.equal(event.event_time, original.event_time);
  assert.equal(event.event_source_url, 'https://www.armanarai.ca/wedding-photography/edmonton-pricing/thank-you');
  assert.deepEqual(event.user_data, original.user_data);
  assert.deepEqual(edmontonConfirmationEvent(receipt, requestHeaders, now), event, 'reload retains the same deduplication key');
  assert.equal(edmontonConfirmationEvent(undefined, requestHeaders, now), null, 'direct visit is not a lead');
  assert.equal(edmontonConfirmationEvent(receipt.slice(0, 20) + 'broken' + receipt.slice(26), requestHeaders, now), null, 'tampering is rejected');
  assert.equal(edmontonConfirmationEvent(receipt, requestHeaders, now + 601000), null, 'expired receipt is rejected');
  for (const headers of [new Headers({ dnt: '1' }), new Headers({ 'sec-gpc': '1' }), new Headers({ 'next-router-prefetch': '1' }), new Headers({ purpose: 'prefetch' })]) {
    assert.equal(edmontonConfirmationEvent(receipt, headers, now), null);
  }
  process.env.VERCEL_ENV = 'preview';
  assert.equal(createEdmontonLeadReceipt(original, requestHeaders), null);
  assert.equal(edmontonConfirmationEvent(receipt, requestHeaders, now), null);
}));

test('only a delivered Edmonton inquiry issues a secure receipt; the actual confirmation render queues its server Lead', () => configured(async () => {
  for (const outcome of ['sent', 'failed', 'invalid', 'bot', 'legacy']) {
    const queued = [], sent = [], setCookies = [];
    let cookieValue;
    const load = loader({
      'next/server': {
        after: work => queued.push(work),
        NextResponse: { json: (data, options = {}) => ({ status: options.status ?? 200, data, cookies: { set: (...args) => setCookies.push(args) } }) },
      },
      'next/headers': { cookies: async () => ({ get: () => cookieValue ? { value: cookieValue } : undefined }), headers: async () => requestHeaders },
      '@/lib/auto-reply': { autoReplyEnabled: () => false },
      '@/lib/portal/leads': { recordLead: async () => {} },
      resend: { Resend: class { emails = { send: async () => ({ error: outcome === 'failed' ? { message: 'offline failure' } : null }) }; } },
      '../../PricingThankYou': { __esModule: true, default: () => null, pricingThankYouMetadata: () => ({}) },
    });
    const meta = load('@/lib/meta-conversions');
    meta.reportWeddingLeadEvent = async event => sent.push(event);
    const { POST } = load('@/app/api/contact/route');
    const body = { ...fields, type: 'wedding-inquiry', page: '/wedding-photography/edmonton-simple', pricingMarket: 'edmonton', trackingVersion: outcome === 'legacy' ? undefined : 'wedding-lead-v1' };
    if (outcome === 'invalid') body.email = 'invalid';
    if (outcome === 'bot') body.company = 'spam';
    const response = await POST({ json: async () => body, headers: requestHeaders, cookies: { get() {} } });
    await Promise.all(queued.splice(0).map(work => work()));
    assert.equal(sent.length, 0, 'the landing URL must not win deduplication before confirmation');
    assert.equal(setCookies.length, outcome === 'sent' ? 1 : 0, outcome);
    const page = load('@/app/wedding-photography/edmonton-pricing/thank-you/page');
    await page.default();
    assert.equal(queued.length, 0, 'an unrelated direct visit sends nothing');
    if (outcome === 'sent') {
      const [name, value, options] = setCookies[0];
      assert.equal(name, '__Secure-aa_edmonton_lead');
      assert.deepEqual(options, { httpOnly: true, secure: true, sameSite: 'lax', path: '/wedding-photography/edmonton-pricing/thank-you', maxAge: 600 });
      cookieValue = value;
      await page.default();
      await Promise.all(queued.splice(0).map(work => work()));
      assert.equal(sent.length, 1);
      assert.equal(sent[0].event_id, `ca-lead-${response.data.inquiryId}`);
      assert.match(sent[0].event_source_url, /\/edmonton-pricing\/thank-you$/);
    }
  }
}));

test('the Christmas credential alone cannot activate wedding delivery', () => configured(async () => {
  delete process.env.META_WEDDING_CONVERSIONS_ACCESS_TOKEN;
  process.env.META_CONVERSIONS_ACCESS_TOKEN = 'christmas-only-test';
  const { weddingMetaEnabled, reportWeddingLeadEvent } = loader()('@/lib/meta-conversions');
  assert.equal(weddingMetaEnabled(), false);
  const previous = global.fetch;
  try {
    global.fetch = async () => { throw Error('must not send'); };
    await reportWeddingLeadEvent({}, requestHeaders);
  } finally { global.fetch = previous; }
}));

test('a production test routes only the configured owner recipient to Meta Test Events', () => configured(async () => {
  const { createHash } = require('node:crypto');
  process.env.META_WEDDING_TEST_EMAIL_HASH = createHash('sha256').update('test@example.com').digest('hex');
  process.env.META_WEDDING_TEST_EVENT_CODE = 'TEST12345';
  const load = loader();
  const { weddingLeadEvent, reportWeddingLeadEvent } = load('@/lib/meta-conversions');
  const { createEdmontonLeadReceipt, edmontonConfirmationEvent } = load('@/lib/edmonton-lead-receipt');
  const input = { id, ...fields, page: '/wedding-photography/edmonton-simple', headers: requestHeaders, cookies: { get() {} } };
  const event = weddingLeadEvent(input);
  assert.equal(event.test_event_code, 'TEST12345');
  assert.equal(weddingLeadEvent({ ...input, email: 'real-inquiry@example.com' }).test_event_code, undefined);
  const confirmed = edmontonConfirmationEvent(createEdmontonLeadReceipt(event, requestHeaders), requestHeaders);
  const previous = global.fetch;
  const bodies = [];
  try {
    global.fetch = async (_, options) => { bodies.push(JSON.parse(options.body)); return { ok: true, json: async () => ({ events_received: 1 }) }; };
    await reportWeddingLeadEvent(confirmed, requestHeaders);
    assert.equal(bodies[0].test_event_code, 'TEST12345');
    assert.equal(bodies[0].data[0].test_event_code, undefined);
    assert.equal(bodies[0].data[0].event_id, `ca-lead-${id}`);
  } finally { global.fetch = previous; }
}));

test('Edmonton and Montréal receipts cannot be used on each other’s confirmation page', () => configured(() => {
  const load = loader();
  const edmonton = load('@/lib/edmonton-lead-receipt');
  const montreal = load('@/lib/montreal-lead-receipt');
  const event = load('@/lib/meta-conversions').weddingLeadEvent({
    id, ...fields, page: '/wedding-photography/edmonton-simple',
    headers: requestHeaders, cookies: { get() {} },
  });
  const edmontonReceipt = edmonton.createEdmontonLeadReceipt(event, requestHeaders);
  const montrealReceipt = montreal.createMontrealLeadReceipt(event, requestHeaders);
  assert.equal(montreal.montrealConfirmationEvent(edmontonReceipt, requestHeaders), null);
  assert.equal(edmonton.edmontonConfirmationEvent(montrealReceipt, requestHeaders), null);
}));
