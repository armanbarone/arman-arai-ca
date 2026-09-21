import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { runInNewContext } from 'node:vm';
import { renderToStaticMarkup } from 'react-dom/server';
import ts from 'typescript';

const realRequire = createRequire(import.meta.url);
const compiled = ts.transpileModule(readFileSync(new URL('../app/wedding-photography/DateCheck.tsx', import.meta.url), 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX },
}).outputText;

function formHarness({ ok = true, response, date = '2027-08-27' }) {
  const states = [], refs = [], leads = [], requests = [];
  let stateIndex = 0, refIndex = 0;
  const values = { weddingDate: date, name: 'Test Couple', email: 'test@example.com', location: 'Vancouver' };
  const module = { exports: {} };
  const react = {
    useState(initial) {
      const index = stateIndex++;
      if (!(index in states)) states[index] = initial;
      return [states[index], (value) => { states[index] = value; }];
    },
    useRef(initial) { const index = refIndex++; return refs[index] ??= { current: initial }; },
    useEffect() {},
  };
  runInNewContext(compiled, {
    module, exports: module.exports,
    require: (name) => name === 'react' ? react : name === '@/lib/analytics' ? { trackLead: (method) => leads.push(method) } : name === '@vercel/analytics' ? { track() {} } : realRequire(name),
    FormData: class { get(key) { return values[key] ?? ''; } },
    fetch: async (_url, options) => { requests.push(JSON.parse(options.body)); return { ok, json: async () => response }; },
  });
  const render = () => {
    stateIndex = 0; refIndex = 0;
    return module.exports.default({ city: 'Vancouver', page: '/wedding-photography/vancouver-dark', wherePlaceholder: 'Vancouver', classes: {}, instantAvailability: true });
  };
  return { render, leads, requests, submit: () => render().props.onSubmit({ preventDefault() {}, currentTarget: {} }), html: () => renderToStaticMarkup(render()) };
}

test('delivered date check shows availability and the Calendly step, and records one Lead', async () => {
  const form = formHarness({ response: { success: true, date: '2027-08-27', availability: 'available' } });
  await form.submit();
  assert.match(form.html(), /Your date is available/);
  assert.match(form.html(), /August 27, 2027/);
  assert.match(form.html(), /href="#book-a-call"/);
  assert.match(form.html(), /Book a free video call/);
  assert.deepEqual(form.leads, ['wedding_date_check']);
  assert.equal(form.requests[0].type, 'wedding-date-check');
});

test('the booked date never promises availability or asks for a call about that date', async () => {
  const form = formHarness({ date: '2027-08-28', response: { success: true, date: '2027-08-28', availability: 'unavailable' } });
  await form.submit();
  assert.match(form.html(), /already booked/);
  assert.match(form.html(), /August 28, 2027/);
  assert.match(form.html(), /Check another date/);
  assert.doesNotMatch(form.html(), /Your date is available|Book a free video call/);
});

test('provider failure or a missing availability response never fires Lead or shows success', async () => {
  for (const result of [{ ok: false, response: { error: 'Delivery failed' } }, { response: { success: true } }]) {
    const form = formHarness(result);
    await form.submit();
    assert.match(form.html(), /role="alert"/);
    assert.doesNotMatch(form.html(), /Your date is available|disabled=/);
    assert.equal(form.leads.length, 0);
  }
});

test('two submit events while a request is pending deliver and count only once', async () => {
  const form = formHarness({ response: { success: true, date: '2027-08-27', availability: 'available' } });
  await Promise.all([form.submit(), form.submit()]);
  assert.equal(form.requests.length, 1);
  assert.equal(form.leads.length, 1);
});
