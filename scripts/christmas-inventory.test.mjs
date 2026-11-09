import { test } from 'node:test';
import assert from 'node:assert/strict';
import { claimSlot, overlaps, validSlot, mergeSeasonalInventory, markOwnerSoldOutSlots, publicSlots, recentBookings, recalculateReservationBlocks } from '../lib/christmas/inventory.ts';
import { PACKAGES, ALBUM_ADDON, sessionQuote, seasonalSlots, scheduledTime } from '../lib/christmas/catalog.ts';
const slot = { id: '2026-12-05_1100', date: '2026-12-05', time: '11:00', santa: true, published: true };
const reservation = id => ({ id, tokenHash: 'a'.repeat(64), packageId: 'santa', name: 'Mark Example', email: 'private@example.com', phone: '6045550100', createdAt: Date.now(), expiresAt: Date.now()+2100000, subtotalCents: 25000, totalCents: 26250, status: 'pending', packageSnapshot:{name:'Christmas with Santa',minutes:30,images:10,sets:3,santa:true}, bookingDetails: { studioAddress:'Test',postalCode:'V7N 1J2',arrivalNotes:'',cancellationPolicy:'Test' } });
class Conflict extends Error {}
function memoryStore(initial) { let data=structuredClone(initial), version=0; return {
  async read() { return {data:structuredClone(data),etag:String(version)}; },
  async write(id,next,etag) { await Promise.resolve(); if(etag!==String(version)) throw new Conflict(); data=structuredClone(next);version++; },
  conflict:e=>e instanceof Conflict, value:()=>structuredClone(data)
}; }

test('twenty concurrent buyers cannot reserve the same appointment', async()=>{
 const store=memoryStore(slot);const results=await Promise.allSettled(Array.from({length:20},(_,i)=>claimSlot(store,slot.id,reservation(String(i)),true)));
 assert.equal(results.filter(r=>r.status==='fulfilled').length,1);assert.equal(store.value().reservation.status,'pending');
});
test('paid and held appointments remain unavailable, including locally expired holds', async()=>{
 for(const status of ['paid','pending']) await assert.rejects(claimSlot(memoryStore({...slot,reservation:{...reservation('old'),status,expiresAt:1}}),slot.id,reservation('new'),true),/no longer available/);
 await assert.rejects(claimSlot(memoryStore({...slot,published:false}),slot.id,reservation('new'),true),/no longer available/);
});
test('base and all incremental album quantities have exact separate GST/PST totals',()=>{
 assert.equal(PACKAGES[0].minutes,30);assert.equal(PACKAGES[0].images,10);assert.equal(ALBUM_ADDON.pages,10);assert.equal(ALBUM_ADDON.images,20);
 const totals=[26250,33754,39914,44954],subtotals=[25000,31700,37200,41700],psts=[0,469,854,1169];
 for(let n=0;n<=3;n++){const q=sessionQuote(n);assert.equal(q.total,totals[n]);assert.equal(q.subtotal,subtotals[n]);assert.equal(q.pst,psts[n]);}
 for(const n of [-1,4,0.5,NaN,'1',true]) assert.throws(()=>sessionQuote(n));
});
test('hours, blackout dates, season boundaries and all offered appointments hold for every date',()=>{
 const slots=seasonalSlots();assert.equal(new Set(slots.map(s=>s.id)).size,slots.length);
 for(const date of new Set(slots.map(s=>s.date))){
  const day=slots.filter(s=>s.date===date),dow=new Date(date+'T12:00:00Z').getUTCDay();
  assert.equal(day[0].time,dow===0?'12:00':dow===6?'10:00':'09:00');assert.equal(day.at(-1).time,dow===0?'14:30':dow===6?'15:30':'16:30');
  const blocked=date<'2026-11-09'||['2026-12-10','2026-12-11','2026-12-12'].includes(date);
  assert.equal(day.filter(s=>s.available).length,blocked?0:day.length);
  for(const s of day)assert.equal(validSlot(s.date,s.time),!blocked);
 }
 assert.equal(slots.at(-1).date,'2026-12-20');
 for(const [date,time]of[['2026-11-31','10:00'],['2026-12-21','10:00'],['2026-12-05','16:00'],['2026-12-06','11:00'],['2026-12-05','10:15']])assert.equal(validSlot(date,time),false);
});
test('30-minute appointments fit twice hourly while legacy bookings keep their promised allocation',()=>{
 assert.equal(overlaps(slot,{...slot,time:'11:29'}),true);assert.equal(overlaps(slot,{...slot,time:'11:30'}),false);
 const legacy={...slot,reservation:{...reservation('legacy'),status:'paid',subtotalCents:30000,totalCents:31500,packageSnapshot:{minutes:45}}};
 const generated=seasonalSlots().map(({available,status,...s})=>({...s,published:available}));
 const rows=mergeSeasonalInventory([legacy],generated);
 assert.equal(rows.find(s=>s.id===slot.id).reservation.totalCents,31500);
 assert.equal(rows.find(s=>s.id==='2026-12-05_1130').published,false);
 assert.equal(rows.find(s=>s.id==='2026-12-05_1130').reservationBlocked,true);
 assert.equal(rows.find(s=>s.id==='2026-12-05_1200').published,true);
 assert.equal(rows.find(s=>s.id==='2026-12-10_0900').published,false);
 assert.equal(mergeSeasonalInventory(rows,generated).length,rows.length);
 delete rows.find(s=>s.id===slot.id).reservation;recalculateReservationBlocks(rows);
 assert.equal(rows.find(s=>s.id==='2026-12-05_1130').published,true);
 const short=mergeSeasonalInventory([{...slot,reservation:reservation('new')}],generated);
 assert.equal(short.find(s=>s.id==='2026-12-05_1130').published,true);
 assert.equal(seasonalSlots().filter(s=>s.available).length,544);
 for(const date of ['2026-11-09','2026-11-14','2026-11-15']){
  const times=seasonalSlots().filter(s=>s.date===date);assert.equal(times.length,date.endsWith('09')?16:date.endsWith('14')?12:6);
  assert.ok(times.every((s,i)=>i%2===0?s.time.endsWith(':00'):s.time.endsWith(':30')));
 }
});

test('public calendar shows sold, reserved and unavailable without disclosing customer details',()=>{
 const now=new Date('2026-11-06T12:00:00Z').getTime();const rows=[{...slot,reservation:{...reservation('paid'),status:'paid'}},{...slot,id:'2026-12-05_1200',time:'12:00',reservation:reservation('held')},{...slot,id:'2026-12-10_1100',date:'2026-12-10'}];
 const visible=publicSlots(rows,now);assert.deepEqual(visible.map(s=>s.status),['sold','reserved','unavailable']);assert.ok(visible.every(s=>!s.available));assert.ok(!JSON.stringify(visible).includes('private@example.com'));
});

test('owner sold-out windows block exactly 38 slots while preserving end-time availability and paid records', async()=>{
 const rows=seasonalSlots().map(({available,status,...s})=>({...s,published:available}));
 const paid=rows.find(s=>s.id==='2026-11-21_1000');paid.reservation={...reservation('existing'),status:'paid'};
 const saved=structuredClone(paid.reservation);
 markOwnerSoldOutSlots(rows);
 const visible=publicSlots(rows,new Date('2026-11-06T12:00:00Z').getTime());
 for(const [date,count] of [['2026-11-21',12],['2026-11-22',6],['2026-12-02',10],['2026-12-03',10]])assert.equal(visible.filter(s=>s.date===date&&s.status==='sold').length,count);
 for(const id of ['2026-12-02_1400','2026-12-03_1030','2026-12-03_1600','2026-12-03_1630'])assert.equal(visible.find(s=>s.id===id).available,true,id);
 assert.deepEqual(paid.reservation,saved);
 const blocks=rows.filter(s=>s.manuallySoldOut);assert.equal(blocks.length,38);assert.ok(blocks.every(s=>s.manuallyBlocked&&!s.published));
 for(const blocked of blocks)await assert.rejects(claimSlot(memoryStore({...blocked,reservation:undefined,published:true}),blocked.id,reservation('new'),true),/no longer available/);
 assert.deepEqual(recentBookings(blocks.map(s=>({...s,reservation:undefined}))),[]);
 const once=structuredClone(rows);markOwnerSoldOutSlots(rows);assert.deepEqual(rows,once);
});
test('activity is only from recent real paid bookings; names require independent consent',()=>{
 const now=100000000;const paid={...reservation('paid'),status:'paid',paidAt:now-1000,delivery:{city:'Coquitlam'}};
 assert.deepEqual(recentBookings([{...slot,reservation:reservation('pending')}],now),[]);
 assert.equal(recentBookings([{...slot,reservation:paid}],now)[0].text,'A family recently booked a Christmas session');
 assert.equal(recentBookings([{...slot,reservation:{...paid,shareActivity:true}}],now)[0].text,'Mark from Coquitlam booked a Christmas session');
 assert.deepEqual(recentBookings([{...slot,reservation:{...paid,paidAt:now-86400001}}],now),[]);
});
