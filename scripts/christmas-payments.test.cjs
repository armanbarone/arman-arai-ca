// Offline tests: all Stripe, storage and email calls are explicit in-memory doubles.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { loader } = require('./wedding-test-loader.cjs');
process.env.PORTAL_SECRET = 'offline-test-only-private-link-fixture';
process.env.VERCEL_ENV = 'production';
process.env.STRIPE_SECRET_KEY = 'rk_live_offline_fixture_not_a_credential';
function harness({ failQuestionnaireOnce = false, failWelcomeOnce = false, failCalendarOnce = false } = {}) {
  const rows = [{ id: '2026-12-05_1100', date: '2026-12-05', time: '11:00', santa: true, published: true }];
  let version = 0, created, emails = 0, calendarCalls = 0; const messages=[];
  class MemoryConflict extends Error {}
  const cfg = { enabled: true, studioAddress: 'Studio', postalCode: 'V7N 1J2', arrivalNotes: 'Street parking', cancellationPolicy: '48 hours full refund; one free reschedule', publishableKey: '' };
  const store = {
    read: async id => { const data = rows.find(s => s.id === id); return data ? { data: structuredClone(data), etag: String(version) } : null; },
    write: async (id, data, etag) => { if(etag!==String(version))throw new MemoryConflict(); rows[rows.findIndex(s => s.id === id)] = structuredClone(data); version++; }, conflict: error => error instanceof MemoryConflict,
  };
  const stripe = { webhookEndpoints: { retrieve: async()=>({id:'we_offline',enabled_events:['invoice.paid']}), update:async()=>({}) }, checkout: { sessions: {
    create: async input => { created = input; return { id: 'cs_offline_fixture', url: 'https://checkout.stripe.com/c/pay/offline-fixture' }; },
    retrieve: async () => { throw Error('Unexpected external lookup'); }, expire: async id => ({id,metadata:{service:'christmas-2026',slotId:rows[0].id,bookingId:rows[0].reservation.id},livemode:true,currency:'cad',amount_subtotal:rows[0].reservation.subtotalCents,amount_total:rows[0].reservation.totalCents,payment_status:'unpaid',status:'expired'}),
  } }, invoices: { retrieve: async () => ({ hosted_invoice_url: 'https://invoice.stripe.com/offline-fixture' }) } };
  const load = loader({
    '@/lib/portal/stripe': { stripeClient: () => stripe, stripeConfiguration: async () => ({ mode: 'live', webhookId:'we_offline' }), connectStripe: async () => { throw Error('Unexpected external setup'); }, paymentSetupStatus: async () => ({ connected: true }) },
    '@/lib/portal/email': { sendEmail: async opts => { if(failWelcomeOnce && opts.idempotencyKey.includes("welcome")){failWelcomeOnce=false;throw Error("Offline welcome failure");} if(failQuestionnaireOnce && opts.idempotencyKey.includes("questionnaire")){failQuestionnaireOnce=false;throw Error("Offline mail failure");} emails++;messages.push(opts); }, layout: ({ bodyHtml }) => bodyHtml, esc: String },
    '@/lib/portal/store': { readJson: async () => null, writeJson: async () => {}, ConflictError: class extends Error {} },
    './stripe-catalog': { christmasCheckoutCatalog: async () => ({ price: 'price_base', albumPrices: ['price_first', 'price_second', 'price_third'], taxRates: ['txr_gst'], albumTaxRates: ['txr_gst', 'txr_pst'] }) },
    './store': { settings: async () => cfg, allSlots: async () => structuredClone(rows), inventoryStore: store, updateSlot: async (id, change) => { for(let attempt=0;attempt<5;attempt++){const row = await store.read(id); change(row.data); try{await store.write(id, row.data, row.etag); return row.data;}catch(error){if(!(error instanceof MemoryConflict))throw error;}}throw Error('Memory write retries exceeded'); } },
    './google-calendar': { syncChristmasCalendar: async()=>{calendarCalls++;if(failCalendarOnce){failCalendarOnce=false;throw Error('Offline calendar failure');}return{status:'synced'};} },
  });
  const payments = load('@/lib/christmas/payments'), catalog = load('@/lib/christmas/catalog');
  const input = n => ({ slotId: rows[0].id, packageId: 'santa', name: 'Offline Test', email: 'offline@example.invalid', phone: '6045550100', albums: n, shareActivity: false, acceptedPolicy: cfg.cancellationPolicy, expectedSubtotal: catalog.sessionQuote(n).subtotal, expectedTotal: catalog.sessionQuote(n).total, delivery: { letterNames: 'Family', line1: 'Test address', line2: '', city: 'Vancouver', postalCode: 'V7N 1J2', province: 'BC', country: 'CA' } });
  const session = (status = 'paid') => ({ id: 'cs_offline_fixture', metadata: { service: 'christmas-2026', slotId: rows[0].id, bookingId: rows[0].reservation.id }, livemode: true, currency: 'cad', amount_subtotal: rows[0].reservation.subtotalCents, amount_total: rows[0].reservation.totalCents, payment_status: status, status: 'complete' });
  return { rows, payments, input, session, created: () => created, emails: () => emails, messages:()=>messages, calendarCalls:()=>calendarCalls };
}
test('checkout has incremental album lines and separate tax rates', async () => {
  for (let n = 0; n <= 3; n++) {
    const h = harness(); await h.payments.startCheckout(h.input(n)); const c = h.created();
    assert.equal(c.line_items.length, n + 1); assert.deepEqual(c.line_items[0].tax_rates, ['txr_gst']);
    for (const line of c.line_items.slice(1)) { assert.deepEqual(line.tax_rates, ['txr_gst', 'txr_pst']); assert.equal(line.quantity, 1); }
    assert.equal(h.rows[0].reservation.packageSnapshot.images, n ? 20 : 10); assert.equal(c.invoice_creation.enabled, true); assert.equal(c.payment_intent_data.receipt_email,'offline@example.invalid'); assert.equal(new URL(c.success_url).pathname,'/christmas/confirmation');
  }
});

test('only an authenticated paid booking supplies a stable anonymous purchase event', async () => {
  const h = harness(); await h.payments.startCheckout(h.input(1));
  const token = new URL(h.created().success_url).searchParams.get('token');
  const r = h.rows[0].reservation, sessionId = r.sessionId; delete r.sessionId;
  const pending = await h.payments.bookingStatus(h.rows[0].id, token);
  assert.equal(pending.purchaseTracking, undefined);
  r.sessionId = sessionId;
  await h.payments.reconcileChristmasSession(h.session());
  const result = await h.payments.bookingStatus(h.rows[0].id, token);
  assert.match(result.purchaseTracking.eventId, /^[a-f0-9]{64}$/);
  assert.equal(result.purchaseTracking.paidCents, 33754);
  assert.equal(result.purchaseTracking.albums, 1);
  assert.deepEqual(Object.keys(result.purchaseTracking).sort(), ['albums','eventId','paidCents']);
  assert.equal(await h.payments.bookingStatus(h.rows[0].id, '0'.repeat(64)), null);
  assert.deepEqual((await h.payments.bookingStatus(h.rows[0].id, token)).purchaseTracking, result.purchaseTracking);
});
test('tampered totals and invalid quantities cannot reserve inventory', async () => {
  for (const changed of [{ expectedTotal: 1 }, { expectedSubtotal: 1 }, { albums: 4 }, { albums: -1 }, { albums: 0.5 }]) {
    const h = harness(); await assert.rejects(h.payments.startCheckout({ ...h.input(1), ...changed })); assert.equal(h.rows[0].reservation, undefined); assert.equal(h.created(), undefined);
  }
});

test('the retired $10 price and verification flag cannot override checkout pricing', async () => {
  const h = harness();
  await assert.rejects(h.payments.startCheckout({ ...h.input(0), ownerPaymentCheck: true, expectedSubtotal: 952, expectedTotal: 1000 }), /Booking details changed/);
  assert.equal(h.rows[0].reservation, undefined);
  assert.equal(h.created(), undefined);
});
test('paid reconciliation marks sold and retries cannot duplicate confirmations', async () => {
  const h = harness(); await h.payments.startCheckout(h.input(3)); assert.equal((await h.payments.availability()).slots[0].status, 'reserved');
  await h.payments.reconcileChristmasSession(h.session('unpaid')); assert.equal(h.rows[0].reservation.status, 'pending'); assert.equal(h.emails(), 0);
  await assert.rejects(h.payments.reconcileChristmasSession({ ...h.session(), amount_total: 1 }), /mismatch/);
  await h.payments.reconcileChristmasSession(h.session()); assert.equal((await h.payments.availability()).slots[0].status, 'sold'); assert.equal(h.emails(), 3);
  await h.payments.reconcileChristmasSession(h.session()); assert.equal(h.emails(), 3);
  await h.payments.reconcileChristmasSession({ ...h.session('unpaid'), status: 'expired' }); assert.equal(h.rows[0].reservation.status, 'paid');
});
test('confirmed expiry frees only the matching unpaid reservation', async () => {
  const h = harness(); await h.payments.startCheckout(h.input(0)); const s = h.session('unpaid');
  await h.payments.reconcileChristmasSession({ ...s, status: 'expired' }); assert.equal(h.rows[0].reservation, undefined);
  await h.payments.reconcileChristmasSession({ ...s, status: 'expired' }); assert.equal(h.rows[0].reservation, undefined);
});

test('welcome precedes questionnaire; questionnaire failure retries without resending welcome',async()=>{
 const h=harness({failQuestionnaireOnce:true});await h.payments.startCheckout(h.input(1));
 await assert.rejects(h.payments.reconcileChristmasSession(h.session()),/Offline mail failure/);
 assert.equal(h.rows[0].reservation.status,'paid');assert.ok(h.rows[0].reservation.welcomeSentAt);assert.ok(h.rows[0].reservation.studioSentAt);assert.equal(h.rows[0].reservation.questionnaireSentAt,undefined);
 await h.payments.reconcileChristmasSession(h.session());
 assert.equal(h.messages().length,3);const welcome=h.messages().find(m=>/booked/.test(m.subject)),survey=h.messages().find(m=>/few details/.test(m.subject)),studio=h.messages().find(m=>/Christmas booking/.test(m.subject));assert.ok(welcome&&survey&&studio);assert.ok(h.messages().indexOf(welcome)<h.messages().indexOf(survey));
 assert.equal(welcome.attachments[0].filename,'Christmas-session.ics');assert.match(welcome.html,/Plenty|Street parking/);assert.match(survey.html,/medical diagnoses are not needed/i);assert.equal(studio.to,'i@armanarai.com');assert.match(studio.subject,/11:00 am/);
});

test('the post-payment guide includes the former FAQ details in both HTML and plain text',async()=>{
 for(const albums of [0,1]){
  const h=harness();await h.payments.startCheckout(h.input(albums));await h.payments.reconcileChristmasSession(h.session());
  const guide=h.messages().find(m=>/session guide/.test(m.subject));assert.ok(guide);
  for(const content of [guide.html,guide.text]){
   for(const detail of ['Studio','V7N 1J2','Street parking','cream','Santa','five days','48-hour','December 18','BC postage','before Christmas','Surrey','first costs $67','second $55','third $45','48 hours full refund; one free reschedule','questionnaire'])assert.ok(content.toLowerCase().includes(detail.toLowerCase()),detail);
   assert.match(content,new RegExp(`${albums?20:10} edited digital photographs`));
  }
  assert.equal(h.messages().length,3);
 }
});

test('studio alert is delivered even when the client welcome fails, and retries do not duplicate it',async()=>{
 const h=harness({failWelcomeOnce:true});await h.payments.startCheckout(h.input(0));
 await assert.rejects(h.payments.reconcileChristmasSession(h.session()),/Offline welcome failure/);
 assert.equal(h.rows[0].reservation.status,'paid');assert.ok(h.rows[0].reservation.studioSentAt);assert.equal(h.rows[0].reservation.welcomeSentAt,undefined);assert.equal(h.messages().length,1);assert.equal(h.messages()[0].to,'i@armanarai.com');
 await h.payments.reconcileChristmasSession(h.session());assert.equal(h.messages().length,3);assert.equal(h.messages().filter(m=>m.to==='i@armanarai.com').length,1);assert.equal(h.rows[0].reservation.emailsSent,true);
});

test('calendar failure preserves the paid booking and emails, then retries independently',async()=>{
 const h=harness({failCalendarOnce:true});await h.payments.startCheckout(h.input(1));
 await assert.rejects(h.payments.reconcileChristmasSession(h.session()),/Offline calendar failure/);
 assert.equal(h.rows[0].reservation.status,'paid');assert.equal(h.rows[0].reservation.emailsSent,true);assert.equal(h.emails(),3);
 await h.payments.reconcileChristmasSession(h.session());assert.equal(h.calendarCalls(),2);assert.equal(h.emails(),3);
});

test('cancelling hosted checkout expires and releases only the authenticated unpaid hold',async()=>{
 const h=harness(), result=await h.payments.startCheckout(h.input(3));const token=new URL(result.returnUrl).searchParams.get('token');
 assert.equal(await h.payments.cancelCheckout(h.rows[0].id,'0'.repeat(64)),null);assert.ok(h.rows[0].reservation);
 assert.deepEqual(await h.payments.cancelCheckout(h.rows[0].id,token),{cancelled:true});assert.equal(h.rows[0].reservation,undefined);
});
test('paid invoice event adds the receipt link only to its matching paid booking',async()=>{
 const h=harness();const started=await h.payments.startCheckout(h.input(1));await h.payments.reconcileChristmasSession(h.session());
 const token=new URL(started.returnUrl).searchParams.get('token');const cancelled=await h.payments.cancelCheckout(h.rows[0].id,token);assert.equal(cancelled.paid,true);
 const invoice={id:'in_offline',metadata:{service:'christmas-2026',slotId:h.rows[0].id,bookingId:h.rows[0].reservation.id},livemode:true,currency:'cad',status:'paid',amount_paid:33754,hosted_invoice_url:'https://invoice.stripe.com/offline-fixture'};
 await h.payments.reconcileChristmasInvoice(invoice);assert.equal(h.rows[0].reservation.invoiceId,'in_offline');
 await assert.rejects(h.payments.reconcileChristmasInvoice({...invoice,amount_paid:1}),/does not match/);
});
