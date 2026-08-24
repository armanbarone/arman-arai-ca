#!/usr/bin/env node
/*
 * Content-freshness audit for lib/blog.ts.
 *
 * This does NOT touch any post's date. Google's Search Central guidance
 * ("Are you changing the date of pages to make them seem fresh when the
 * content has not substantially changed?") and Bing's freshness evaluation
 * both treat date-only bumps as noise at best and a manipulative signal at
 * worst — Mueller has called it "just noise and useless." The only date
 * change that helps is one that comes with a real edit: a corrected fact,
 * an updated price, a fixed dead link, a new section.
 *
 * So this script only surfaces candidates for a human (or a future editing
 * pass) to actually rewrite. Run it, read the flagged context lines, decide
 * whether the post needs a real update. If you make one, update `date` by
 * hand as part of that edit — never on its own.
 *
 * Usage: node scripts/freshness-audit.mjs
 */
import { fileURLToPath, pathToFileURL } from "node:url";
import path from "node:path";

process.removeAllListeners("warning"); // silence the harmless CJS/ESM notice for lib/blog.ts

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const blogUrl = pathToFileURL(path.join(__dirname, "..", "lib", "blog.ts")).href;
const { posts } = await import(blogUrl);

const today = new Date();
const currentYear = today.getFullYear();
const CONTEXT = 45;
const OLDEST_UNFLAGGED_LIMIT = 15;

function stripHtml(html) {
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

// Any 4-digit year below the current one, found in reader-visible text
// (tags and attributes are stripped first, so CDN filenames like
// ".../2018-weddings-..." never trigger a false hit). Shown with context
// so a human can tell an expired claim ("for the 2025 season") from an
// intentional anecdote ("we married in 2019") at a glance.
function findYearMentions(text) {
  const hits = [];
  const re = /\b(20\d{2})\b/g;
  let m;
  while ((m = re.exec(text))) {
    const year = Number(m[1]);
    if (year < currentYear) {
      const start = Math.max(0, m.index - CONTEXT);
      const end = Math.min(text.length, m.index + m[1].length + CONTEXT);
      hits.push({ year, context: text.slice(start, end).trim() });
    }
  }
  return hits;
}

const rows = posts.map((p) => {
  const ageDays = Math.floor((today - new Date(p.date)) / 86_400_000);
  const yearHits = findYearMentions(stripHtml(p.body || ""));
  return { slug: p.slug, title: p.title, date: p.date, ageDays, yearHits };
});

const flagged = rows.filter((r) => r.yearHits.length > 0).sort((a, b) => b.ageDays - a.ageDays);
const unflagged = rows.filter((r) => r.yearHits.length === 0).sort((a, b) => b.ageDays - a.ageDays);

const fmt = (r) => `${(r.ageDays / 30.44).toFixed(1)}mo`;

console.log(`Content-freshness audit — armanarai.ca — ${today.toISOString().slice(0, 10)}`);
console.log(`${posts.length} posts total. This is a triage list, not an action list.\n`);

console.log(`== Flagged: body text mentions a year before ${currentYear} (${flagged.length}) ==`);
if (flagged.length === 0) console.log("(none)");
for (const r of flagged) {
  console.log(`\n${r.slug}  [published ${r.date}, ${fmt(r)} ago]`);
  console.log(`  ${r.title}`);
  for (const h of r.yearHits) console.log(`  - ${h.year}: "...${h.context}..."`);
}

console.log(`\n\n== Oldest posts with no year-mention flag, top ${OLDEST_UNFLAGGED_LIMIT} (age alone isn't a reason to edit — but worth a skim) ==`);
for (const r of unflagged.slice(0, OLDEST_UNFLAGGED_LIMIT)) {
  console.log(`${r.slug}  [published ${r.date}, ${fmt(r)} ago]  ${r.title}`);
}
