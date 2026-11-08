const { test } = require('node:test');
const assert = require('node:assert/strict');
const { loader } = require('./wedding-test-loader.cjs');
const fields = { firstName: 'Test', lastName: 'Couple', email: 'test@example.com', phone: '6045550100', location: 'Toronto', weddingDate: 'Summer 2027', referral: 'Instagram', message: 'Our wedding', promise: 'I promise' };
const storage = () => { const values = new Map(); return { getItem: k => values.get(k) ?? null, setItem: (k,v) => values.set(k,v) }; };
const definitions = [
  ['@/app/(site)/contact/ContactForm', 'default'],
  ['@/components/InquiryModal', 'default'],
  ['@/app/wedding-photography/InquiryFunnel', 'InquiryForm'],
];

function harness(file, exported, { response = { success: true, autoReply: true }, ok = true, blocked = false } = {}) {
  global.window = { location: { pathname: '/contact' } };
  global.sessionStorage = blocked ? { getItem() { throw Error('blocked'); }, setItem() { throw Error('blocked'); } } : storage();
  const states = [], refs = [], requests = [], redirects = [];
  let stateIndex = 0, refIndex = 0;
  const load = loader({
    react: {
      useState(initial) { const i = stateIndex++; states[i] ??= typeof initial === 'object' && initial?.firstName === '' ? { ...fields } : initial; return [states[i], value => { states[i] = value; }]; },
      useRef(initial) { const i = refIndex++; return refs[i] ??= { current: initial }; },
      useEffect() {},
    },
    'next/navigation': { useRouter: () => ({ push: path => redirects.push(path) }) },
    './InquiryContext': { useInquiry: () => ({ isOpen: true, close() {} }) },
    '@/lib/attribution': { leadAttribution: () => ({ page: '/contact' }), ATTRIBUTION_KEYS: [] },
    './wedding-calendar': {}, './vancouver.module.css': {}, './inquiry.module.css': {},
  });
  global.FormData = class { get(key) { return fields[key] || ''; } };
  global.fetch = async (_url, options) => { requests.push(JSON.parse(options.body)); return { ok, json: async () => response }; };
  const component = load(file)[exported];
  const findForm = node => {
    if (!node || typeof node !== 'object') return null;
    if (node.type === 'form') return node;
    return [node.props?.children].flat(Infinity).map(findForm).find(Boolean);
  };
  const submit = () => {
    stateIndex = 0; refIndex = 0;
    const tree = component({ city: 'Victoria', market: 'victoria', page: '/wedding-photography/victoria-pricing' });
    return findForm(tree).props.onSubmit({ preventDefault() {}, currentTarget: {} });
  };
  return { submit, requests, redirects, completion: load('@/lib/inquiry-completion') };
}

for (const [file, exported] of definitions) {
  test(`${exported} in ${file} redirects only delivered inquiries, including with storage blocked`, async () => {
    for (const blocked of [false, true]) {
      const h = harness(file, exported, { blocked });
      await Promise.all([h.submit(), h.submit()]);
      assert.equal(h.requests.length, 1);
      const market = exported === 'InquiryForm' ? 'victoria' : 'toronto';
      assert.deepEqual(h.redirects, [`/wedding-photography/${market}-pricing/thank-you`]);
      const receipt = h.completion.readSentInquiry(market);
      assert.equal(receipt.names, 'Test Couple');
      assert.equal(receipt.date, 'Summer 2027');
      assert.equal(receipt.page, '/contact');
      assert.equal(receipt.emailed, true);
      assert.match(receipt.id, /^[a-f0-9-]{36}$/);
    }
    for (const result of [{ ok: false, response: { error: 'Delivery failed' } }, { response: { success: false } }]) {
      const h = harness(file, exported, result);
      await h.submit();
      assert.deepEqual(h.redirects, []);
      assert.equal(h.completion.readSentInquiry('toronto'), null);
    }
  });
}

test('city routing and receipt gates preserve all existing markets without touching Christmas', () => {
  global.sessionStorage = storage();
  const { inquiryMarket, readSentInquiry } = loader()('@/lib/inquiry-completion');
  for (const city of ['vancouver', 'toronto', 'montreal', 'calgary', 'victoria']) assert.equal(inquiryMarket(city, '/contact'), city);
  assert.equal(inquiryMarket('Montréal, QC', '/contact'), 'montreal');
  assert.equal(inquiryMarket('Banff', '/contact'), 'calgary');
  assert.equal(inquiryMarket('Not decided', '/wedding-photography/toronto-dark'), 'toronto');
  assert.equal(inquiryMarket('Not decided', '/contact'), 'vancouver');
  assert.equal(readSentInquiry('vancouver'), null);
  for (const sentAt of [Date.now() + 60000, Date.now() - 3 * 60 * 60 * 1000]) {
    sessionStorage.setItem('aa_ca_pricing_inquiry_v1', JSON.stringify({ names: 'Test', market: 'vancouver', sentAt }));
    assert.equal(readSentInquiry('vancouver'), null);
  }
});
