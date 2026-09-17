import "server-only";
import { BlobPreconditionFailedError, get, list, put, del } from "@vercel/blob";
import type { Booking, PortalSettings } from "./types";

// All client data lives in the private Vercel Blob store `ca-client-portal`
// (region yul1, Montréal). Nothing here is public: every read goes through the
// server with the store token, and nothing is ever written to the git repo.
//
// Local development writes under `dev/` in the same store so test bookings
// never mix with real ones.

const PREFIX = process.env.PORTAL_BLOB_PREFIX ?? (process.env.VERCEL_ENV === "production" ? "" : "dev/");

const path = (p: string) => `${PREFIX}${p}`;

export class ConflictError extends Error {}

async function readText(pathname: string): Promise<{ text: string; etag: string } | null> {
  try {
    const res = await get(path(pathname), { access: "private", useCache: false });
    if (!res || res.statusCode !== 200) return null;
    const text = await new Response(res.stream).text();
    // Larger JSON is served compressed with a weak ETag (W/"…"); conditional
    // writes only accept the strong form, so every update would read as a conflict.
    return { text, etag: res.blob.etag.replace(/^W\//, "") };
  } catch (err) {
    if (err instanceof Error && /not.?found/i.test(err.name + err.message)) return null;
    throw err;
  }
}

export async function readJson<T>(pathname: string): Promise<{ data: T; etag: string } | null> {
  const r = await readText(pathname);
  return r ? { data: JSON.parse(r.text) as T, etag: r.etag } : null;
}

/** Write JSON. Pass `etag` to only overwrite that exact version, or `createOnly` to refuse overwriting. */
export async function writeJson(pathname: string, data: unknown, opts: { etag?: string; createOnly?: boolean } = {}) {
  try {
    return await put(path(pathname), JSON.stringify(data, null, 2), {
      access: "private",
      contentType: "application/json",
      addRandomSuffix: false,
      allowOverwrite: !opts.createOnly,
      ifMatch: opts.etag,
    });
  } catch (err) {
    if (err instanceof BlobPreconditionFailedError || (err instanceof Error && /already exists|precondition/i.test(err.message))) {
      throw new ConflictError(err.message);
    }
    throw err;
  }
}

export async function writeFile(pathname: string, body: Buffer | Uint8Array | string, contentType: string) {
  return put(path(pathname), Buffer.from(body as Uint8Array), {
    access: "private",
    contentType,
    addRandomSuffix: false,
    allowOverwrite: true,
  });
}

export async function readFile(pathname: string) {
  const res = await get(path(pathname), { access: "private", useCache: false });
  if (!res || res.statusCode !== 200) return null;
  return res;
}

export async function exists(pathname: string): Promise<boolean> {
  return (await readText(pathname)) !== null;
}

export async function remove(pathname: string) {
  await del(path(pathname));
}

async function listPathnames(prefix: string): Promise<string[]> {
  const out: string[] = [];
  let cursor: string | undefined;
  do {
    const page = await list({ prefix: path(prefix), cursor, limit: 1000 });
    out.push(...page.blobs.map((b) => b.pathname.slice(PREFIX.length)));
    cursor = page.hasMore ? page.cursor : undefined;
  } while (cursor);
  return out;
}

// ---------------------------------------------------------------- bookings

const bookingPath = (ref: string) => `bookings/${ref}.json`;

export const REF_PATTERN = /^AA-CA-\d{4}-\d{3,}$/;

export async function getBooking(ref: string): Promise<Booking | null> {
  if (!REF_PATTERN.test(ref)) return null;
  return (await readJson<Booking>(bookingPath(ref)))?.data ?? null;
}

export async function listBookings(): Promise<Booking[]> {
  const paths = (await listPathnames("bookings/")).filter((p) => p.endsWith(".json"));
  const all = await Promise.all(paths.map((p) => readJson<Booking>(p)));
  return all
    .filter((b): b is { data: Booking; etag: string } => !!b)
    .map((b) => b.data)
    .sort((a, b) => (a.event.date || "9999").localeCompare(b.event.date || "9999"));
}

export async function nextReference(year: string): Promise<string> {
  const paths = await listPathnames(`bookings/AA-CA-${year}-`);
  const max = paths.reduce((m, p) => {
    const n = Number(p.match(/-(\d+)\.json$/)?.[1] ?? 0);
    return Math.max(m, n);
  }, 0);
  return `AA-CA-${year}-${String(max + 1).padStart(3, "0")}`;
}

export async function createBooking(booking: Booking): Promise<void> {
  await writeJson(bookingPath(booking.ref), booking, { createOnly: true });
}

/**
 * Read, change, write back only if nobody else wrote in between. A webhook and
 * an admin edit landing at the same moment retry instead of overwriting each other.
 */
export async function updateBooking(ref: string, mutate: (b: Booking) => void | Promise<void>): Promise<Booking> {
  for (let attempt = 0; attempt < 5; attempt++) {
    const current = await readJson<Booking>(bookingPath(ref));
    if (!current) throw new Error(`Booking ${ref} not found`);
    const booking = current.data;
    await mutate(booking);
    booking.updatedAt = new Date().toISOString();
    try {
      await writeJson(bookingPath(ref), booking, { etag: current.etag });
      return booking;
    } catch (err) {
      if (!(err instanceof ConflictError)) throw err;
    }
  }
  throw new Error(`Booking ${ref} kept changing underneath the update; try again.`);
}

// ---------------------------------------------------------------- settings

const SETTINGS = "settings/portal.json";

export async function getSettings(): Promise<PortalSettings> {
  return (await readJson<PortalSettings>(SETTINGS))?.data ?? { insurance: null, updatedAt: "" };
}

export async function saveSettings(settings: PortalSettings) {
  settings.updatedAt = new Date().toISOString();
  await writeJson(SETTINGS, settings);
}
