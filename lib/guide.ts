import "server-only";
import { randomBytes } from "node:crypto";
import { promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";
import { readJson, writeJson } from "./portal/store";
import { SITE } from "./site";

/* A couple's wedding guide: the private page /guide/<id>, made the moment the
 * pricing form is sent and linked from the email that follows (owner,
 * 2026-10-01: "build a page on the fly and link it to the email, and then
 * ask for a call/msg").
 *
 * Only what the couple sent is stored, in the private `ca-client-portal` Blob
 * store with the rest of the client data, under a random 128-bit id that is
 * the only way to the page. Every word on the page is rendered from lib/site.ts
 * and the city's photographs; no model writes any of it, so nothing on it can
 * be invented about their venue or their date.
 *
 * A local build has no Blob token, so it writes to the machine's temp folder
 * instead. A deployment on Vercel always uses Blob, and if Blob fails the
 * guide is simply not made: the email then carries the price table instead. */

export type GuideRecord = {
  v: 1;
  id: string;
  createdAt: number;
  /** PRICING_MARKETS slug: "vancouver", "calgary"… */
  market: string;
  names: string;
  /** For the calendar's prefill only. Never printed on the page. */
  email: string;
  weddingDate?: string;
  weddingSeason?: string;
  location: string;
  coverage: string;
  budget: string;
  /** The form's second step, cleaned by cleanDayDetails. */
  guests?: string;
  setup?: string;
  priorities?: string[];
  note?: string;
};

const ID_PATTERN = /^[A-Za-z0-9_-]{22}$/;
const blobPath = (id: string) => `guides/${id}.json`;
const localDir = path.join(os.tmpdir(), "armanarai-ca-guides");
const useBlob = () => Boolean(process.env.BLOB_READ_WRITE_TOKEN || process.env.VERCEL);

export const guidePath = (id: string) => `/guide/${id}`;
export const guideUrl = (id: string) => `${SITE.url}${guidePath(id)}`;

function withTimeout<T>(work: Promise<T>, ms: number): Promise<T> {
  return Promise.race([work, new Promise<T>((_, reject) => setTimeout(() => reject(new Error(`timed out after ${ms} ms`)), ms))]);
}

/** The new guide's id, or null if it could not be saved. Never throws: a
 *  guide that fails must not cost the couple their inquiry. */
export async function createGuide(data: Omit<GuideRecord, "v" | "id" | "createdAt">): Promise<string | null> {
  const id = randomBytes(16).toString("base64url");
  const record: GuideRecord = { v: 1, id, createdAt: Date.now(), ...data };
  try {
    if (useBlob()) await withTimeout(writeJson(blobPath(id), record, { createOnly: true }), 5000);
    else {
      await fs.mkdir(localDir, { recursive: true });
      await fs.writeFile(path.join(localDir, `${id}.json`), JSON.stringify(record));
    }
    return id;
  } catch (error) {
    console.warn("Guide: could not be saved", error);
    return null;
  }
}

export async function readGuide(id: string): Promise<GuideRecord | null> {
  if (!ID_PATTERN.test(id)) return null;
  try {
    if (useBlob()) return (await readJson<GuideRecord>(blobPath(id)))?.data ?? null;
    return JSON.parse(await fs.readFile(path.join(localDir, `${id}.json`), "utf8")) as GuideRecord;
  } catch {
    return null;
  }
}

/* How the hours of each collection usually run. A shape, not a promise: the
 * page says plainly that the real timeline is built on the call. Every claim
 * in it comes from the collection itself in lib/site.ts (the family-photo
 * plan, Legacy's second photographer for four hours, the filmmaker for all
 * twelve of Photo + Film). */
export const DAY_PLAN: Record<string, { note?: string; rows: { part: string; what: string }[] }> = {
  signature: {
    rows: [
      { part: "Getting ready", what: "The final preparations, the details, and the people with you." },
      { part: "Portraits", what: "Time for the two of you, with simple direction and a location that fits the day." },
      { part: "Ceremony", what: "The arrivals, vows, reactions, and walk back down the aisle." },
      { part: "Family photographs", what: "The group photographs, organised around the list we prepare together." },
      { part: "Cocktail hour", what: "Candid photographs of your guests catching up and celebrating." },
      { part: "Reception", what: "Entrances, speeches, first dances, and the dance floor within your coverage." },
    ],
  },
  complete: {
    note: "Legacy includes a second photographer for four hours. We’ll decide together where that extra coverage is most useful.",
    rows: [
      { part: "Getting ready", what: "Preparations and details, with room for an earlier start." },
      { part: "First look and portraits", what: "A first look if you want one, and time for portraits without rushing." },
      { part: "Ceremony", what: "The arrivals, vows, reactions, and walk back down the aisle." },
      { part: "Family photographs", what: "The group photographs, organised around the list we prepare together." },
      { part: "Cocktail hour and the room", what: "Your guests together, plus the reception details before everyone sits down." },
      { part: "Reception", what: "Speeches, first dances, and more time on the dance floor, within your ten hours." },
    ],
  },
  "photo-film": {
    note: "Photo + Film includes a dedicated filmmaker alongside your photographer for all twelve hours.",
    rows: [
      { part: "Getting ready", what: "Preparations and the people around you, photographed and filmed." },
      { part: "First look and portraits", what: "Time for the two of you, with photography and film planned together." },
      { part: "Ceremony", what: "The vows and reactions, with an audio plan agreed beforehand." },
      { part: "Family photographs", what: "The group photographs, organised around the list we prepare together." },
      { part: "Cocktail hour", what: "Candid coverage of your guests and the celebration." },
      { part: "Reception", what: "Speeches, first dances, and the party, within your twelve hours of coverage." },
    ],
  },
};

/* What the guide promises for each thing a couple says matters most. The
 * same promises the email may make (lib/auto-reply-brief.ts), and nothing a
 * collection does not already include. */
export const PRIORITY_PROMISE: Record<string, { title: string; promise: string }> = {
  candid: { title: "Candid moments", promise: "I’ll keep direction to the parts of the day that need it, leaving room to photograph the reactions, conversations, and moments as they happen." },
  family: { title: "Family and friends", promise: "We’ll prepare your family-photo list together, then leave time for candid photographs of the people you’ve brought together." },
  portraits: { title: "Portraits of the two of you", promise: "You don’t need posing experience. I’ll give you simple direction and plan a manageable portrait window, so you can get back to your guests." },
  party: { title: "The party", promise: "We’ll align the coverage with your speeches, first dance, and time on the dance floor, so the celebration is part of the story." },
  film: { title: "Film of the day", promise: "Every collection includes a feature film. If film is a priority, Photo + Film adds a dedicated filmmaker for twelve hours and a plan for recording your vows and speeches." },
};

/** Which rows of the day plan each priority is about, so the guide can mark them. */
export const PRIORITY_PLAN_PARTS: Record<string, string[]> = {
  candid: ["Ceremony", "Cocktail hour", "Cocktail hour and the room"],
  family: ["Family photographs"],
  portraits: ["Portraits", "First look and portraits"],
  party: ["Reception"],
  film: [],
};

/* The reviews to show, led by the ones that speak to what matters to them.
 * Quotes are word for word from the screenshots (lib/reviews.ts). */
const REVIEW_BY_PRIORITY: Record<string, { n: number; who: string; quote: string }> = {
  candid: { n: 10, who: "Brian", quote: "He somehow caught all the little moments we didn’t even notice." },
  family: { n: 4, who: "Rachel", quote: "She said she never saw wedding photos this good all her life!" },
  portraits: { n: 8, who: "Samantha", quote: "Only one person understood our vision the way we were imagining it." },
  party: { n: 11, who: "Andrew", quote: "Thank you for an unforgettable night." },
  film: { n: 6, who: "Stephanie", quote: "I reposted the announcement video and now everyone is asking who our videographer was." },
};
const DEFAULT_REVIEWS = [
  { n: 10, who: "Brian", quote: "Every photo felt emotional and natural and full of life." },
  { n: 4, who: "Rachel", quote: "She said she never saw wedding photos this good all her life!" },
  { n: 1, who: "Justine", quote: "We are losing our mind over these previews." },
  { n: 5, who: "Brianna", quote: "It’s everything I ever wanted and more." },
];
export function reviewsFor(priorities: string[] = []) {
  const picked = priorities.map((p) => REVIEW_BY_PRIORITY[p]).filter(Boolean);
  for (const review of DEFAULT_REVIEWS) if (picked.length < 3 && !picked.some((r) => r.n === review.n)) picked.push(review);
  return picked.slice(0, 3);
}
