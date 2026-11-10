// Offline tests: all Stripe, storage and email calls are explicit in-memory doubles.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { loader } = require('./wedding-test-loader.cjs');
process.env.PORTAL_SECRET = 'offline-test-only-private-link-fixture';
process.env.VERCEL_ENV = 'production';
process.env.STRIPE_SECRET_KEY = 'rk_live_offline_fixture_not_a_credential';
function harness({ failQuestionnaireOnce = false, failWelcomeOnce = false, failCalendarOnce = false, failBalanceOnce = false, failAlbumLineOnce = false } = {}) {
  const rows = [{ id: '2026-12-05_1100', date: '2026-12-05', time: '11:00', santa: true, published: true }];
  let version = 0, created, emails = 0, calendarCalls = 0; const messages=[], invoices=new Map(), invoiceItems=[]; let invoiceCreates=0, balancePayCalls=0;
  class MemoryConflict extends Error {}
  const cfg = { enabled: true, studioAddress: 'Studio', postalCode: 'V7N 1J2', arrivalNotes: 'Street parking', cancellationPolicy: '48 hours full refund; one free reschedule', publishableKey: '' };
  const store = {
    read: async id => { const data = rows.find(s => s.id === id); return data ? { data: structuredClone(data), etag: String(version) } : null; },
    write: async (id, data, etag) => { if(etag!==String(version))throw new MemoryConflict(); rows[rows.findIndex(s => s.id === id)] = structuredClone(data); version++; }, conflict: error => error instanceof MemoryConflict,
  };
  const stripe = { webhookEndpoints: { retrieve: async()=>({id:'we_offline',enabled_events:['invoice.paid']}), update:async()=>({}) }, checkout: { sessions: {
    create: async input => { created = input; return { id: 'cs_offline_fixture', url: 'https://checkout.stripe.com/c/pay/offline-fixture' }; },
    retrieve: async () => { throw Error('Unexpected external lookup'); }, expire: async id => ({id,metadata:{service:'christmas-2026',slotId:rows[0].id,bookingId:rows[0].reservation.id,payment_kind:rows[0].reservation.paymentPlan?'deposit':undefined},livemode:true,currency:'cad',amount_subtotal:rows[0].reservation.paymentPlan?.depositSubtotalCents??rows[0].reservation.subtotalCents,amount_total:rows[0].reservation.paymentPlan?.depositCents??rows[0].reservation.totalCents,payment_status:'unpaid',status:'expired'}),
  } }, invoices: {
    list: async()=>({data:[...invoices.values()].map(structuredClone)}),
    create: async p=>{if(failBalanceOnce){failBalanceOnce=false;throw Error('Offline invoice failure');}invoiceCreates++;const i={...p,id:'in_balance_offline',livemode:true,status:'draft',total:0,amount_paid:0,hosted_invoice_url:null};invoices.set(i.id,i);return structuredClone(i);},
    retrieve: async id=>invoices.has(id)?structuredClone(invoices.get(id)):{id,hosted_invoice_url:'https://invoice.stripe.com/offline-fixture'},
    pay:async(id,p)=>{assert.equal(p.paid_out_of_band,true);balancePayCalls++;const i=invoices.get(id);i.status='paid';i.amount_paid=i.total;return structuredClone(i);},
    finalizeInvoice:async id=>{const i=invoices.get(id);i.status='open';i.hosted_invoice_url='https://invoice.stripe.com/balance-offline';return structuredClone(i);},
  }, invoiceItems:{list:async p=>({data:invoiceItems.filter(i=>i.invoice===p.invoice)}),create:async p=>{if(failAlbumLineOnce&&p.metadata.payment_component==='album-1'){failAlbumLineOnce=false;throw Error('Offline album line failure');}const amounts={price_balance:20238,price_first:6700,price_second:5500,price_third:4500};const net=amounts[p.pricing.price];assert.ok(net);const total=net+Math.round(net*.05)+(p.tax_rates.includes('txr_pst')?Math.round(net*.07):0);invoiceItems.push({...p,net,total});invoices.get(p.invoice).total+=total;return p;}} };
  const load = loader({
    'next/cache':{revalidatePath:()=>{}}, 'next/navigation':{redirect:()=>{throw Error('Unexpected redirect');}}, '@/lib/portal/auth':{requireAdmin:async()=>({email:'studio@example.invalid'})},
    '@/lib/portal/stripe': { stripeClient: () => stripe, stripeConfiguration: async () => ({ mode: 'live', webhookId:'we_offline' }), connectStripe: async () => { throw Error('Unexpected external setup'); }, paymentSetupStatus: async () => ({ connected: true }) },
    '@/lib/portal/email': { sendEmail: async opts => { if(failWelcomeOnce && opts.idempotencyKey.includes("welcome")){failWelcomeOnce=false;throw Error("Offline welcome failure");} if(failQuestionnaireOnce && opts.idempotencyKey.includes("questionnaire")){failQuestionnaireOnce=false;throw Error("Offline mail failure");} emails++;messages.push(opts); }, layout: ({ bodyHtml }) => bodyHtml, esc: String },
    '@/lib/portal/store': { readJson: async () => null, writeJson: async () => {}, ConflictError: class extends Error {} },
    './stripe-catalog': { christmasCheckoutCatalog: async () => ({ price: 'price_base', depositPrice:'price_deposit', balancePrice:'price_balance', albumPrices: ['price_first', 'price_second', 'price_third'], taxRates: ['txr_gst'], albumTaxRates: ['txr_gst', 'txr_pst'] }) },
    './store': { settings: async () => cfg, allSlots: async () => structuredClone(rows), inventoryStore: store, updateSlot: async (id, change) => { for(let attempt=0;attempt<5;attempt++){const row = await store.read(id); change(row.data); try{await store.write(id, row.data, row.etag); return row.data;}catch(error){if(!(error instanceof MemoryConflict))throw error;}}throw Error('Memory write retries exceeded'); } },
    './google-calendar': { syncChristmasCalendar: async()=>{calendarCalls++;if(failCalendarOnce){failCalendarOnce=false;throw Error('Offline calendar failure');}return{status:'synced'};} },
  });
  const payments = load('@/lib/christmas/payments'), catalog = load('@/lib/christmas/catalog');
  const input = n => ({ slotId: rows[0].id, packageId: 'santa', name: 'Offline Test', email: 'offline@example.invalid', phone: '6045550100', albums: n, shareActivity: false, acceptedPolicy: cfg.cancellationPolicy, expectedSubtotal: catalog.sessionQuote(n).subtotal, expectedTotal: catalog.sessionQuote(n).total, paymentPlan:'deposit-50-v1', expectedDueNow:5000, delivery: { letterNames: 'Family', line1: 'Test address', line2: '', city: 'Vancouver', postalCode: 'V7N 1J2', province: 'BC', country: 'CA' } });
  const session = (status = 'paid') => ({ id: 'cs_offline_fixture', metadata: { service: 'christmas-2026', slotId: rows[0].id, bookingId: rows[0].reservation.id, payment_kind:rows[0].reservation.paymentPlan?'deposit':undefined }, customer:'cus_offline', livemode: true, currency: 'cad', amount_subtotal: rows[0].reservation.paymentPlan?.depositSubtotalCents??rows[0].reservation.subtotalCents, amount_total: rows[0].reservation.paymentPlan?.depositCents??rows[0].reservation.totalCents, payment_status: status, status: 'complete' });
  return { rows, payments, input, session, actions:load('@/app/admin/christmas/actions'), balancePayCalls:()=>balancePayCalls, created: () => created, emails: () => emails, messages:()=>messages, calendarCalls:()=>calendarCalls, invoices, invoiceItems, invoiceCreates:()=>invoiceCreates, paidBalance:()=>{const i=invoices.get('in_balance_offline');i.status='paid';i.amount_paid=i.total;return structuredClone(i);} };
}
test('checkout charges exactly $50 including GST; album lines and tax go onto the balance invoice', async () => {
  for (let n = 0; n <= 3; n++) {
    const h = harness(); await h.payments.startCheckout(h.input(n)); const c = h.created();
    assert.equal(c.line_items.length, 1); assert.equal(c.line_items[0].price,'price_deposit'); assert.deepEqual(c.line_items[0].tax_rates, ['txr_gst']);
    assert.equal(h.rows[0].reservation.packageSnapshot.images, n ? 20 : 10); assert.equal(c.invoice_creation.enabled, true); assert.equal(c.payment_intent_data.receipt_email,'offline@example.invalid'); assert.equal(new URL(c.success_url).pathname,'/christmas/confirmation');
    assert.match(c.custom_text.submit.message,/before your session starts.*December 5, 2026.*11:00 am Pacific/);
    await h.payments.reconcileChristmasSession(h.session());
    const expected=[26250,33754,39914,44954][n]; const r=h.rows[0].reservation;
    assert.equal(r.totalCents,expected);assert.equal(r.paidCents,5000);assert.equal(h.invoices.get(r.paymentPlan.balanceInvoiceId).total,expected-5000);
    assert.equal(h.invoiceItems.length,n+1);assert.deepEqual(h.invoiceItems[0].tax_rates,['txr_gst']);
    for(const line of h.invoiceItems.slice(1))assert.deepEqual(line.tax_rates,['txr_gst','txr_pst']);
    assert.equal(4762+h.invoiceItems.reduce((n,i)=>n+i.net,0),r.subtotalCents);
    assert.equal(5000+h.invoiceItems.reduce((n,i)=>n+i.total,0),expected);
    assert.equal(h.invoices.get(r.paymentPlan.balanceInvoiceId).auto_advance,false);
    assert.equal(h.invoices.get(r.paymentPlan.balanceInvoiceId).due_date,new Date('2026-12-05T11:00:00-08:00').getTime()/1000);
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
  assert.equal(result.purchaseTracking.paidCents, 5000);
  assert.equal(result.purchaseTracking.albums, 1);
  assert.deepEqual(Object.keys(result.purchaseTracking).sort(), ['albums','eventId','paidCents']);
  assert.equal(await h.payments.bookingStatus(h.rows[0].id, '0'.repeat(64)), null);
  assert.deepEqual((await h.payments.bookingStatus(h.rows[0].id, token)).purchaseTracking, result.purchaseTracking);
});
test('tampered totals and invalid quantities cannot reserve inventory', async () => {
  for (const changed of [{ paymentPlan:undefined }, { expectedDueNow:26250 }, { expectedDueNow:1 }, { expectedTotal: 1 }, { expectedSubtotal: 1 }, { albums: 4 }, { albums: -1 }, { albums: 0.5 }]) {
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
 const invoice={id:'in_offline',metadata:{service:'christmas-2026',slotId:h.rows[0].id,bookingId:h.rows[0].reservation.id},livemode:true,currency:'cad',status:'paid',amount_paid:5000,hosted_invoice_url:'https://invoice.stripe.com/offline-fixture'};
 await h.payments.reconcileChristmasInvoice(invoice);assert.equal(h.rows[0].reservation.invoiceId,'in_offline');
 await assert.rejects(h.payments.reconcileChristmasInvoice({...invoice,amount_paid:1}),/does not match/);
});

test('balance invoice retry preserves confirmation and never duplicates lines, invoices or welcome emails', async()=>{
 const h=harness({failBalanceOnce:true});await h.payments.startCheckout(h.input(3));
 await assert.rejects(h.payments.reconcileChristmasSession(h.session()),/Offline invoice failure/);
 assert.equal(h.rows[0].reservation.status,'paid');assert.equal(h.emails(),3);
 await h.payments.reconcileChristmasSession(h.session());await h.payments.reconcileChristmasSession(h.session());
 assert.equal(h.invoiceCreates(),1);assert.equal(h.invoiceItems.length,4);assert.equal(h.emails(),3);
});

test('balance payment clears the amount owed once, emails a receipt and keeps Purchase value at the deposit', async()=>{
 const h=harness();const started=await h.payments.startCheckout(h.input(1));await h.payments.reconcileChristmasSession(h.session());
 const invoice=h.paidBalance();await h.payments.reconcileChristmasInvoice(invoice);await h.payments.reconcileChristmasInvoice(invoice);
 assert.equal(h.rows[0].reservation.paidCents,33754);assert.equal(h.emails(),4);assert.match(h.messages().at(-1).text,/Nothing remains owing/);
 const token=new URL(started.returnUrl).searchParams.get('token'),result=await h.payments.bookingStatus(h.rows[0].id,token);
 assert.equal(result.balanceCents,0);assert.equal(result.purchaseTracking.paidCents,5000);
 await h.payments.reconcileChristmasSession(h.session());assert.equal(h.rows[0].reservation.paidCents,33754);assert.equal(h.emails(),4);
 await assert.rejects(h.payments.reconcileChristmasInvoice({...invoice,amount_paid:1}),/does not match/);
});

test('deposit welcome and studio alert state full total, amount paid and exact balance deadline',async()=>{
 const h=harness();await h.payments.startCheckout(h.input(0));await h.payments.reconcileChristmasSession(h.session());
 for(const message of [h.messages().find(m=>/session guide/.test(m.subject)),h.messages().find(m=>m.to==='i@armanarai.com')]){
  for(const text of [message.html,message.text]){assert.match(text,/262.50/);assert.match(text,/50/);assert.match(text,/212.50/);assert.match(text,/before your session starts.*December 5, 2026.*11:00 am Pacific/);}
 }
});

test('legacy full-price and historical $10 bookings retain their paid totals without a new balance',async()=>{
 for(const amount of [26250,1000]){
  const h=harness();const started=await h.payments.startCheckout(h.input(0)),r=h.rows[0].reservation;
  delete r.paymentPlan;r.subtotalCents=amount===1000?952:25000;r.totalCents=amount;
  await h.payments.reconcileChristmasSession(h.session());assert.equal(r.totalCents,amount);assert.equal(h.invoiceCreates(),0);
  const status=await h.payments.bookingStatus(h.rows[0].id,new URL(started.returnUrl).searchParams.get('token'));assert.equal(status.balanceCents,0);assert.equal(status.paidCents,amount);assert.equal(status.purchaseTracking.paidCents,amount);
 }
});

test('a partial draft-invoice failure resumes its saved invoice and does not repeat completed lines',async()=>{
 const h=harness({failAlbumLineOnce:true});await h.payments.startCheckout(h.input(2));
 await assert.rejects(h.payments.reconcileChristmasSession(h.session()),/Offline album line failure/);
 assert.equal(h.invoiceItems.length,1);assert.ok(h.rows[0].reservation.paymentPlan.balanceInvoiceId);assert.equal(h.emails(),3);
 await h.payments.reconcileChristmasSession(h.session());assert.equal(h.invoiceCreates(),1);assert.equal(h.invoiceItems.length,3);
 assert.equal(h.invoices.get('in_balance_offline').total,34914);
});

test('recording an in-person balance requires an explicit received acknowledgment and never charges a card',async()=>{
 const h=harness();await h.payments.startCheckout(h.input(0));await h.payments.reconcileChristmasSession(h.session());
 const form=new FormData();form.set('id',h.rows[0].id);
 await assert.rejects(h.actions.recordChristmasBalancePayment(form),/actually received/);assert.equal(h.balancePayCalls(),0);
 form.set('received','on');await h.actions.recordChristmasBalancePayment(form);await h.actions.recordChristmasBalancePayment(form);
 assert.equal(h.balancePayCalls(),1);assert.equal(h.rows[0].reservation.paidCents,26250);assert.equal(h.emails(),4);
});
