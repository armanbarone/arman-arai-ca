const { test } = require('node:test');
const assert = require('node:assert/strict');
const { createHash } = require('node:crypto');
const { loader } = require('./wedding-test-loader.cjs');
const hash = value => createHash('sha256').update(value).digest('hex');
const now = 1794268800000;
const id = '11111111-2222-4333-8444-555555555555';
const fields = { firstName: 'Test', lastName: 'Couple', email: 'test@example.com', phone: '+1 (604) 555-0100', referral: 'Instagram', location: 'Toronto', message: 'Private wedding details', promise: 'I promise' };
const input = (overrides = {}) => ({
  id, email: ' TEST@Example.com ', phone: fields.phone, page: '/contact',
  headers: new Headers({ 'x-forwarded-for': '192.0.2.4, 198.51.100.4', 'user-agent': 'Test browser' }),
  cookies: { get: key => ({ _fbp: { value: `fb.1.${now}.123456` }, _fbc: { value: `fb.1.${now}.real-ad-click` } })[key] },
  ...overrides,
});

test('server event hashes matching details, keeps real ad identifiers, and omits inquiry content', () => {
  const { weddingLeadEvent } = loader()('@/lib/meta-conversions');
  const event = weddingLeadEvent(input(), now);
  assert.equal(event.event_name, 'Lead');
  assert.equal(event.event_id, `ca-lead-${id}`);
  assert.equal(event.event_time, now / 1000);
  assert.equal(event.action_source, 'website');
  assert.equal(event.event_source_url, 'https://www.armanarai.ca/contact');
  assert.deepEqual(event.user_data.em, [hash('test@example.com')]);
  assert.deepEqual(event.user_data.ph, [hash('16045550100')]);
  assert.equal(event.user_data.client_ip_address, '192.0.2.4');
  assert.equal(event.user_data.fbc, `fb.1.${now}.real-ad-click`);
  assert.equal(event.user_data.fbp, `fb.1.${now}.123456`);
  assert.doesNotMatch(JSON.stringify(event), /TEST@|test@example|604.555|Private wedding|Couple/);
});

test('every public form page can report, private and arbitrary URLs cannot leak into Meta', () => {
  const { weddingLeadEvent } = loader()('@/lib/meta-conversions');
  for (const city of ['vancouver', 'toronto', 'montreal', 'calgary', 'victoria']) {
    const page = `/wedding-photography/${city}-pricing`;
    assert.equal(weddingLeadEvent(input({ page }), now).event_source_url, `https://www.armanarai.ca${page}`);
  }
  for (const page of ['/contact?email=private@example.com', '/portal/client', '/guide/private', '/christmas/confirmation', '//other.example/secret', 'https://other.example/secret', '/contact#private']) {
    assert.equal(weddingLeadEvent(input({ page }), now).event_source_url, 'https://www.armanarai.ca/contact');
  }
});

test('missing cookies still use a real captured click, and never invent attribution', () => {
  const { weddingLeadEvent } = loader()('@/lib/meta-conversions');
  const cookies = { get() {} };
  const matched = weddingLeadEvent(input({ cookies, fbclid: 'real-click' }), now);
  assert.equal(matched.user_data.fbc, `fb.1.${now}.real-click`);
  assert.equal(matched.user_data.fbp, undefined);
  const unknown = weddingLeadEvent(input({ cookies, fbclid: '<invalid>', phone: '1234567', headers: new Headers({ 'x-forwarded-for': 'invalid' }) }), now);
  assert.equal(unknown.user_data.fbc, undefined);
  assert.equal(unknown.user_data.fbp, undefined);
  assert.equal(unknown.user_data.ph, undefined);
  assert.equal(unknown.user_data.client_ip_address, undefined);
});

test('server delivery is production-only and one retry keeps the exact same ID and payload', async () => {
  const before = { token: process.env.META_CONVERSIONS_ACCESS_TOKEN, env: process.env.VERCEL_ENV, fetch: global.fetch };
  const calls = [];
  try {
    const { reportWeddingLead } = loader()('@/lib/meta-conversions');
    global.fetch = async (url, options) => {
      calls.push({ url, ...options });
      return calls.length === 1 ? { ok: false, status: 503, json: async () => ({}) } : { ok: true, status: 200, json: async () => ({ events_received: 1 }) };
    };
    process.env.META_CONVERSIONS_ACCESS_TOKEN = 'stub-only';
    process.env.VERCEL_ENV = 'preview';
    await reportWeddingLead(input());
    assert.equal(calls.length, 0);
    process.env.VERCEL_ENV = 'production';
    delete process.env.META_CONVERSIONS_ACCESS_TOKEN;
    await reportWeddingLead(input());
    assert.equal(calls.length, 0);
    process.env.META_CONVERSIONS_ACCESS_TOKEN = 'stub-only';
    await reportWeddingLead(input());
    assert.equal(calls.length, 2);
    assert.equal(calls[0].body, calls[1].body);
    assert.equal(calls[0].url, 'https://graph.facebook.com/v26.0/1110472461323039/events');
    assert.doesNotMatch(calls[0].url, /stub-only/);
    assert.equal(JSON.parse(calls[0].body).data[0].event_id, `ca-lead-${id}`);
  } finally {
    global.fetch = before.fetch;
    for (const [key, value] of [['META_CONVERSIONS_ACCESS_TOKEN', before.token], ['VERCEL_ENV', before.env]]) {
      if (value === undefined) delete process.env[key]; else process.env[key] = value;
    }
  }
});

test('only delivered inquiries queue a server Lead, and share the ID returned to every form', async () => {
  const before = process.env.RESEND_API_KEY;
  try {
    for (const type of ['full', 'quick', 'wedding-inquiry']) {
      for (const outcome of ['sent', 'failed', 'invalid', 'bot', 'legacy']) {
        const queued = [], leads = [];
        process.env.RESEND_API_KEY = 'stub-only';
        const { POST } = loader({
          'next/server': { after: work => queued.push(work), NextResponse: { json: (data, options = {}) => ({ status: options.status ?? 200, data }) } },
          '@/lib/auto-reply': { autoReplyEnabled: () => false },
          '@/lib/portal/leads': { recordLead: async () => {} },
          '@/lib/meta-conversions': { reportWeddingLead: async data => leads.push(data) },
          resend: { Resend: class { emails = { send: async () => ({ error: outcome === 'failed' ? { message: 'stub failure' } : null }) }; } },
        })('@/app/api/contact/route');
        const body = { ...fields, type, page: '/contact', pricingMarket: 'toronto', trackingVersion: outcome === 'legacy' ? undefined : 'wedding-lead-v1' };
        if (outcome === 'invalid') body.email = 'invalid';
        if (outcome === 'bot') body.company = 'spam';
        const request = { json: async () => body, headers: new Headers(), cookies: { get() {} } };
        const response = await POST(request);
        await Promise.all(queued.map(work => work()));
        assert.equal(leads.length, outcome === 'sent' ? 1 : 0, `${type}: ${outcome}`);
        if (outcome === 'sent') {
          assert.equal(response.status, 200);
          assert.equal(leads[0].id, response.data.inquiryId);
          assert.match(response.data.inquiryId, /^[a-f0-9-]{36}$/);
        }
      }
    }
  } finally {
    if (before === undefined) delete process.env.RESEND_API_KEY; else process.env.RESEND_API_KEY = before;
  }
});
