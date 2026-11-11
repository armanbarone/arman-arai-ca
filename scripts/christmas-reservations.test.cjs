const { test } = require('node:test');
const assert = require('node:assert/strict');
const { loader } = require('./wedding-test-loader.cjs');

function harness(seed = []) {
  let version = 0, document;
  class ConflictError extends Error {}
  const load = loader({ '@/lib/portal/store': {
    ConflictError,
    readJson: async path => path.endsWith('/calendar.json') ? { data: structuredClone(document), etag: String(version) } : null,
    writeJson: async (path, data, options) => { assert.ok(path.endsWith('/calendar.json')); if (options.etag !== String(version)) throw new ConflictError(); document = structuredClone(data); version++; },
  } });
  const catalog = load('@/lib/christmas/catalog'), inventory = load('@/lib/christmas/inventory');
  const slots = catalog.seasonalSlots().map(({ available, status, ...s }) => ({ ...s, published: available }));
  inventory.markOwnerSoldOutSlots(slots);
  document = { season: 'nov09-dec20-half-hour-owner-blocks-v6', slots: [...slots, ...seed] };
  return { store: load('@/lib/christmas/store'), inventory, rows: () => structuredClone(document.slots) };
}
function reservation(n, status = 'paid') {
  return { id: `XMAS-${n.toString(16).padStart(20, '0')}`, tokenHash: '0'.repeat(64), packageId: 'santa', name: 'Offline Family', email: 'offline@example.invalid', phone: '6045550100', status, createdAt: Date.now(), expiresAt: Date.now()+2100000, subtotalCents: 25000, paidCents: status==='paid'?5000:undefined, packageSnapshot:{name:'Christmas',minutes:30,images:10,sets:3,santa:true}, bookingDetails:{studioAddress:'Offline',postalCode:'V7N 1J2',arrivalNotes:'',cancellationPolicy:'Offline'}, paymentPlan:{kind:'deposit-50-v1',depositSubtotalCents:4762,depositGstCents:238,depositCents:5000} };
}
const legacy = n => ({ id:`legacy-${n}`,date:'2026-11-15',time:'12:00',santa:true,published:false,reservation:reservation(n) });

test('existing genuine paid bookings count toward 50; manual sold-out blocks and owner/test payments do not', () => {
  const owner=legacy(90), sandbox=legacy(91);owner.reservation.ownerPaymentCheck=true;sandbox.reservation.testMode=true;
  const h=harness([legacy(1),owner,sandbox]);
  assert.deepEqual(h.inventory.reservationCapacity(h.rows()),{limit:50,remaining:49,checkoutAvailable:49});
});
test('twenty concurrent checkouts for the final session cannot oversell the real shared inventory', async () => {
  const h=harness(Array.from({length:49},(_,i)=>legacy(i+1)));
  const attempts=await Promise.allSettled(Array.from({length:20},(_,i)=>h.store.claimFlexibleReservation(reservation(100+i,'pending'))));
  assert.equal(attempts.filter(r=>r.status==='fulfilled').length,1);
  assert.deepEqual(h.inventory.reservationCapacity(h.rows()),{limit:50,remaining:1,checkoutAvailable:0});
  const held=h.rows().find(s=>s.flexible);
  assert.equal(held.date,'');assert.equal(held.time,'');
  await h.store.updateSlot(held.id,s=>{s.reservation.status='paid';s.reservation.paidCents=5000;});
  assert.deepEqual(h.inventory.reservationCapacity(h.rows()),{limit:50,remaining:0,checkoutAvailable:0});
  await assert.rejects(h.store.claimFlexibleReservation(reservation(200,'pending')),/sold out/);
});
test('a hold never reduces the paid counter and is not silently released merely because its clock expires',async()=>{
  const h=harness(Array.from({length:49},(_,i)=>legacy(i+1))), r=reservation(100,'pending');r.expiresAt=1;
  const s=await h.store.claimFlexibleReservation(r);
  assert.equal(h.inventory.reservationCapacity(h.rows()).remaining,1);
  await assert.rejects(h.store.claimFlexibleReservation(reservation(101,'pending')),/sold out/);
  await h.store.updateSlot(s.id,slot=>{delete slot.reservation;});
  assert.equal(h.inventory.reservationCapacity(h.rows()).checkoutAvailable,1);
});
test('personal appointment assignment enforces December 1–14, blackout dates, opening hours and actual overlap',async()=>{
  const h=harness(), a=await h.store.claimFlexibleReservation(reservation(1)), b=await h.store.claimFlexibleReservation(reservation(2));
  for(const [date,time] of [['2026-11-30','10:00'],['2026-12-15','10:00'],['2026-12-10','10:00'],['2026-12-06','10:00'],['2026-12-02','10:00']]) await assert.rejects(h.store.assignFlexibleReservation(a.id,date,time));
  const outcomes=await Promise.allSettled([h.store.assignFlexibleReservation(a.id,'2026-12-05','10:00'),h.store.assignFlexibleReservation(b.id,'2026-12-05','10:00')]);
  assert.equal(outcomes.filter(r=>r.status==='fulfilled').length,1);
  const assigned=h.rows().find(s=>s.flexible&&s.date), original=assigned.reservation.id;
  assert.equal(assigned.reservation.paymentPlan.balanceDueAt,new Date('2026-12-05T10:00:00-08:00').getTime());
  assert.equal(assigned.reservation.scheduleVersion,1);
  await h.store.assignFlexibleReservation(assigned.id,'2026-12-05','10:00');
  assert.equal((await h.store.inventoryStore.read(assigned.id)).data.reservation.scheduleVersion,1);
  assert.equal((await h.store.inventoryStore.read(assigned.id)).data.reservation.id,original);
  assert.equal(h.inventory.reservationCapacity(h.rows()).remaining,48);
});
test('an undated reservation cannot leak into public calendar slots or expose private details',async()=>{
  const h=harness(), slot=await h.store.claimFlexibleReservation(reservation(1));
  assert.equal(h.inventory.publicSlots(h.rows()).some(s=>s.id===slot.id),false);
  assert.doesNotMatch(JSON.stringify(h.inventory.reservationCapacity(h.rows())),/email|phone|Offline|token/);
});
test('private confirmation access accepts an undated reservation and strips its token before tracking',t=>{
  const previousWindow=global.window, previousStorage=global.sessionStorage, saved=new Map();
  t.after(()=>{previousWindow===undefined?delete global.window:global.window=previousWindow;previousStorage===undefined?delete global.sessionStorage:global.sessionStorage=previousStorage;});
  const id='2026-reservation_'+ 'a'.repeat(20), token='b'.repeat(64);
  global.window={location:{pathname:'/christmas/confirmation',search:`?slot=${id}&token=${token}`},history:{state:null,replaceState:(state,title,url)=>{assert.equal(url,'/christmas/confirmation');global.window.location.search='';}}};
  global.sessionStorage={setItem:(k,v)=>saved.set(k,v),getItem:k=>saved.get(k)??null};
  const {confirmationAccess}=loader()('@/lib/christmas/confirmation-access');
  assert.equal(confirmationAccess().slot,id);assert.equal(global.window.location.search,'');assert.equal(confirmationAccess().token,token);
});
