// Offline tests: all Stripe, storage and email calls are explicit in-memory doubles.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { loader } = require('./wedding-test-loader.cjs');
process.env.VERCEL_ENV = 'production';
process.env.STRIPE_SECRET_KEY = 'rk_live_offline_fixture_not_a_credential';
function harness() {
  const rows = [{ id: '2026-12-05_1100', date: '2026-12-05', time: '11:00', santa: true, published: true }];
  let version = 0, created, emails = 0;
  const cfg = { enabled: true, studioAddress: 'Studio', postalCode: 'V7N 1J2', arrivalNotes: 'Street parking', cancellationPolicy: '48 hours full refund; one free reschedule', publishableKey: '' };
  const store = {
    read: async id => { const data = rows.find(s => s.id === id); return data ? { data: structuredClone(data), etag: String(version) } : null; },
    write: async (id, data, etag) => { assert.equal(etag, String(version)); rows[rows.findIndex(s => s.id === id)] = structuredClone(data); version++; }, conflict: () => false,
  };
  const stripe = { checkout: { sessions: {
    create: async input => { created = input; return { id: 'cs_offline_fixture', url: 'https://checkout.stripe.com/c/pay/offline-fixture' }; },
    retrieve: async () => { throw Error('Unexpected external lookup'); },
  } }, invoices: { retrieve: async () => ({ hosted_invoice_url: 'https://invoice.stripe.com/offline-fixture' }) } };
  const load = loader({
    '@/lib/portal/stripe': { stripeClient: () => stripe, stripeConfiguration: async () => ({ mode: 'live' }), connectStripe: async () => { throw Error('Unexpected external setup'); }, paymentSetupStatus: async () => ({ connected: true }) },
    '@/lib/portal/email': { sendEmail: async () => { emails++; }, layout: ({ bodyHtml }) => bodyHtml, esc: String },
    '@/lib/portal/store': { readJson: async () => null, writeJson: async () => {}, ConflictError: class extends Error {} },
    './stripe-catalog': { christmasCheckoutCatalog: async () => ({ price: 'price_base', albumPrices: ['price_first', 'price_second', 'price_third'], taxRates: ['txr_gst'], albumTaxRates: ['txr_gst', 'txr_pst'] }) },
    './store': { settings: async () => cfg, allSlots: async () => structuredClone(rows), inventoryStore: store, updateSlot: async (id, change) => { const row = await store.read(id); change(row.data); await store.write(id, row.data, row.etag); return row.data; } },
  });
  const payments = load('@/lib/christmas/payments'), catalog = load('@/lib/christmas/catalog');
  const input = n => ({ slotId: rows[0].id, packageId: 'santa', name: 'Offline Test', email: 'offline@example.invalid', phone: '6045550100', albums: n, shareActivity: false, acceptedPolicy: cfg.cancellationPolicy, expectedSubtotal: catalog.sessionQuote(n).subtotal, expectedTotal: catalog.sessionQuote(n).total, delivery: { letterNames: 'Family', line1: 'Test address', line2: '', city: 'Vancouver', postalCode: 'V7N 1J2', province: 'BC', country: 'CA' } });
  const session = (status = 'paid') => ({ id: 'cs_offline_fixture', metadata: { service: 'christmas-2026', slotId: rows[0].id, bookingId: rows[0].reservation.id }, livemode: true, currency: 'cad', amount_subtotal: rows[0].reservation.subtotalCents, amount_total: rows[0].reservation.totalCents, payment_status: status, status: 'complete' });
  return { rows, payments, input, session, created: () => created, emails: () => emails };
}
test('checkout has incremental album lines and separate tax rates', async () => {
  for (let n = 0; n <= 3; n++) {
    const h = harness(); await h.payments.startCheckout(h.input(n)); const c = h.created();
    assert.equal(c.line_items.length, n + 1); assert.deepEqual(c.line_items[0].tax_rates, ['txr_gst']);
    for (const line of c.line_items.slice(1)) { assert.deepEqual(line.tax_rates, ['txr_gst', 'txr_pst']); assert.equal(line.quantity, 1); }
    assert.equal(h.rows[0].reservation.packageSnapshot.images, n ? 20 : 10); assert.equal(c.invoice_creation.enabled, true);
  }
});
test('tampered totals and invalid quantities cannot reserve inventory', async () => {
  for (const changed of [{ expectedTotal: 1 }, { expectedSubtotal: 1 }, { albums: 4 }, { albums: -1 }, { albums: 0.5 }]) {
    const h = harness(); await assert.rejects(h.payments.startCheckout({ ...h.input(1), ...changed })); assert.equal(h.rows[0].reservation, undefined); assert.equal(h.created(), undefined);
  }
});
test('paid reconciliation marks sold and retries cannot duplicate confirmations', async () => {
  const h = harness(); await h.payments.startCheckout(h.input(3)); assert.equal((await h.payments.availability()).slots[0].status, 'reserved');
  await h.payments.reconcileChristmasSession(h.session('unpaid')); assert.equal(h.rows[0].reservation.status, 'pending'); assert.equal(h.emails(), 0);
  await assert.rejects(h.payments.reconcileChristmasSession({ ...h.session(), amount_total: 1 }), /mismatch/);
  await h.payments.reconcileChristmasSession(h.session()); assert.equal((await h.payments.availability()).slots[0].status, 'sold'); assert.equal(h.emails(), 2);
  await h.payments.reconcileChristmasSession(h.session()); assert.equal(h.emails(), 2);
  await h.payments.reconcileChristmasSession({ ...h.session('unpaid'), status: 'expired' }); assert.equal(h.rows[0].reservation.status, 'paid');
});
test('confirmed expiry frees only the matching unpaid reservation', async () => {
  const h = harness(); await h.payments.startCheckout(h.input(0)); const s = h.session('unpaid');
  await h.payments.reconcileChristmasSession({ ...s, status: 'expired' }); assert.equal(h.rows[0].reservation, undefined);
  await h.payments.reconcileChristmasSession({ ...s, status: 'expired' }); assert.equal(h.rows[0].reservation, undefined);
});
