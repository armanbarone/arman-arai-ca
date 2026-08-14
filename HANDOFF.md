# armanarai.ca — handoff

Written 2026-08-13, at the end of the session that rebuilt this site. Read this
before touching anything. It exists because this conversation is about to be
compacted and the next session starts without the argument history.

---

## 1. What this is

Arman Arai runs **two** sites off one identity. They share an email
(`i@armanarai.com`), Instagram (`@iArmanArai`) and Pinterest, and nothing else.

| | **armanarai.com** | **armanarai.ca** (this repo) |
|---|---|---|
| Business | Elopement curation, worldwide | **Canadian weddings only** |
| Repo | `armanbarone/arman-arai-dark-20260506` | `armanbarone/arman-arai-ca` |
| Local | `x:\Vs Code\arman-arai-dark-20260506` | `x:\Vs Code\stillvows-website` ← folder name is stale, ignore it |
| Vercel | `arman-arai-dark-20260506` | **`canadian-weddings`** (`prj_ZUHBKMLJ4Qnv2u2GgeBCDUY7CW3o`) |
| R2 bucket | `website` → cdn.armanarai.com | **`canadian-wedding`** → cdn.armanarai.ca |

Team `team_0GV5RGkH6Bi25jynLMXA6XzR`. Canonical host is **www.armanarai.ca**
(apex 308s to www). Deploys are git-triggered from `main`.

**Never** put elopement curation, destination weddings, or any non-Canadian
location on the .ca. Never put Canadian weddings on the .com — those pages were
deliberately retired there.

This site began as "StillVows", a copy of the .com with a placeholder brand.
That name is dead and must never reappear.

---

## 2. Things I got wrong. Do not repeat these.

These cost real time and the owner had to catch most of them.

1. **I invented that he is bilingual.** The market research named bilingual
   FR/EN as the Montréal *positioning opportunity*; I wrote it up as a fact
   about him across 22 places including `schema.org knowsLanguage: fr-CA`.
   **He does not speak French.** A strategy document describes the market, not
   the person. Same class of error: I earlier invented "240+ weddings, 6
   countries, 12 years". If you cannot source a capability, ask or omit.

2. **I built the wrong pricing model.** I made three independent city ladders
   out of the *market research* workbook. The actual model is in
   `Arman_Arai_Canadian_Wedding_Model_Montreal_Base_2026.xlsx`. Then I showed it
   as "base + destination fee", and he was blunt: **there is no fee.** Each city
   shows one whole number with travel already inside it.

3. **I under-copied the fonts.** Copied the three families already present and
   stopped. The .com sets `html { font-size: 17px }`, which I never copied, so
   every rem here rendered 6% small. Compounded by nav links at `#5A5148` on
   `#080704` = **2.6:1 contrast**. "Copy the fonts" meant the root size and the
   colour system too.

4. **I shipped live 404s.** The nav rebuild linked `/experience` and `/faq`
   before those pages existed. Check every nav destination resolves before
   pushing a nav change.

5. **I wrote markup against class names I invented** while using CSS ported from
   the .com, which expects `.hub-tl-item` / `.hub-tl-when` / `.hub-tl-num`. Half
   my classes styled nothing and the layout collided. **When you port CSS, read
   the selectors and write markup to match them.**

6. **I resolved a scoped CSS variable against the wrong scope.** Inside `.hub`
   the .com redefines `--ink` to its *text* colour; globally `--ink` is the
   near-black button background. I used the global one, so the city name and
   every stat rendered `#1A1612` on `#080704`: invisible. Check for
   block-scoped `--var:` redefinitions before flattening.

7. **Two pages quoted different prices for a week.** The pricing page moved and
   `lib/blog.ts` did not. **Whenever the ladder changes, grep the journal.**

8. **My deploy check passed against a stale build.** I grepped for a CSS class;
   `experimental.inlineCss` inlines the stylesheet into the HTML, so the
   *selector* matched on the old deploy. **Always grep for visible copy, never a
   class name.**

9. **I stopped mid-tasklist to report.** He asked for a tasklist worked one by
   one. Finish it.

10. **Ragged image grid.** Alternating aspect ratios inside a 2-col grid: rows
    size to the tallest cell, so short cells leave gaps. Uniform aspect or
    proper masonry.

---

## 3. Architecture

**`lib/site.ts` is the single source of truth for commerce.** Prices, regions,
areas, market copy, FAQs. `/pricing`, the hubs, footer, nav, `llms.txt` and
`sitemap.xml` all read from it. **Never hard-code a price anywhere else.**

- `TIERS` — three collections, Montréal base: Core C$4,200 / 8h, Signature
  C$5,900 / 10h, Story Weekend C$8,200 / 12h over two days. An Essential 6h at
  C$3,200 exists in the workbook but is deliberately **off the public site**;
  quote on request only.
- `REGIONS` — seven, each with a travel cost folded into `quoteFor(region, tier)`.
  `PRIMARY_REGIONS` (Montréal, Toronto, Vancouver) get cards and their own page.
  `OTHER_REGIONS` go in one table at the bottom of `/pricing`.
- `ADDONS` — fifteen, grouped. **Social clips are NOT an add-on**; they are in
  every collection.

Live all-in prices (Core / Signature / Story Weekend):

| Montréal | Toronto | Vancouver+Whistler+Island | Townships | Québec City | Niagara/Muskoka | Banff |
|---|---|---|---|---|---|---|
| 4,200 / 5,900 / 8,200 | 6,450 / 8,150 / 10,850 | 8,250 / 9,950 / 12,850 | 5,150 / 6,850 / 9,550 | 5,550 / 7,650 / 10,300 | 6,850 / 8,550 / 11,300 | 8,300 / 10,000 / 12,900 |

**Other key files**

- `lib/hubs.ts` — long-form hub prose (hero, 3 claims, venues, seasons, day).
  Deliberately separate from `site.ts` so a price change never edits prose.
- `lib/images.ts` — every photograph, with alt text written once. `CDN_BASE` and
  the `TRANSFORMS` flag live here.
- `lib/galleries.ts` — the four wedding albums (191 frames) ported from the .com.
- `lib/blog.ts` — 9 posts. Body is HTML; the template splits on `<h2>`, so
  **every h2 needs its own `<figure>`** or that section loses its 50/50 row.
- `lib/gazette-parse.ts` — that splitter.
- `cloudflareLoader.ts` — custom next/image loader. `TRANSFORMS = true`;
  Cloudflare Image Transformations are enabled on the .ca zone. If images ever
  404 en masse, flip it false to serve originals.

**Routes:** `/`, `/experience`, `/portfolio`, `/galleries` + `/galleries/<slug>`,
`/pricing`, `/faq`, `/about`, `/reviews`, `/contact`, `/blog` + `/blog/<slug>`,
`/{montreal,toronto,vancouver}-wedding-photographer`, `/privacy-policy`,
`/terms-of-service`, plus `sitemap.xml`, `robots.txt`, `llms.txt`.

**Nav** mirrors the .com: Experience · Portfolio ▾ (Portfolio, Galleries) ·
Weddings ▾ (mega menu) · Pricing · Journal · FAQ ▾ (FAQ, About, Reviews) ·
Inquire.

**Design tokens** (`tailwind.config.ts`, matching the .com's dark theme):
`slate #857060` (--dim), `blush #A89480` (--dim-soft), `rose #B8956A`,
`cream #E8E0D0`, bg `#080704`. `html` is **17px**. Nav links are `#C4A46A`.
Body copy must clear 4.5:1; the values this repo shipped with did not.

---

## 4. R2 layout (`canadian-wedding`, served at cdn.armanarai.ca root)

```
home/            hero, grid and film-strip frames (from GoHighLevel)
about/           real photographs of Arman working  ← most valuable assets
portfolio/{editorial,film,analogue,documentary,dreamy-fine-art}/
cities/{toronto,montreal,vancouver}/…              real Canadian locations
galleries/<slug>/                                   the four wedding albums
reviews/proof-01..12.png                            real client-message screenshots
journal/
archive/destination/  camels, Dubai, Amalfi — kept, deliberately UNUSED
```

351 MB of GoHighLevel PNGs became 23.4 MB of WebP. Write creds are in the
`reference-r2-access` memory. **Only ever write to `canadian-wedding`** —
`website` is the .com. There is a legacy mirror at `website/ca/…` from before
cdn.armanarai.ca existed; it is now unused and could be deleted.

---

## 5. What is done

Everything in this list is live and was verified with a real HTTP check.

- Repo renamed, deploys flowing to `canadian-weddings`, Vercel Analytics on
  **both** sites.
- All StillVows branding gone. Favicon copied from the .com.
- Full .com font system, root size, colour tokens, footer (exact structure),
  and the Gazette journal layout including the blackletter nameplate.
- `/pricing` rebuilt on the real model with photographs, three city cards,
  everywhere-else table, 15 add-ons, process and FAQ.
- Three city hubs on the ported `hub-` structure, each with hero + stat rail +
  section index + claims + venues + seasons + day timeline + **albums** +
  prices + **journal** + FAQ.
- `/portfolio` with the five albums named as on the .com: I Editorial,
  II Film Inspired, III 1980s Film, IV Dreamy Fine Art, V Documentary.
- `/galleries` (+4 album pages) with the .com masthead. `/case-studies` 301s here.
- `/experience`, `/faq`, `/about`, `/reviews`, `/contact`, legal pages.
- Homepage: hero, philosophy, film strip, selected work, why-this-way,
  how-the-day-runs, what-comes-back, in-their-words, three photographic city
  cards. **No pricing block** — that was removed on request.
- 9 journal posts incl. Whistler, Vancouver Island/Tofino, outside-Toronto.
- SEO: sitemap, robots, llms.txt, and schema across every page type.
- Every bilingual/French claim removed.
- **New skill** `wedding-image-generator` (in `.claude/skills/` and
  `.agents/skills/`): 2k Nano Banana Pro, staged-wedding register, writes to
  `canadian-wedding`.

---

## 6. What still needs doing

Roughly in priority order.

### Known-wrong content (fix first, these contradict the live site)

- **`app/about/page.tsx:42`** still promises "the full gallery in six to eight
  weeks". The real times are 5–7 weeks Core, 4 Signature, 3 Story Weekend.
- **`app/terms-of-service/page.tsx`** was ported from the .com and never
  reconciled: it promises "sneak peek within 5 days", "full gallery within 3
  weeks" and a "cinematic film within 6 to 8 weeks". This site has no film
  product, and the previews are 48h / next-day / 24h. **This is a contract
  page; it is the worst place on the site to be wrong.**
- `/privacy-policy` had a blunt find-and-replace of elopement→wedding applied.
  Re-read it for nonsense.

### Owner input needed (blocked on Arman)

- **`/reviews` has no written testimonials**, only the real screenshots. I will
  not invent them. Ask for 3–5 real wedding quotes with names/locations, then
  add `Review` + `AggregateRating` schema.
- **Vancouver at C$8,250 Core** is straight from the workbook but is a big jump
  from Montréal. Confirm he is happy advertising it.
- Whether the old `stillvows-website` Vercel project should be deleted — it is
  still linked to the same repo and double-deploys every push.

### Real work outstanding

- **The wedding image skill has never been run.** Every photograph on the site
  is inherited from the .com or from GoHighLevel. Generating genuinely Canadian
  wedding imagery per city is the biggest remaining quality win.
- **Archivo and IBM Plex Mono are loaded and never used** (1 reference each,
  both in the layout comment). Either use them or drop them; they are two
  font families on every page load for nothing.
- More journal posts. Toronto neighbourhoods/venues, Montréal venues, and
  per-venue guides are the obvious SEO gaps.
- No IndexNow on the .ca. The .com has it automated via a GitHub Action; worth
  porting.
- `/stories` still exists as a redirect stub to `/blog`.
- Off-page SEO entirely untouched.

---

## 7. How to verify anything

```bash
cd "x:\Vs Code\stillvows-website"
npm run build                       # must compile clean
npx tsc --noEmit                    # must be silent

# screenshots — pkill does NOT work here, always use a fresh port
npx next start -p 3999 &
CHROME="/c/Users/arman/AppData/Local/ms-playwright/chromium-1217/chrome-win64/chrome.exe"
"$CHROME" --headless=new --disable-gpu --no-sandbox --hide-scrollbars \
  --virtual-time-budget=11000 --window-size=1440,2400 \
  --screenshot=shot.png "http://localhost:3999/pricing"
```

**Then actually Read the screenshot.** Three separate layout bugs on this
project were invisible in the HTML and obvious in the pixels.

Deploy check — grep for **visible copy**, never a class name:

```bash
until curl -s -A 'Mozilla/5.0' https://www.armanarai.ca/pricing \
  | grep -q "Three collections"; do sleep 20; done
```

Commit as `Arman Arai <90718947+armanbarone@users.noreply.github.com>` or Vercel
marks the deploy BLOCKED.

---

## 8. His feedback, in his words

- Prices must be whole numbers per city. No "fee", no "from".
- Social content in every package: fun vertical videos to post right away,
  to keep people engaged until the album and film arrive.
- Wedding photographs are **staged and composed**; elopement photographs are
  **wild and free**. They must not look alike.
- "This is a wedding photography website for godsake" — sections must be
  visually appealing. Text pills and walls of prose are not acceptable where a
  photograph belongs.
- Copy the .com exactly where he says copy: fonts, sizes, footer, layouts.
- He serves Whistler, Vancouver Island and the areas outside Toronto. Say so.
