import assert from 'node:assert/strict';
import test from 'node:test';
import { isCompletedWeddingBooking, weddingCalendarUrl } from '../lib/wedding-booking.ts';

const eventUri = 'https://api.calendly.com/scheduled_events/1234-abcd';
const booked = { event: 'calendly.event_scheduled', payload: { event: { uri: eventUri }, invitee: { uri: `${eventUri}/invitees/5678-abcd` } } };

test('only a completed booking from the actual Calendly frame can redirect', () => {
  assert.equal(isCompletedWeddingBooking('https://calendly.com', true, booked), true);
  for (const origin of ['https://evil.example', 'https://calendly.com.evil.example', 'http://calendly.com']) {
    assert.equal(isCompletedWeddingBooking(origin, true, booked), false);
  }
  assert.equal(isCompletedWeddingBooking('https://calendly.com', false, booked), false);
  for (const data of [null, 'calendly.event_scheduled', {}, { event: 'calendly.event_type_viewed' }, { event: 'calendly.date_and_time_selected' }]) {
    assert.equal(isCompletedWeddingBooking('https://calendly.com', true, data), false);
  }
});

test('a genuine completion does not require optional personal or invitee metadata', () => {
  assert.equal(isCompletedWeddingBooking('https://calendly.com', true, { event: 'calendly.event_scheduled', payload: {} }), true);
  assert.equal(isCompletedWeddingBooking('https://calendly.com', true, { event: 'calendly.event_scheduled' }), true);
});

test('campaign attribution survives the embed and direct calendar fallback', () => {
  for (const embedded of [true, false]) {
    const url = new URL(weddingCalendarUrl('?utm_source=google&utm_campaign=Canada%20Weddings&utm_medium=cpc&utm_content=hero&utm_term=wedding&email=private', 'www.armanarai.ca', embedded));
    assert.equal(url.origin, 'https://calendly.com');
    assert.equal(url.pathname, '/i-armanarai/30-minute-meeting-wedding');
    assert.equal(url.searchParams.get('utm_campaign'), 'Canada Weddings');
    assert.equal(url.searchParams.get('utm_source'), 'google');
    assert.equal(url.searchParams.get('utm_medium'), 'cpc');
    assert.equal(url.searchParams.get('utm_content'), 'hero');
    assert.equal(url.searchParams.get('utm_term'), 'wedding');
    assert.equal(url.searchParams.has('email'), false);
    assert.equal(url.searchParams.get('embed_type'), embedded ? 'Inline' : null);
    assert.equal(url.searchParams.get('hide_event_type_details'), embedded ? '1' : null);
    assert.equal(url.searchParams.has('hide_landing_page_details'), false);
  }
  assert.equal(new URL(weddingCalendarUrl('', 'www.armanarai.ca')).searchParams.get('utm_source'), '2728-cc-weddings');
});

test('dark variation keeps its booking attribution and colours without changing the original', () => {
  const options = { page: '2728-cc-weddings-dark', theme: 'dark' };
  const dark = new URL(weddingCalendarUrl('', 'www.armanarai.ca', true, options));
  assert.equal(dark.searchParams.get('background_color'), '141210');
  assert.equal(dark.searchParams.get('text_color'), 'e8e0d0');
  assert.equal(dark.searchParams.get('primary_color'), 'b8956a');
  assert.equal(dark.searchParams.get('utm_source'), options.page);
  assert.equal(dark.searchParams.get('utm_content'), options.page);
  const campaign = new URL(weddingCalendarUrl('?utm_source=google&utm_content=ad-2', 'www.armanarai.ca', false, options));
  assert.equal(campaign.searchParams.get('utm_source'), 'google');
  assert.equal(campaign.searchParams.get('utm_content'), 'ad-2');
  assert.equal(campaign.searchParams.has('background_color'), false);
  const original = new URL(weddingCalendarUrl('', 'www.armanarai.ca'));
  assert.equal(original.searchParams.get('background_color'), 'ffffff');
  assert.equal(original.searchParams.get('primary_color'), '344b3c');
});
