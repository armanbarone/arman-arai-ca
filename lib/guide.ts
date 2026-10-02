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
      { part: "Getting ready", what: "The last hour before you leave: the details, getting dressed, the people closest to you." },
      { part: "Portraits", what: "Time for the two of you, before or after the ceremony, wherever the light is kindest." },
      { part: "Ceremony", what: "All of it, from the walk in to the walk out." },
      { part: "Family photographs", what: "Run from the family-photo plan we make beforehand, so it takes minutes, not the afternoon." },
      { part: "Cocktail hour", what: "Your guests, candid, while you finally get a drink." },
      { part: "Reception", what: "Entrances, speeches, your first dance and the start of the dancing." },
    ],
  },
  complete: {
    note: "A second photographer joins for four hours, placed where two angles matter most. We choose where together.",
    rows: [
      { part: "Getting ready", what: "From earlier in the day, with time for the details and the people around you." },
      { part: "First look and portraits", what: "Unhurried time for the two of you, with room to move to a second spot." },
      { part: "Ceremony", what: "All of it, from the walk in to the walk out." },
      { part: "Family photographs", what: "Run from the family-photo plan we make beforehand, so it takes minutes, not the afternoon." },
      { part: "Cocktail hour and the room", what: "Your guests, candid, and the room before anyone sits down." },
      { part: "Reception", what: "Entrances, speeches, your first dance and well into the dancing." },
    ],
  },
  "photo-film": {
    note: "A dedicated filmmaker is there for all twelve hours, beside me.",
    rows: [
      { part: "Getting ready", what: "From the start of the morning." },
      { part: "First look and portraits", what: "Photographed and filmed, side by side." },
      { part: "Ceremony", what: "All of it, on camera and on film." },
      { part: "Family photographs", what: "Run from the family-photo plan we make beforehand, so it takes minutes, not the afternoon." },
      { part: "Cocktail hour", what: "Your guests, candid." },
      { part: "Reception", what: "Speeches, your first dance and the dance floor, through to the end of the night." },
    ],
  },
};

/* What the guide promises for each thing a couple says matters most. The
 * same promises the email may make (lib/auto-reply-brief.ts), and nothing a
 * collection does not already include. */
export const PRIORITY_PROMISE: Record<string, { title: string; promise: string }> = {
  candid: { title: "Candid moments", promise: "Most of the day I stay out of your way and watch. The glance before the vows, the friend who cries first, the laugh you won’t remember having: I’m already standing where they happen." },
  family: { title: "Family and friends", promise: "We plan the family photographs together before the day, name by name, so they take minutes and everyone gets back to the party. In between, I photograph your people the way they really are with you." },
  portraits: { title: "Portraits of the two of you", promise: "You don’t need to know how to pose. I’ll give you clear, simple direction, where to stand and what to do with your hands, and you’ll still look like yourselves. The engagement session in every collection is where I learn how the two of you actually stand." },
  party: { title: "The party", promise: "The entrances, the speeches, the first dance and the dance floor. Film prints go into your guests’ hands on the night, and your reels arrive in the first week, while everyone is still talking about it." },
  film: { title: "Film of the day", promise: "Every collection includes a feature film. Photo + Film goes further: a dedicated filmmaker beside me for all twelve hours, with your vows or speeches in the film wherever the audio comes back clean." },
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

