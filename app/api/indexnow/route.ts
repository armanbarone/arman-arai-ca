import { NextResponse } from "next/server";
import sitemap from "@/app/sitemap";

/* IndexNow for armanarai.ca, ported from the .com.
 *
 * The URL list is DERIVED FROM THE SITEMAP rather than hand-kept. On the .com
 * the two lists drifted badly: IndexNow was still submitting deleted routes and
 * missing several live hubs. One source, no drift.
 *
 * The key file must be reachable at ${base}/${KEY}.txt or IndexNow rejects the
 * submission, which is why public/86ecaa26c9f0918385223cda4b676d95.txt exists
 * and contains exactly the key and nothing else. This key is specific to
 * armanarai.ca; the .com has its own.
 *
 * POST is protected by INDEXNOW_SECRET, set as an env var on the
 * `canadian-weddings` Vercel project and as a repo secret on arman-arai-ca.
 * Without it the route 401s and the GitHub Action skips rather than failing.
 * GET is unauthenticated and read-only, for checking what would be submitted.
 */

const KEY = "86ecaa26c9f0918385223cda4b676d95";
const WWW = "https://www.armanarai.ca";
const NONWWW = "https://armanarai.ca";

function getPathList(): string[] {
  return sitemap().map((entry) => new URL(entry.url).pathname.replace(/\/$/, ""));
}

async function submitBatch(host: string, base: string, paths: string[]) {
  const urlList = paths.map((p) => `${base}${p}`);
  const res = await fetch("https://api.indexnow.org/indexnow", {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify({
      host,
      key: KEY,
      keyLocation: `${base}/${KEY}.txt`,
      urlList,
    }),
  });
  return { host, status: res.status, count: urlList.length };
}

export async function POST(request: Request) {
  const { secret } = await request.json().catch(() => ({}));
  if (!process.env.INDEXNOW_SECRET || secret !== process.env.INDEXNOW_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const paths = getPathList();
  const [wwwResult, nonWwwResult] = await Promise.all([
    submitBatch("www.armanarai.ca", WWW, paths),
    submitBatch("armanarai.ca", NONWWW, paths),
  ]);

  return NextResponse.json({
    totalUrls: paths.length,
    results: [wwwResult, nonWwwResult],
  });
}

export async function GET() {
  const paths = getPathList();
  // Buckets are exclusive and evaluated in order: two journal slugs also end in
  // "-wedding-photographer", so testing that first would count them twice.
  const bucketOf = (p: string) =>
    p.startsWith("/blog/") ? "journal"
    : p.startsWith("/galleries/") ? "albums"
    : p.endsWith("-wedding-photographer") ? "cities"
    : "other";

  const breakdown = paths.reduce<Record<string, number>>((acc, p) => {
    const b = bucketOf(p);
    acc[b] = (acc[b] ?? 0) + 1;
    return acc;
  }, {});

  return NextResponse.json({
    total: paths.length,
    breakdown,
    wwwUrls: paths.map((p) => `${WWW}${p}`),
  });
}
