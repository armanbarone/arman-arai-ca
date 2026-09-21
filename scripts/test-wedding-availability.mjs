import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { runInNewContext } from 'node:vm';
import ts from 'typescript';
import { checkWeddingDate, weddingToday } from '../lib/wedding-availability.ts';

const now = new Date('2026-09-20T23:00:00Z');
test('known wedding commitment is blocked while other valid future dates remain open', () => {
  assert.deepEqual(checkWeddingDate('2027-08-28', now), { date: '2027-08-28', availability: 'unavailable' });
  for (const date of ['2027-08-27', '2027-08-29', '2028-02-29']) {
    assert.deepEqual(checkWeddingDate(date, now), { date, availability: 'available' });
  }
});
test('invalid, rolled-over and past dates never return availability', () => {
  for (const date of ['', null, 20270828, '2027-02-29', '2027-04-31', '2027-13-01', '2026-09-19', '2027-8-28']) {
    assert.ok('error' in checkWeddingDate(date, now));
  }
  assert.equal(weddingToday(new Date('2026-09-21T01:00:00Z')), '2026-09-20');
});

const realRequire = createRequire(import.meta.url);
function contact({ configured = true, delivered = true, resend = false, resendDelivered = true } = {}) {
  const sent = [];
  const emails = [];
  const module = { exports: {} };
  const compiled = ts.transpileModule(readFileSync(new URL('../app/api/contact/route.ts', import.meta.url), 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  runInNewContext(compiled, {
    exports: module.exports, module,
    require: (name) => {
      if (name === '@/lib/wedding-availability') return { checkWeddingDate: (date) => checkWeddingDate(date, now) };
      if (name === 'resend') return { Resend: class {
        emails = { send: async (message) => { emails.push(message); return { error: resendDelivered ? null : { message: 'Provider rejected request' } }; } };
      } };
      return realRequire(name);
    },
    process: { env: { ...(configured ? { GHL_WEBHOOK_URL: 'https://example.test/inquiries' } : {}), ...(resend ? { RESEND_API_KEY: 'test-only-key' } : {}) } },
    fetch: async (_url, options) => { sent.push(JSON.parse(options.body)); return { ok: delivered }; },
    console: { warn() {}, error() {} },
  });
  return { submit: (body) => module.exports.POST({ json: async () => body }), sent, emails };
}
const valid = { type: 'wedding-date-check', name: 'Test Couple', email: 'test@example.com', location: 'Vancouver', weddingDate: '2027-08-27' };

test('successful delivery returns the submitted date and its server-checked availability', async () => {
  const { submit, sent } = contact();
  const response = await submit(valid);
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { success: true, date: '2027-08-27', availability: 'available' });
  assert.equal(sent[0].dateAvailability, 'available');
  const booked = await submit({ ...valid, weddingDate: '2027-08-28' });
  assert.equal((await booked.json()).availability, 'unavailable');
  assert.equal(sent[1].dateAvailability, 'unavailable');
});

test('bad input cannot send a lead or return an available result', async () => {
  for (const patch of [{ weddingDate: '2027-02-30' }, { name: ' ' }, { email: 'bad' }, { location: '' }]) {
    const { submit, sent } = contact();
    assert.equal((await submit({ ...valid, ...patch })).status, 400);
    assert.equal(sent.length, 0);
  }
});

test('delivery failure and missing providers cannot report success', async () => {
  for (const options of [{ delivered: false }, { configured: false }]) {
    const { submit } = contact(options);
    const response = await submit(valid);
    assert.equal(response.status, 503);
    const result = await response.json();
    assert.equal(result.success, undefined);
    assert.equal(result.availability, undefined);
  }
});

test('honeypot submissions never deliver a lead or disclose an availability result', async () => {
  const { submit, sent } = contact();
  const response = await submit({ ...valid, company: 'bot' });
  assert.equal(response.status, 200);
  assert.equal((await response.json()).availability, undefined);
  assert.equal(sent.length, 0);
});

test('existing contact forms retain their successful response shape', async () => {
  const { submit } = contact();
  const response = await submit({ ...valid, type: 'founding' });
  assert.deepEqual(await response.json(), { success: true });
});

test('Resend is primary and sends the city, date, availability and attribution to Arman', async () => {
  for (const [city, slug] of [['Toronto', 'toronto'], ['Montréal', 'montreal'], ['Banff', 'banff'], ['Victoria', 'victoria'], ['Whistler', 'whistler'], ['Jasper', 'jasper'], ['Tofino', 'tofino']]) {
    const { submit, sent, emails } = contact({ resend: true });
    const response = await submit({ ...valid, subjectLabel: `Date check — ${city}`, location: city, page: `/wedding-photography/${slug}`, utm_source: 'meta' });
    assert.equal(response.status, 200);
    assert.equal((await response.json()).availability, 'available');
    assert.equal(sent.length, 0, 'Resend success must not also post a duplicate inquiry to the fallback');
    assert.equal(emails.length, 1);
    assert.equal(emails[0].from, 'Arman Arai <i@armanarai.ca>');
    assert.deepEqual([...emails[0].to], ['i@armanarai.com']);
    assert.equal(emails[0].replyTo, 'test@example.com');
    assert.equal(emails[0].subject, `Date check — ${city} — Test Couple`);
    assert.match(emails[0].html, /2027-08-27/);
    assert.match(emails[0].html, /available/);
    assert.ok(emails[0].html.includes(`/wedding-photography/${slug}`));
    assert.match(emails[0].html, /meta/);
  }
});

test('Resend failure with no configured fallback cannot confirm an inquiry', async () => {
  const { submit } = contact({ configured: false, resend: true, resendDelivered: false });
  const response = await submit(valid);
  assert.equal(response.status, 503);
  assert.equal((await response.json()).success, undefined);
});

test('Resend email escapes submitted text and clearly reports the booked date', async () => {
  const { submit, emails } = contact({ configured: false, resend: true });
  const response = await submit({ ...valid, name: '<script>test</script>', weddingDate: '2027-08-28' });
  assert.equal((await response.json()).availability, 'unavailable');
  assert.match(emails[0].html, /unavailable/);
  assert.match(emails[0].html, /2027-08-28/);
  assert.match(emails[0].html, /&lt;script&gt;/);
  assert.doesNotMatch(emails[0].html, /<script>/);
});
