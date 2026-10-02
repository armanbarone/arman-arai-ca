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
