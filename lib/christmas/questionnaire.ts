import "server-only";
import { authorized, bookingLink } from "./access";
import { inventoryStore, updateSlot } from "./store";
import { SLOT_PATTERN } from "./inventory";
import { familyQuestionnaireSchema } from "./questionnaire-schema";
async function checked(slotId: string, token: string) {
  if (!SLOT_PATTERN.test(slotId)) return null;
  const row = await inventoryStore.read(slotId), r = row?.data.reservation;
  return row && r?.status === "paid" && authorized(r, "questionnaire", token) ? row.data : null;
}
export async function questionnaireStatus(slotId: string, token: string) {
  const slot = await checked(slotId, token), r = slot?.reservation;
  if (!slot || !r) return null;
  return { date: slot.date, time: slot.time, name: r.name.split(/\s+/)[0], letterNames: r.delivery?.letterNames ?? "", answers: r.questionnaire?.answers ?? null, submittedAt: r.questionnaire?.submittedAt, updatedAt: r.questionnaire?.updatedAt, confirmationUrl: bookingLink(slot.id, r, "confirmation") };
}
export async function saveQuestionnaire(slotId: string, token: string, input: unknown) {
  if (!(await checked(slotId, token))) return false;
  const answers = familyQuestionnaireSchema.parse(input), now = Date.now();
  await updateSlot(slotId, slot => {
    const r = slot.reservation;
    if (!r || r.status !== "paid" || !authorized(r, "questionnaire", token)) throw Error("This questionnaire link is no longer valid.");
    r.questionnaire = { answers, submittedAt: r.questionnaire?.submittedAt ?? now, updatedAt: now };
  });
  return true;
}
