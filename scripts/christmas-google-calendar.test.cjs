const { test } = require('node:test');
const assert = require('node:assert/strict');
const { loader } = require('./wedding-test-loader.cjs');
function harness(t, { mode='production', configured=true, failOnce=false, wrongExisting=false, calendarRole='owner' }={}) {
  const priorFetch=global.fetch, priorEnv=process.env.VERCEL_ENV, priorUid=process.env.CHRISTMAS_GOOGLE_CONNECTOR_UID;
  process.env.VERCEL_ENV=mode; configured ? process.env.CHRISTMAS_GOOGLE_CONNECTOR_UID='oauth/christmas-bookings' : delete process.env.CHRISTMAS_GOOGLE_CONNECTOR_UID;
  t.after(()=>{global.fetch=priorFetch;priorEnv===undefined?delete process.env.VERCEL_ENV:process.env.VERCEL_ENV=priorEnv;priorUid===undefined?delete process.env.CHRISTMAS_GOOGLE_CONNECTOR_UID:process.env.CHRISTMAS_GOOGLE_CONNECTOR_UID=priorUid;});
  let tokenCalls=0;const calls=[],events=new Map();let row;
  const load=loader({
    '@vercel/connect': {getToken:async(uid,params)=>{tokenCalls++;assert.equal(uid,'oauth/christmas-bookings');assert.equal(params.subject.id,'i@armanarai.com');assert.deepEqual(params.scopes,['https://www.googleapis.com/auth/calendar.events.owned']);return'offline-fixture';},startAuthorization:async()=>({url:'https://vercel.com/connect/authorize/offline'})},
    './store': {inventoryStore:{read:async id=>row&&id===row.id?{data:structuredClone(row),etag:'fixture'}:null},updateSlot:async(id,change)=>{assert.equal(id,row.id);change(row);return structuredClone(row);}},
  });
  row=structuredClone(load('@/lib/christmas/preview').SAMPLE_CHRISTMAS_BOOKING);
  row.reservation.questionnaire={answers:{allergyNotes:'private health detail',children:[{firstName:'Private Child',age:'3'}]},submittedAt:1,updatedAt:1};
  global.fetch=async(url,opts)=>{
    const body=opts.body?JSON.parse(opts.body):null;calls.push({url,method:opts.method,body});
    assert.ok(url.startsWith('https://www.googleapis.com/calendar/v3/calendars/i%40armanarai.com/events'));
    if(failOnce){failOnce=false;return new Response('{}',{status:503});}
    if(opts.method==='GET' && new URL(url).searchParams.get('fields')==='accessRole') {
      assert.equal(new URL(url).searchParams.get('maxResults'),'1');
      return Response.json({accessRole:calendarRole});
    }
    if(opts.method==='POST'){
      if(events.has(body.id)||wrongExisting)return new Response('{}',{status:409});
      const value={...body,htmlLink:'https://www.google.com/calendar/event?eid=offline'};events.set(body.id,value);return Response.json(value);
    }
    const id=url.split('/events/')[1]?.split('?')[0];
    if(opts.method==='GET')return Response.json(wrongExisting?{id,extendedProperties:{private:{christmasBookingId:'unrelated-booking'}}}:events.get(id));
    if(opts.method==='PATCH'){const value={...events.get(id),...body,id};events.set(id,value);return Response.json(value);}
    throw Error('Unexpected provider request');
  };
  return {row,api:load('@/lib/christmas/google-calendar'),calls,events,tokenCalls:()=>tokenCalls};
}
test('calendar payload is private, reserves the half hour and excludes family questionnaire details',t=>{
  const h=harness(t),a=h.api.christmasCalendarEvent(h.row),b=h.api.christmasCalendarEvent(h.row);
  assert.equal(a.id,b.id);assert.match(a.id,/^[a-v0-9]{5,1024}$/);assert.equal(a.start.dateTime,'2026-11-21T18:00:00.000Z');assert.equal(a.end.dateTime,'2026-11-21T18:30:00.000Z');assert.equal(a.visibility,'private');assert.equal(a.transparency,'opaque');assert.equal(a.start.timeZone,'America/Vancouver');assert.equal(a.attendees,undefined);
  assert.doesNotMatch(JSON.stringify(a),/private health|Private Child|questionnaire|token=|confirmation\?/);assert.match(a.description,/30-minute photo session/);
});

test('legacy 45-minute bookings retain a full-hour calendar allocation',t=>{
  const h=harness(t);h.row.reservation.packageSnapshot.minutes=45;
  const e=h.api.christmasCalendarEvent(h.row);assert.equal(e.end.dateTime,'2026-11-21T19:00:00.000Z');assert.match(e.description,/45-minute.*15-minute/);
});
test('preview, missing connection and unpaid bookings never call Google',async t=>{
  let h=harness(t,{mode:'preview'});assert.equal((await h.api.syncChristmasCalendar(h.row.id)).status,'preview');assert.equal(h.tokenCalls(),0);
  h=harness(t,{configured:false});assert.equal((await h.api.syncChristmasCalendar(h.row.id)).status,'setup_required');assert.equal(h.tokenCalls(),0);
  h=harness(t);h.row.reservation.status='pending';assert.equal((await h.api.syncChristmasCalendar(h.row.id)).status,'not_paid');assert.equal(h.tokenCalls(),0);
});
test('successful sync is recorded and unchanged retries do not create duplicate events',async t=>{
  const h=harness(t);await h.api.syncChristmasCalendar(h.row.id);await h.api.syncChristmasCalendar(h.row.id);
  assert.equal(h.events.size,1);assert.equal(h.calls.length,1);assert.equal(h.tokenCalls(),1);assert.ok(h.row.reservation.googleCalendarSyncedAt);assert.match(h.row.reservation.googleCalendarEventUrl,/google.com/);assert.match(h.calls[0].url,/sendUpdates=none/);
});
test('a transient calendar failure keeps payment and retries with the same event identifier',async t=>{
  const h=harness(t,{failOnce:true});await assert.rejects(h.api.syncChristmasCalendar(h.row.id),/503/);assert.equal(h.row.reservation.status,'paid');assert.ok(h.row.reservation.googleCalendarLastError);assert.equal(h.row.reservation.googleCalendarSyncedAt,undefined);
  await h.api.syncChristmasCalendar(h.row.id);assert.equal(h.events.size,1);assert.equal(h.calls[0].body.id,h.calls[1].body.id);assert.equal(h.row.reservation.googleCalendarLastError,undefined);
});
test('changed booking updates its existing Google event after verifying ownership',async t=>{
  const h=harness(t);await h.api.syncChristmasCalendar(h.row.id);const id=h.row.reservation.googleCalendarEventId;h.row.time='11:00';await h.api.syncChristmasCalendar(h.row.id);
  assert.equal(h.events.size,1);assert.equal(h.row.reservation.googleCalendarEventId,id);assert.equal(h.events.get(id).start.dateTime,'2026-11-21T19:00:00.000Z');assert.deepEqual(h.calls.map(c=>c.method),['POST','POST','GET','PATCH']);
});
test('an unrelated event cannot be overwritten on a duplicate identifier response',async t=>{
  const h=harness(t,{wrongExisting:true});await assert.rejects(h.api.syncChristmasCalendar(h.row.id),/unrelated/);assert.equal(h.calls.some(c=>c.method==='PATCH'),false);assert.equal(h.row.reservation.status,'paid');
});

test('connection health requires a live grant for the intended calendar without reading event contents',async t=>{
  let h=harness(t,{mode:'preview'});assert.equal((await h.api.calendarConnectionHealth()).status,'preview');assert.equal(h.tokenCalls(),0);
  h=harness(t,{configured:false});assert.equal((await h.api.calendarConnectionHealth()).status,'setup_required');assert.equal(h.tokenCalls(),0);
  h=harness(t);assert.equal((await h.api.calendarConnectionHealth()).status,'connected');assert.equal(h.calls.length,1);assert.equal(h.calls[0].method,'GET');assert.equal(h.events.size,0);assert.equal(h.row.reservation.googleCalendarSyncedAt,undefined);
});

test('read-only access and provider failures never report a connected calendar',async t=>{
  let h=harness(t,{calendarRole:'reader'});assert.equal((await h.api.calendarConnectionHealth()).status,'not_connected');
  h=harness(t,{failOnce:true});assert.equal((await h.api.calendarConnectionHealth()).status,'not_connected');assert.equal((await h.api.calendarConnectionHealth()).status,'connected');assert.equal(h.events.size,0);
});
