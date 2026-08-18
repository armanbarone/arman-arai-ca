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

The .ca sells **Canadian weddings**; the .com sells elopement curation. Keep the
two offers apart: do not advertise elopement curation here, and do not advertise
Canadian weddings there.

**That is a positioning rule about what is SOLD, not a ban on where a photograph
was taken.** Arman's back catalogue includes weddings outside Canada and they
belong in the galleries. Do not remove, hide or relabel a real wedding because
of its location, and do not treat this paragraph as authority to delete
anything. If you think content should go, ask him.

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

11. **I said "no fee" on the pricing page and left the word everywhere else.**
    After he rejected the base-plus-fee framing I fixed `/pricing` and stopped.
    The hub prose, the contact page and `llms.txt` still said a "C$2,250
    destination fee" for months. **When a framing is rejected, grep the whole
    repo for it, not just the page he was looking at.** `lib/site.ts` now
    carries that rule at the top of the file.

12. **The Toronto hero and the Toronto body copy were the same paragraph.**
    `hubs.ts lead[0]` and `site.ts MARKETS.body[0]` opened with identical
    sentences, so the page said the same thing twice, four screens apart. Those
    two files are edited separately and nothing checks them against each other.

13. **Prose in a `max-width` column inside a full-width section.** The hub body
    copy sat in 68ch with the right half of the section empty, which is exactly
    the "half-assed" look he objected to. Anything full-width needs either a
    second column or a photograph beside it.

14. **I picked a hero from its alt text and never looked at the crop.**
    `/experience` used a tight two-face close-up as a full-bleed hero. Cropped
    to a wide band it was half a face. **Before using any photograph as a wide
    hero, render the actual `object-fit: cover` crop and look at it.** The
    contact-sheet script that does this is in the scratchpad pattern: fetch at
    width=900, crop to 1920/640, tile the candidates, read the PNG.

    The second half of the same lesson: a subject standing large and centred
    cannot be cleared by any vertical `objectPosition`. Move the headline off
    centre instead. Three crop positions were tried and photographed before
    that was obvious.

15. **A headline that describes nothing.** "What it is like to be photographed"
    survived on `/experience` for weeks. The page is six chapters from the first
    call to the delivered gallery, and the headline now says so. If a headline
    would fit on any photographer's site, it is not a headline.

16. **I invented a rule, wrote it into this file, then cited this file as if he
    had said it.** I turned "the .ca is Canadian weddings" into "never any
    non-Canadian location on the .ca", put it in §1 as an absolute, and months
    later used it to justify deleting two real client galleries he had never
    asked me to touch. He had not said it. I had.

    Two separate failures and both are worth naming. **A rule I wrote is not a
    rule he gave.** This document records decisions; it does not create
    authority, and anything in it that is not traceable to something he actually
    said should be treated as my opinion. And **deleting a client's work is not
    a cleanup**: it is destructive and outward-facing, so it needs asking first,
    every time, no matter how well the rule seems to fit.

---

## 3. Architecture

**`lib/site.ts` is the single source of truth for commerce.** Prices, regions,
areas, market copy, FAQs. `/pricing`, the hubs, footer, nav, `llms.txt` and
`sitemap.xml` all read from it. **Never hard-code a price anywhere else.**

- `TIERS` — three collections, identical everywhere. Core 8h, Signature 10h
  with a second shooter for six, Story Weekend 12h over two days.
- `REGIONS` — **three** published regions, each with its own `prices` map and a
  `covers` list. Each figure already contains travel and accommodation.
  Everything outside them is `OUTER_REGIONS_NOTE`: quoted on request, never
  guessed. Muskoka, Prince Edward County, Vancouver Island and the Rockies are
  all outer.
- `ADDONS` — fifteen. **A feature film and film prints are NOT add-ons**; they
  are in every collection.

Live prices (Core / Signature / Story Weekend), from the 2027 sheets:

| Montréal + Québec | Toronto + S. Ontario | Vancouver + Sea-to-Sky |
|---|---|---|
| 4,000 / 5,500 / 7,000 | 4,000 / 6,000 / 8,500 | 4,500 / 6,500 / 9,000 |

Montréal's price also buys the Laurentians, the Townships, Québec City and
Charlevoix. Toronto's also buys Niagara and the 1000 Islands. Vancouver's also
buys the North Shore, Squamish and Whistler.

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
- **15 journal posts, 22,000 words**, every one over 1,280 words with a figure
  per `<h2>` and no image repeated inside a post. The six added on 2026-08-14
  are: twenty Vancouver photo locations (with the permit rules), Prince Edward
  County venues, Niagara Parks venues, Muskoka, a winter Montréal wedding, and
  what a multi-day South Asian wedding costs in the GTA. All 106 referenced
  images were HTTP-verified against the bucket.
- SEO: sitemap, robots, llms.txt, and schema across every page type.
- Every bilingual/French claim removed.
- **New skill** `wedding-image-generator` (in `.claude/skills/` and
  `.agents/skills/`): 2k Nano Banana Pro, staged-wedding register, writes to
  `canadian-wedding`.
- Legal pages reconciled with this business: `/terms-of-service` no longer
  sells destination weddings, the Adventuremoon or a cinematic film, and its
  delivery table is generated from the real per-collection times. The privacy
  policy no longer claims Calendly, Meta Pixel, GA4, Google Ads or Tag Manager,
  none of which this site loads; the real stack is Resend, Vercel and Cloudflare
  and the site sets no analytics or advertising cookies.
- **IndexNow**, ported from the .com: `app/api/indexnow/route.ts` derives its
  URL list from `sitemap.ts` so the two cannot drift, the key file is at
  `public/86ecaa26c9f0918385223cda4b676d95.txt`, and
  `.github/workflows/indexnow.yml` fires on a successful production deployment.
  Needs `INDEXNOW_SECRET`; see §6.
- Archivo and IBM Plex Mono dropped. On the .com they are used only by the
  `promo/` components, which do not exist here, so they were two font families
  downloading on every page for nothing.
- **`<Clip>` video component**, on BOTH sites, `/galleries` only. Server
  component, zero client JS, styles inside the component so they never reach
  globals.css (which `inlineCss` puts on every route). `lib/clips.ts` is empty,
  so the feature is currently inert: a before/after build diff showed **zero
  route-size change on either site**. See §9 before adding a clip.

---

## 6. What still needs doing

Roughly in priority order.

### Owner input needed (blocked on Arman)

- **The three new galleries have no dates.** `luca-lauren`, `nicole-js` and
  `parsa-marjan` carry a season rather than a month and year, because the files
  have no EXIF and inventing a date on a client's gallery is not acceptable.
  Send the real ones and they drop straight into `lib/galleries.ts`.
- **Social clips are gone from every collection**, replaced by the feature film
  and the film prints, because that is what the 2027 sheets say. He had
  previously insisted social clips be in every package. If both are meant to be
  included, say so and they go back.

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
  wedding imagery per city is the biggest remaining quality win. Two gaps in
  the bucket are conspicuous: **there is no photograph of Toronto or Montréal
  the city** (Toronto's `cities/` folder is Niagara, Muskoka, PEC and Killarney
  only), so both hubs lean on portfolio frames for anything urban.
- Journal gaps that remain: Toronto neighbourhoods, Montréal venue guides,
  Québec City / Charlevoix, and the Eastern Townships.
- **`INDEXNOW_SECRET` is not set anywhere yet.** The route and the Action are
  in place but inert until it exists in two places: as an env var on the
  `canadian-weddings` Vercel project, and as a repo secret on `arman-arai-ca`.
  Use the same value as the .com. Until then POST /api/indexnow returns 401 and
  the Action skips itself rather than failing.
- `/stories` still exists as a redirect stub to `/blog`.
- Off-page SEO entirely untouched.

### Legal copy that a lawyer, not I, should confirm

`/terms-of-service` was rewritten on 2026-08-14 to match this business rather
than the .com's. Two changes were judgement calls:

- **Governing law is now Québec** (it said British Columbia for Canadians and
  Colombia for everyone else, which was the .com's clause). Québec follows from
  `SITE.base`. It should be confirmed rather than assumed.
- **Payment is now the 30% retainer** with the balance before the date. The page
  had said full payment upfront, which contradicted `/pricing`, `/faq` and
  `llms.txt`, all three of which say 30%. The three agreeing pages won.

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

Two things that make a live grep report a false failure:

- `experimental.inlineCss` inlines the whole stylesheet into the HTML, so a
  **class name matches on any deploy, including a stale one.**
- React SSR inserts a comment between a literal and an expression, so JSX
  written `On the day, in {m.city}` arrives as
  `On the day, in <!-- -->Toronto`. **Grep a substring that lies entirely on
  one side of the interpolation**, or match the `<!-- -->` explicitly.

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

---

## 9. Video clips on /galleries

Arman asked about dropping 6–10 MB GIFs onto the galleries pages. Measured
answer: one 8 MB GIF is ~32x this site's heaviest photograph and ~3x its entire
homepage, and it decodes on the main thread. The same loop as WebM is
200–600 KB with GPU decode. So this was built as video, not GIF.

**The constraint he set: galleries pages only, and do not touch the speed of
anything else, especially the .com.** How that is honoured:

- `components/Clip.tsx` is a **server component**. A muted autoplaying loop
  needs no JavaScript, so it contributes nothing to any client bundle. Do not
  add `"use client"` and do not add an IntersectionObserver — the browser
  already defers autoplay for offscreen video and `preload="none"` means only
  the poster is fetched until the clip is on screen.
- It is rendered from `app/galleries/page.tsx` (a server component) and **not**
  from inside `AlbumStrips` / `GalleriesHub`, which are client components.
  Rendering it there would pull it into the client bundle.
- Its CSS lives in a `<style>` inside the component, not in `globals.css`. Both
  sites run `experimental.inlineCss`, which inlines the entire stylesheet into
  every page's HTML, so a rule in globals.css is paid for on every route.
- `lib/clips.ts` exports an empty `CLIPS` map and `hasClips`, so the whole
  section is absent until a clip is uploaded.

**Verified:** a `git stash` before/after build diff of the full route table
showed **no size change on any route of either site**, `/galleries` included.
Re-run that check after adding real clips:

```bash
git stash -q -u && npm run build 2>&1 | grep -E "^[┌├└]" > /tmp/before.txt
git stash pop -q && npm run build 2>&1 | grep -E "^[┌├└]" > /tmp/after.txt
diff /tmp/before.txt /tmp/after.txt
```

Encoding and upload instructions are in the header comment of `lib/clips.ts`
on each site. **Keep each clip under ~1 MB** or the whole exercise is pointless.
