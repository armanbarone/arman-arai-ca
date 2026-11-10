const { test } = require('node:test');
const assert = require('node:assert/strict');
const { loader } = require('./wedding-test-loader.cjs');
function harness(t,{reject=false,network=false}={}) {
 const old={fetch:global.fetch,env:process.env.VERCEL_ENV,token:process.env.META_CONVERSIONS_ACCESS_TOKEN};
 process.env.VERCEL_ENV='production';process.env.META_CONVERSIONS_ACCESS_TOKEN='offline-token-not-a-secret';
 t.after(()=>{global.fetch=old.fetch;for(const [k,v]of [['VERCEL_ENV',old.env],['META_CONVERSIONS_ACCESS_TOKEN',old.token]])v===undefined?delete process.env[k]:process.env[k]=v;});
 const records=new Map(),calls=[];let version=0;
 class Conflict extends Error{}
 const row={id:'2026-12-05_1100',date:'2026-12-05',time:'11:00',reservation:{id:'XMAS-private',sessionId:'cs_fixture',status:'pending',createdAt:Date.now(),paidCents:5000,paidAt:Date.now(),totalCents:33754,albums:1,metaAttribution:{allowed:true,fbp:`fb.1.${Date.now()}.123456`,ip:'192.0.2.4',agent:'Offline browser'},paymentPlan:{depositCents:5000,depositPaidCents:5000},name:'Private Family',email:'private@example.invalid',phone:'private phone'}};
 const store={ConflictError:Conflict,readJson:async k=>structuredClone(records.get(k)??null),writeJson:async(k,data,opts={})=>{const prev=records.get(k);if(opts.createOnly&&prev||opts.etag&&opts.etag!==prev?.etag)throw new Conflict();records.set(k,{data:structuredClone(data),etag:String(++version)});},listJson:async prefix=>[...records].filter(([k])=>k.startsWith(prefix)).map(([,v])=>structuredClone(v)),remove:async k=>records.delete(k)};
 global.fetch=async(url,options)=>{calls.push({url,...options});if(network)throw Error('offline failure');return {ok:!reject,status:reject?503:200,json:async()=>reject?{error:{code:2}}:{events_received:1}};};
 const load=loader({'@/lib/portal/store':store,'./store':{inventoryStore:{read:async()=>({data:structuredClone(row)})},allSlots:async()=>[structuredClone(row)],updateSlot:async(_id,change)=>{change(row);return row;}}});
 return {api:load('@/lib/christmas/meta'),row,calls,records,jobs:()=>[...records.values()].map(v=>v.data)};
}
test('attribution respects explicit opt-outs and validates existing browser identifiers',t=>{
 const h=harness(t),req=new Request('https://www.armanarai.ca/api/christmas/checkout',{headers:{cookie:'_fbp=fb.1.1794288000000.1234; _fbc=fb.1.1794288000000.real-click','x-forwarded-for':'192.0.2.4, 198.51.100.1','user-agent':'Browser'}});
 const a=h.api.christmasMetaAttribution(req);assert.equal(a.allowed,true);assert.equal(a.ip,'192.0.2.4');assert.equal(a.fbp,'fb.1.1794288000000.1234');assert.equal(a.fbc,'fb.1.1794288000000.real-click');
 assert.deepEqual(h.api.christmasMetaAttribution(req,true),{allowed:false});
 for(const key of ['sec-gpc','dnt'])assert.deepEqual(h.api.christmasMetaAttribution(new Request(req,{headers:{[key]:'1'}})),{allowed:false});
 assert.equal(h.api.christmasMetaAttribution(new Request(req,{headers:{cookie:'_fbp=invalid','x-forwarded-for':'garbage'}})).fbp,undefined);
 assert.match(h.api.christmasMetaAttribution(new Request(req,{headers:{}}),false,'real-click').fbc,/real-click$/);
});
test('only confirmed paid bookings produce Purchase; legacy/test records are never backfilled',async t=>{
 const h=harness(t);assert.equal(await h.api.queueChristmasMeta(h.row.id,'Purchase'),undefined);assert.equal(h.jobs().length,0);
 h.row.reservation.status='paid';for(const change of [{testMode:true},{ownerPaymentCheck:true},{metaAttribution:undefined},{metaAttribution:{allowed:false}}]){const old=structuredClone(h.row.reservation);Object.assign(h.row.reservation,change);assert.equal(await h.api.queueChristmasMeta(h.row.id,'Purchase'),undefined);h.row.reservation=old;}
 assert.equal(h.jobs().length,0);await h.api.reportChristmasMeta(h.row.id,'Purchase');assert.equal(h.calls.length,1);
});
test('server and browser use the same opaque ID and actual deposit amount without private details',async t=>{
 const h=harness(t);h.row.reservation.status='paid';h.row.reservation.paidCents=33754;
 await h.api.reportChristmasMeta(h.row.id,'Purchase');const payload=JSON.parse(h.calls[0].body),event=payload.data[0];
 assert.equal(event.event_id,h.api.christmasMetaEventId('XMAS-private','Purchase'));assert.equal(event.event_name,'Purchase');assert.equal(event.custom_data.value,50);assert.equal(event.custom_data.currency,'CAD');assert.equal(event.event_source_url,'https://www.armanarai.ca/christmas/confirmation');
 assert.doesNotMatch(h.calls[0].url,/offline-token/);assert.doesNotMatch(JSON.stringify(event),/Private Family|private@example|private phone|token=|2026-12-05|XMAS-private/);assert.ok(h.jobs()[0].sentAt);assert.equal(h.jobs()[0].user,undefined);
});
test('concurrent webhook retries send one server event and balance/revisit activity cannot resend it',async t=>{
 const h=harness(t);h.row.reservation.status='paid';await Promise.all([h.api.reportChristmasMeta(h.row.id,'Purchase'),h.api.reportChristmasMeta(h.row.id,'Purchase'),h.api.reportChristmasMeta(h.row.id,'Purchase')]);await h.api.reportChristmasMeta(h.row.id,'Purchase');assert.equal(h.calls.length,1);assert.equal(h.jobs().length,1);
});
test('a created checkout counts once even if abandoned and does not count as a Purchase',async t=>{
 const h=harness(t);await h.api.reportChristmasMeta(h.row.id,'InitiateCheckout');await h.api.reportChristmasMeta(h.row.id,'InitiateCheckout');assert.equal(h.calls.length,1);assert.equal(JSON.parse(h.calls[0].body).data[0].event_name,'InitiateCheckout');assert.equal(JSON.parse(h.calls[0].body).data[0].custom_data.value,50);assert.equal(h.jobs().filter(j=>j.name==='Purchase').length,0);
});
test('missing credentials queue an event without transmitting; scheduled retry later delivers it',async t=>{
 const h=harness(t);h.row.reservation.status='paid';delete process.env.META_CONVERSIONS_ACCESS_TOKEN;await h.api.reportChristmasMeta(h.row.id,'Purchase');assert.equal(h.calls.length,0);assert.equal(h.jobs()[0].sentAt,undefined);
 process.env.META_CONVERSIONS_ACCESS_TOKEN='offline-token';await h.api.retryChristmasMeta();assert.equal(h.calls.length,1);assert.ok(h.jobs()[0].sentAt);
});
test('failed requests preserve the original event and retry safely without claiming success',async t=>{
 const h=harness(t,{reject:true});h.row.reservation.status='paid';await h.api.reportChristmasMeta(h.row.id,'Purchase');assert.equal(h.calls.length,2);assert.equal(h.calls[0].body,h.calls[1].body);assert.equal(h.jobs()[0].sentAt,undefined);assert.match(h.jobs()[0].error,/503/);assert.equal(h.jobs()[0].leaseUntil,undefined);
});
test('old unacknowledged events expire before Meta deduplication ends and lose matching data',async t=>{
 const h=harness(t);const id=await h.api.queueChristmasMeta(h.row.id,'InitiateCheckout');const item=h.records.get(`christmas/2026/meta/${id}.json`);item.data.at=Date.now()-48*3600000;await h.api.deliverChristmasMeta(id);assert.equal(h.calls.length,0);assert.equal(h.jobs()[0].expired,true);assert.equal(h.jobs()[0].user,undefined);
});
test('a booking no longer retains browser matching context after both events are durably queued',async t=>{
 const h=harness(t);await h.api.reportChristmasMeta(h.row.id,'InitiateCheckout');h.row.reservation.status='paid';await h.api.reportChristmasMeta(h.row.id,'Purchase');assert.equal(h.calls.length,2);assert.deepEqual(h.row.reservation.metaAttribution,{allowed:true});assert.ok(h.jobs().every(j=>j.user===undefined));
});
