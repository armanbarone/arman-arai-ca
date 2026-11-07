const { test } = require('node:test');
const assert = require('node:assert/strict');
const { loader } = require('./wedding-test-loader.cjs');
process.env.PORTAL_SECRET = 'offline-questionnaire-fixture-not-a-credential';
function harness(status = 'paid') {
  let slot = { id: '2026-11-21_1000', date: '2026-11-21', time: '10:00', santa: true, published: true, reservation: { id: 'XMAS-offline', tokenHash: 'a'.repeat(64), name: 'Alex Example', status, delivery: { letterNames: 'Sam and Riley' } } };
  const load = loader({ './store': { inventoryStore: { read: async id => id === slot.id ? { data: structuredClone(slot), etag: '1' } : null }, updateSlot: async (id, change) => { assert.equal(id, slot.id); const copy = structuredClone(slot); change(copy); slot = copy; } } });
  return { load, slot: () => slot, survey: load('@/lib/christmas/questionnaire'), access: load('@/lib/christmas/access') };
}
const answers = { peopleCount: 4, attendees: 'Two parents and Sam and Riley', children: [{ firstName: 'Sam', age: '6 years' }, { firstName: 'Riley', age: '18 months' }], outfits: 'Cream knits', mustHavePhotos: 'Siblings together', santaComfort: 'parent-close', comfortNotes: '', interests: 'Trains', treats: 'discuss', allergyNotes: '', accessNotes: '', letterNames: 'Sam and Riley', questions: '', consent: true };
test('private questionnaire requires paid booking and purpose-specific token', async () => {
  const h = harness(), row = h.slot(), key = h.access.accessToken(row.reservation, 'questionnaire');
  assert.ok(await h.survey.questionnaireStatus(row.id, key));
  assert.equal(await h.survey.questionnaireStatus(row.id, '0'.repeat(64)), null);
  assert.equal(await h.survey.questionnaireStatus(row.id, h.access.accessToken(row.reservation, 'confirmation')), null);
  const pending = harness('pending'); assert.equal(await pending.survey.questionnaireStatus(pending.slot().id, pending.access.accessToken(pending.slot().reservation, 'questionnaire')), null);
});
test('answers save privately and edits preserve original submission timestamp', async () => {
  const h = harness(), row = h.slot(), key = h.access.accessToken(row.reservation, 'questionnaire');
  assert.equal(await h.survey.saveQuestionnaire(row.id, key, answers), true);
  const first = h.slot().reservation.questionnaire.submittedAt;
  await h.survey.saveQuestionnaire(row.id, key, { ...answers, outfits: 'Burgundy and cream' });
  assert.equal(h.slot().reservation.questionnaire.submittedAt, first); assert.equal(h.slot().reservation.questionnaire.answers.outfits, 'Burgundy and cream');
  const publicResult = await h.survey.questionnaireStatus(row.id, key); assert.ok(!JSON.stringify(publicResult).includes('tokenHash'));
});
test('bad totals, oversized fields and missing guardian consent cannot replace answers', async () => {
  for (const changed of [{ peopleCount: 1 }, { consent: false }, { outfits: 'x'.repeat(1501) }]) {
    const h = harness(), row = h.slot(), key = h.access.accessToken(row.reservation, 'questionnaire');
    await assert.rejects(h.survey.saveQuestionnaire(row.id, key, { ...answers, ...changed })); assert.equal(h.slot().reservation.questionnaire, undefined);
  }
});
