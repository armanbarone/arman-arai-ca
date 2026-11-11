import { z } from "zod";
export const familyQuestionnaireSchema = z.object({
  availabilityPreferences: z.string().trim().max(1500).optional(),
  peopleCount: z.number().int().min(1).max(12),
  attendees: z.string().trim().min(2).max(1000),
  children: z.array(z.object({ firstName: z.string().trim().min(1).max(60), age: z.string().trim().max(30) })).max(10),
  outfits: z.string().trim().max(1500),
  mustHavePhotos: z.string().trim().max(1500),
  santaComfort: z.enum(["excited", "warm-up", "parent-close", "family-only", "unsure"]),
  comfortNotes: z.string().trim().max(1500),
  interests: z.string().trim().max(1000),
  treats: z.enum(["yes", "skip", "discuss"]),
  allergyNotes: z.string().trim().max(1000),
  accessNotes: z.string().trim().max(1000),
  letterNames: z.string().trim().min(1).max(160),
  questions: z.string().trim().max(1500),
  consent: z.literal(true),
}).refine(a => a.children.length <= a.peopleCount, { message: "The number of children cannot exceed the number being photographed.", path: ["peopleCount"] });
export type FamilyQuestionnaire = z.infer<typeof familyQuestionnaireSchema>;
export const SANTA_CHOICES = { excited: "Excited to meet Santa", "warm-up": "May need time to warm up", "parent-close": "Keep a parent close", "family-only": "Start with family photos; Santa at a distance", unsure: "Not sure yet" } as const;
export const QUESTIONNAIRE_LABELS: Record<string, string> = {
  availabilityPreferences: "Preferred days and times", peopleCount: "People being photographed", attendees: "Who is coming / relationships", children: "Children and approximate ages", outfits: "Outfits and colours", mustHavePhotos: "Must-have photographs / groupings", santaComfort: "Comfort with Santa", comfortNotes: "What helps everyone feel comfortable", interests: "Interests / favourite things", treats: "Cookies and warm milk", allergyNotes: "Food notes (optional)", accessNotes: "Arrival / access requests (optional)", letterNames: "Names for Santa’s letter", questions: "Other questions",
};
