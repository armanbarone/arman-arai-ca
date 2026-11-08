const {test}=require('node:test');
const assert=require('node:assert/strict');
const {loader}=require('./wedding-test-loader.cjs');
function harness(t){
  const env={VERCEL_ENV:process.env.VERCEL_ENV,PORTAL_SECRET:process.env.PORTAL_SECRET,CHRISTMAS_CART_REMINDERS_ENABLED:process.env.CHRISTMAS_CART_REMINDERS_ENABLED,STRIPE_SECRET_KEY:process.env.STRIPE_SECRET_KEY};
  process.env.STRIPE_SECRET_KEY='rk_live_offline_fixture';process.env.VERCEL_ENV='production';process.env.PORTAL_SECRET='offline-cart-secret';process.env.CHRISTMAS_CART_REMINDERS_ENABLED='true';
  t.after(()=>{for(const [key,value] of Object.entries(env))value===undefined?delete process.env[key]:process.env[key]=value;});
  class ConflictError extends Error{};
  const records=new Map(),sent=[],stripeCalls=[];let failMail=false;
  const slots=[{id:'2026-12-05_1000',date:'2026-12-05',time:'10:00',published:true,santa:true}];
  const store={ConflictError,readJson:async key=>records.has(key)?structuredClone(records.get(key)):null,writeJson:async(key,data,opts={})=>{const old=records.get(key);if((opts.createOnly&&old)||(opts.etag&&opts.etag!==old?.etag))throw new ConflictError();records.set(key,{data:structuredClone(data),etag:String(Number(old?.etag||0)+1)});},listJson:async prefix=>[...records].filter(([k])=>k.startsWith(prefix)).map(([,v])=>structuredClone(v)),remove:async key=>records.delete(key)};
  const api=loader({'@/lib/portal/store':store,'./store':{inventoryStore:{read:async id=>{const s=slots.find(s=>s.id===id);return s?{data:structuredClone(s),etag:'1'}:null;}},allSlots:async()=>structuredClone(slots)},'@/lib/portal/email':{esc:s=>s.replace(/[<>&"]/g,''),sendEmail:async message=>{if(failMail){failMail=false;throw Error('mail offline');}sent.push(message);return{id:'mail-fixture'};}},'@/lib/portal/stripe':{stripeClient:()=>({checkout:{sessions:{retrieve:async id=>{stripeCalls.push(id);return{status:'expired',payment_status:'unpaid'};}}}})}})('@/lib/christmas/cart');
  const rows=()=>[...records].filter(([k])=>k.includes('/carts/')).map(([,v])=>v.data);
  async function cart({email='family@example.invalid',reminders=true,age=2*3600_000}={}){
    const c=await api.createCart(slots[0].id,1);await api.saveCartContact(c.id,c.token,'Sample Family',email,reminders);
    const r=records.get(`christmas/2026/carts/${c.id}.json`).data;r.createdAt=Date.now()-age;r.contactAt=r.createdAt;r.expiresAt=r.createdAt+600_000;if(reminders)r.consentAt=r.createdAt;
    return c;
  }
  return{api,records,slots,sent,stripeCalls,rows,cart,failMail:()=>failMail=true};
}
test('server checkout window expires and tokens cannot access another cart',async t=>{
  const h=harness(t),a=await h.api.createCart(h.slots[0].id,1),b=await h.api.createCart(h.slots[0].id,0);
  assert.ok(a.expiresAt-Date.now()>590_000);assert.equal(await h.api.getCart(a.id,b.token),null);
  await h.api.saveCartContact(a.id,a.token,'Sample Family','family@example.invalid',false);
  const input={slotId:h.slots[0].id,albums:1,email:'family@example.invalid',name:'Sample Family'};
  assert.ok(await h.api.validateCheckoutCart(a.id,a.token,input));
  h.records.get(`christmas/2026/carts/${a.id}.json`).data.expiresAt=Date.now()-1;
  await assert.rejects(h.api.validateCheckoutCart(a.id,a.token,input),/window ended/);
  await assert.rejects(h.api.markCartCheckout(a.id),/window ended/);
});
test('no consent, preview environment and feature disabled never send reminders',async t=>{
  const h=harness(t);await h.cart({reminders:false});await h.api.sendCartReminders();assert.equal(h.sent.length,0);
  await h.cart();process.env.VERCEL_ENV='preview';await h.api.sendCartReminders();assert.equal(h.sent.length,0);await assert.rejects(h.api.createCart(h.slots[0].id,0),/Test pages/);
  process.env.VERCEL_ENV='production';process.env.CHRISTMAS_CART_REMINDERS_ENABLED='false';await h.api.sendCartReminders();assert.equal(h.sent.length,0);
});
test('two timed reminders only, no duplicate on repeat or concurrent invocations',async t=>{
  const h=harness(t);await h.cart();await Promise.all([h.api.sendCartReminders(),h.api.sendCartReminders()]);assert.equal(h.sent.length,1);assert.ok(h.rows()[0].firstSentAt);
  await h.api.sendCartReminders();assert.equal(h.sent.length,1);
  const tomorrow=Date.now()+24*3600_000;await h.api.sendCartReminders(tomorrow);await h.api.sendCartReminders(tomorrow+3600_000);assert.equal(h.sent.length,2);assert.notEqual(h.sent[0].idempotencyKey,h.sent[1].idempotencyKey);assert.match(h.sent[1].text,/won’t send any more/);
});
test('a paid booking stops reminder emails even from a different cart',async t=>{
  const h=harness(t);await h.cart();h.slots[0].reservation={email:'family@example.invalid',status:'paid'};await h.api.sendCartReminders();assert.equal(h.sent.length,0);
});
test('unsubscribe suppresses all older carts for the recipient',async t=>{
  const h=harness(t),c=await h.cart();assert.equal(await h.api.unsubscribeCart(c.id,'0'.repeat(64)),false);assert.equal(await h.api.unsubscribeCart(c.id,c.token),true);await h.api.sendCartReminders();assert.equal(h.sent.length,0);
  const other=await h.cart();await h.api.sendCartReminders();assert.equal(h.sent.length,0);assert.ok(other.id);
});
test('newer carts supersede old carts and current payment is checked with Stripe',async t=>{
  const h=harness(t);await h.cart({age:3*3600_000});await h.cart();h.slots[0].reservation={email:'family@example.invalid',status:'pending',sessionId:'cs_fixture'};await h.api.sendCartReminders();assert.equal(h.sent.length,1);assert.equal(h.stripeCalls.length,1);
});
test('failed email retries with stable idempotency after the send lease expires',async t=>{
  const h=harness(t);await h.cart();h.failMail();const now=Date.now();assert.equal((await h.api.sendCartReminders(now)).failed,1);assert.equal(h.sent.length,0);await h.api.sendCartReminders(now+180_000);assert.equal(h.sent.length,1);assert.ok(h.rows()[0].firstSentAt);
});
test('no reminder after session time and records are purged after 30 days',async t=>{
  const h=harness(t);await h.cart();await h.api.sendCartReminders(new Date('2026-12-05T11:00:00-08:00').getTime());assert.equal(h.sent.length,0);
  await h.api.sendCartReminders(Date.now()+31*86400_000);assert.equal(h.rows().length,0);
});
