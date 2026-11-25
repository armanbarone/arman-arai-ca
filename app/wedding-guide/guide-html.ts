/* The wedding guide, from the design the owner uploaded on 2026-11-24 to
 * replace the previous one. His HTML is reproduced here as it was written,
 * with four deliberate exceptions, all of them interpolations:
 *
 *   - the three collection prices, read from lib/site.ts, so this page cannot
 *     drift from the one place prices live. Every other figure in the guide
 *     (the add-ons, the album sizes) is literal, and guide.test.cjs checks
 *     each one against lib/site.ts on every run.
 *   - the market comparison, which he moved out of the welcome email on the
 *     same day. It sits at the end of the investment section, above the link
 *     to /pricing.
 *
 * His fonts and photographs arrived inline as base64, about 3MB of them. They
 * are files under /public/wedding-guide/v2 now, because this route is served
 * no-store and a couple opening the guide twice would otherwise download the
 * fonts twice.
 *
 * Because the file is one template literal, a stray backtick or ${ in the copy
 * would be read as code. Both are escaped. If you are editing the copy here by
 * hand rather than regenerating, keep that in mind.
 */
import { marketComparisonHtml } from "@/lib/market-comparison";
import { tierBySlug } from "@/lib/site";

const money = (amount: number) => `C$${amount.toLocaleString("en-CA")}`;
const SIGNATURE = tierBySlug("signature")!;
const LEGACY = tierBySlug("complete")!;
const PHOTO_FILM = tierBySlug("photo-film")!;

const guideHtml = /* html */ `<!doctype html>
<html lang="en-CA">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="robots" content="noindex,nofollow">
  <meta name="theme-color" content="#080704">
  <link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' fill='%23080704'/%3E%3Ctext x='13' y='47' fill='%23b8956a' font-family='Georgia' font-size='44'%3EA%3C/text%3E%3C/svg%3E">
  <meta name="description" content="A guide to wedding photography with Arman Arai. Explore my approach, wedding-day coverage, collections and how to book.">
  <meta property="og:type" content="website">
  <meta property="og:title" content="The Wedding Experience | Arman Arai">
  <meta property="og:description" content="A guide to the photography, the wedding day and everything that goes into remembering it.">
  <meta property="og:url" content="https://www.armanarai.ca/wedding-guide">
  <title>The Wedding Experience | Arman Arai</title>
  <style>
@font-face {
  font-family: Guide Cormorant;
  src: url("/wedding-guide/fonts/cormorant.ttf") format("truetype");
  font-weight: 300 700;
  font-display: swap;
}
@font-face {
  font-family: Guide Cormorant;
  src: url("/wedding-guide/fonts/cormorant-italic.ttf") format("truetype");
  font-weight: 300 700;
  font-style: italic;
  font-display: swap;
}
@font-face {
  font-family: Guide Jost;
  src: url("/wedding-guide/fonts/jost.ttf") format("truetype");
  font-weight: 100 900;
  font-display: swap;
}

:root {
  color-scheme: dark;
  --ink: #1a1612;
  --dark: #080704;
  --white: #e8e0d0;
  --warm: #b8956a;
  --light-muted: #d1c5b5;
  --dark-rule: #534437;
  --paper: #f1e9db;
  --paper-deep: #e9decc;
  --paper-muted: #54473b;
  --paper-accent: #78523a;
  --paper-rule: #c4b4a1;
  --serif: Guide Cormorant, Cormorant, Georgia, serif;
  --sans: Guide Jost, Jost, system-ui, sans-serif;
  --gutter: clamp(18px, 5vw, 76px);
}

*, *::before, *::after { box-sizing: border-box; }
html { scroll-behavior: smooth; scroll-padding: 20px 0; }
body { margin: 0; background: var(--dark); color: var(--white); font: 400 1.0625rem/1.62 var(--sans); }
p, h1, h2, h3, figure, blockquote, dl, dd, ol { margin: 0; }
h1, h2, h3 { font-family: var(--serif); font-weight: 500; line-height: .98; text-wrap: balance; }
h2 { font-size: clamp(3rem, 6.25vw, 6.55rem); letter-spacing: -.048em; }
h3 { font-size: clamp(2rem, 3.3vw, 3.5rem); letter-spacing: -.034em; }
h2 em { color: var(--warm); font-weight: inherit; }
p + p { margin-top: .75em; }
a { color: inherit; text-underline-offset: .25em; }
:focus-visible { outline: 2px solid currentColor; outline-offset: 5px; }
button { font: inherit; }
[hidden] { display: none !important; }
.visually-hidden, .print-wordmark {
  position: absolute; width: 1px; height: 1px; padding: 0;
  overflow: hidden; clip-path: inset(50%); white-space: nowrap;
}
.skip { position: absolute; z-index: 5; top: 8px; left: 8px; padding: 10px 16px; background: var(--paper); color: var(--ink); transform: translateY(-150%); }
.skip:focus { transform: none; }
.wrap { width: min(100% - 2 * var(--gutter), 1260px); margin-inline: auto; }
.section { padding-block: clamp(60px, 9vw, 132px); }
.section-head { margin-bottom: clamp(26px, 4.6vw, 65px); }
.section-head > p:not(.eyebrow) { margin-top: 16px; max-width: 50ch; }
.section-head.split > p { margin-top: 0; }
.split { display: grid; grid-template-columns: minmax(0, 1.38fr) minmax(0, 1fr); align-items: end; gap: clamp(20px, 5.5vw, 84px); }
.split > :last-child { max-width: 49ch; padding-bottom: .28em; }
.eyebrow { margin: 0 0 13px; color: var(--warm); font-size: .75rem; font-weight: 500; line-height: 1.35; letter-spacing: .17em; text-transform: uppercase; }
.paper { color-scheme: light; background: var(--paper); color: var(--ink); }
.paper .eyebrow, .paper h2 em { color: var(--paper-accent); }
.paper .section-head > p:not(.eyebrow), .paper .section-head > div > p:not(.eyebrow) { color: var(--paper-muted); }
.text-link { display: inline-flex; align-items: center; width: fit-content; gap: .7em; font-size: .89rem; font-weight: 500; text-decoration: none; border-bottom: 1px solid; }
.text-link:hover { opacity: .75; }

.masthead { background: var(--dark); border-bottom: 1px solid var(--dark-rule); }
.masthead-inner { display: grid; grid-template-columns: auto 1fr auto; gap: clamp(12px, 2.4vw, 38px); align-items: center; padding-block: 14px; }
.wordmark { font: 600 1.85rem/.95 var(--serif); letter-spacing: -.035em; text-decoration: none; white-space: nowrap; }
.masthead nav { display: flex; flex-wrap: wrap; justify-content: center; gap: 3px clamp(6px, 1.55vw, 25px); }
.masthead nav a, .print-button {
  padding: 5px 2px; color: var(--light-muted); font-size: .755rem; line-height: 1.4;
  font-weight: 500; letter-spacing: .09em; text-decoration: none; text-transform: uppercase;
}
.masthead nav a:hover, .print-button:hover { color: var(--white); }
.print-button { background: transparent; border: 1px solid var(--dark-rule); padding: 8px 13px; cursor: pointer; white-space: nowrap; }
.print-button:disabled { cursor: wait; opacity: .6; }

.cover { display: grid; grid-template-columns: minmax(0, .84fr) minmax(0, 1.16fr); }
.cover-copy { align-self: center; padding: clamp(42px, 6vw, 110px) clamp(20px, 3vw, 48px) clamp(42px, 6vw, 110px) max(var(--gutter), calc((100vw - 1260px) / 2)); }
.cover h1 { margin: 0 0 21px; font-size: clamp(3.45rem, 6.2vw, 7.7rem); letter-spacing: -.055em; }
.cover h1 em { color: var(--warm); font-weight: inherit; }
.cover-copy > p:not(.eyebrow, .print-wordmark) { max-width: 38ch; color: var(--light-muted); }
.cover-copy > .cover-approach { font-size: .78rem; font-weight: 500; letter-spacing: .11em; text-transform: uppercase; }
.explore { margin-top: 24px; color: var(--warm); }
.cover-foot { grid-column: 1/-1; border-top: 1px solid var(--dark-rule); }
.cover-foot p { max-width: 58ch; padding-block: 17px; color: var(--light-muted); }
.frame { position: relative; overflow: hidden; background: #32271e; }
.frame img { display: block; width: 100%; height: 100%; object-fit: cover; object-position: var(--position, center); }
.frame-cover { min-height: clamp(460px, 45vw, 690px); }
.frame-cover img { position: absolute; inset: 0; }
.frame-portrait { aspect-ratio: 4 / 5; }
.frame-landscape { aspect-ratio: 3 / 2; }
.frame-wide { aspect-ratio: 1.95; }

.approaches { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: clamp(16px, 2.4vw, 37px); }
.approach-copy { margin-top: 16px; }
.approach-copy .eyebrow { margin-bottom: 6px; }
.approach-copy h3 { margin-bottom: 9px; }
.approach-copy > p:last-child, .term dd { color: var(--paper-muted); }
blockquote { max-width: 21ch; margin: clamp(48px, 8vw, 108px) auto 0; font: italic 500 clamp(2.3rem, 4.7vw, 5.2rem)/1.03 var(--serif); text-align: center; }

.day .section-head, .travel .section-head { color: var(--white); }
.day .section-head > p, .travel .section-head > div > p:not(.eyebrow) { color: var(--light-muted); }
.scene-nav { margin-bottom: clamp(24px, 5vw, 62px); border-block: 1px solid var(--dark-rule); }
.scene-nav ol { display: flex; flex-wrap: wrap; list-style: none; gap: 0 5px; padding: 0; }
.scene-nav a { display: block; padding: 9px 10px; color: var(--light-muted); font-size: .91rem; text-decoration: none; }
.scene-nav a span { margin-right: 7px; color: var(--warm); font-family: var(--serif); }
.scene-nav a:hover { background: #32271e; }
.day-spread { display: grid; grid-template-columns: repeat(12, minmax(0, 1fr)); gap: clamp(28px, 5.2vw, 76px) clamp(12px, 2vw, 30px); align-items: start; }
.day-evening { margin-top: clamp(32px, 5.2vw, 76px); }
.scene { grid-column: span 4; border-top: 1px solid var(--dark-rule); padding-top: 10px; }
.scene:nth-child(2) { margin-top: clamp(0px, 4vw, 60px); }
.scene:nth-child(3) { margin-top: clamp(0px, 1.7vw, 24px); }
.scene-wide { grid-column: 1/-1; }
.scene-wide .frame { max-height: 580px; }
.scene-copy { max-width: 55ch; padding: 15px 0 0; }
.scene-wide .scene-copy { display: grid; grid-template-columns: auto minmax(8ch, .7fr) minmax(0, 1.4fr); gap: 14px; align-items: baseline; max-width: 100ch; }
.scene-copy .eyebrow { margin-bottom: 5px; }
.scene-copy h3 { margin-bottom: 8px; }
.scene-copy > p:last-child { color: var(--light-muted); }

.planning-list { display: grid; grid-template-columns: 1fr 1fr; column-gap: clamp(24px, 6vw, 100px); }
.term { padding-block: 15px; border-top: 1px solid var(--paper-rule); }
.term dt { margin-bottom: 2px; font: 600 1.6rem/1 var(--serif); }
.section-note { margin-top: 24px; color: var(--paper-muted); max-width: 75ch; }
.experience { background: var(--paper-deep); }
.keepsakes { display: grid; grid-template-columns: minmax(0, .9fr) minmax(0, 1.1fr); gap: clamp(30px, 7vw, 110px); align-items: center; }
.keepsakes .section-head { margin-bottom: 25px; }
.keepsakes .frame { max-height: 660px; }

.journey-list { padding: 0; list-style: none; display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); column-gap: clamp(24px, 6vw, 100px); }
.journey-list li { display: flex; align-items: baseline; gap: 15px; border-top: 1px solid var(--dark-rule); padding-block: 16px; }
.journey-list li > span { color: var(--warm); font: 500 1.5rem/1 var(--serif); }
.journey-list h3 { margin-bottom: 5px; font-size: clamp(1.62rem, 2.4vw, 2.5rem); }
.journey-list p { color: var(--light-muted); }

.collections { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 18px; margin-bottom: 28px; }
.collection { border: 1px solid var(--paper-rule); }
.collection-head { padding: clamp(16px, 2.4vw, 32px); }
.collection-head h3 { margin-top: 16px; }
.collection-head .most-booked { margin-bottom: 0; margin-top: -5px; }
.collection-head:has(.most-booked) h3 { margin-top: 5px; }
.collection-head .price { margin: 10px 0 14px; font: 600 clamp(2.5rem, 4vw, 4.5rem)/.9 var(--serif); font-variant-numeric: lining-nums; }
.collection-fit { font-weight: 600; }
.collection-fit + p { margin-top: .25em; color: var(--paper-muted); }
.mobile-facts { display: none; }
.comparison { width: 100%; border-collapse: collapse; table-layout: fixed; text-align: left; font-size: .96rem; }
.comparison th, .comparison td { vertical-align: top; padding: 8px 12px; border-bottom: 1px solid var(--paper-rule); overflow-wrap: anywhere; }
.comparison th { font-weight: 600; }
.comparison thead { background: var(--paper-deep); }
.comparison thead th:first-child { width: 31%; }
.comparison thead span { display: block; font-weight: 400; }
.investment-notes { margin-top: 20px; color: var(--paper-muted); }
.investment .text-link { margin-top: 17px; }

.addons { background: var(--paper-deep); }
.addon-groups { columns: 2; column-gap: clamp(24px, 5vw, 75px); }
.addon-group { display: inline-block; width: 100%; margin-bottom: 24px; break-inside: avoid; }
.addon-group h3 { margin-bottom: 8px; font-size: 2rem; }
.addon-row { display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: 9px; border-top: 1px solid var(--paper-rule); padding-block: 6px; }
.addon-row dd { font-weight: 600; white-space: nowrap; }
.addon-row small { display: block; font-size: .9rem; color: var(--paper-muted); }

.travel .frame { max-height: 560px; }
.recommendation { border-bottom: 1px solid var(--paper-rule); }
.recommendation .section-head { margin-bottom: 0; }
.payment-plan { display: grid; grid-template-columns: repeat(3, 1fr); margin-bottom: 22px; border-block: 1px solid var(--paper-rule); }
.payment-plan > div { display: flex; flex-direction: column-reverse; gap: 4px; padding: 14px 12px; min-width: 0; }
.payment-plan > div + div { border-left: 1px solid var(--paper-rule); }
.payment-plan dd { font: 600 clamp(2rem, 4.2vw, 4.4rem)/1 var(--serif); font-variant-numeric: lining-nums; }
.booking-actions, .booking-contact, .footer .wrap { display: flex; flex-wrap: wrap; align-items: center; gap: 12px 22px; }
.inquiry-link { display: inline-flex; align-items: center; gap: 9px; background: var(--ink); color: var(--white); padding: 11px 16px; text-decoration: none; font-weight: 500; }
.inquiry-link:hover { background: #413024; }
.booking-contact { margin-top: 14px; color: var(--paper-muted); }
.closing-line { margin-top: clamp(35px, 5vw, 70px); font: italic 500 clamp(2rem, 4vw, 4.25rem)/1.05 var(--serif); }
.footer { padding-block: 23px; color: var(--light-muted); }
.footer p { margin: 0; }
.footer .back-to-top { margin-left: auto; }

@media screen and (min-width: 941px) {
  html { scroll-padding-top: 82px; }
  .masthead { position: sticky; z-index: 4; top: 0; }
}
@media screen and (max-width: 940px) {
  .cover { grid-template-columns: minmax(0, 1fr); }
  .cover-copy { padding: 39px var(--gutter); }
  .cover h1 { font-size: clamp(3.7rem, 12vw, 6.5rem); }
  .frame-cover { min-height: 0; aspect-ratio: 1.72; }
  .masthead-inner { grid-template-columns: 1fr auto; }
  .masthead nav { grid-column: 1/-1; grid-row: 2; justify-content: flex-start; column-gap: 14px; }
  .scene { grid-column: span 6; }
  .scene:nth-child(n) { margin-top: 0; }
  .scene-wide { grid-column: 1/-1; }
}
@media screen and (max-width: 640px) {
  body { font-size: 1rem; }
  h2 { font-size: clamp(2.9rem, 11vw, 4.7rem); }
  .masthead-inner { gap: 7px 14px; padding-block: 10px; }
  .masthead nav a, .print-button { font-size: .75rem; letter-spacing: .065em; }
  .masthead nav a { padding-block: 7px; }
  .cover-foot p { padding-block: 13px; }
  .frame-cover { aspect-ratio: 1.23; }
  .split, .approaches, .keepsakes, .planning-list, .journey-list, .collections { grid-template-columns: minmax(0, 1fr); }
  .approaches { gap: 32px; }
  .approaches .frame { aspect-ratio: 1.17; }
  .scene { grid-column: 1/-1; }
  .scene-wide .frame { aspect-ratio: 1.36; }
  .scene-wide .scene-copy { display: block; }
  .scene-nav a { padding-inline: 7px; }
  .keepsakes .frame { aspect-ratio: 1.15; }
  .comparison { display: none; }
  .collection-head h3 { margin-top: 0; }
  .collection-head .most-booked { margin-top: 0; }
  .mobile-facts { display: block; padding: 0 16px 11px; }
  .mobile-facts > div { display: grid; grid-template-columns: minmax(0, 1.06fr) minmax(0, 1fr); gap: 10px; padding: 6px 0; border-top: 1px solid var(--paper-rule); }
  .mobile-facts dt { font-weight: 500; }
  .mobile-facts dd { color: var(--paper-muted); }
  .addon-groups { columns: 1; }
  .payment-plan { grid-template-columns: 1fr; }
  .payment-plan > div { flex-direction: row; align-items: baseline; justify-content: space-between; gap: 12px; }
  .payment-plan > div + div { border-left: 0; border-top: 1px solid var(--paper-rule); }
  .footer .back-to-top { margin: 0; }
}
@media (prefers-reduced-motion: reduce) {
  html { scroll-behavior: auto; }
}

@page { size: letter portrait; margin: 14mm 14mm 13mm; }
@media print {
  :root { color-scheme: light; --ink: #181410; --dark: white; --white: #181410; --paper: white; --paper-deep: #f6f1e9; --warm: #78523a; --light-muted: #3c3025; --dark-rule: #c8baaa; }
  html { scroll-behavior: auto; }
  body { font-size: 10.5pt; line-height: 1.34; }
  .wrap { width: 100%; max-width: none; }
  .masthead, .skip, .scene-nav, .explore, .footer, .booking-actions, .investment > .wrap > .text-link { display: none; }
  .print-wordmark { position: static; width: auto; height: auto; clip-path: none; margin-top: 4mm; font: 600 20pt/1 var(--serif); }
  .section, .paper, .day, .travel { background: white; color: var(--ink); }
  .section { padding: 0 0 7mm; }
  .section-head { margin-bottom: 5mm; break-inside: avoid; }
  .eyebrow { margin-bottom: 2mm; font-size: 8pt; }
  h2 { font-size: 38pt; }
  h3 { font-size: 20pt; }
  h1, h2, h3, dt { break-after: avoid; }
  p { orphans: 2; widows: 2; }
  .cover { display: block; }
  .cover-copy { padding: 13mm 0 6mm; }
  .cover h1 { font-size: 69pt; margin-bottom: 4mm; }
  .cover-copy > p:not(.eyebrow, .print-wordmark) { max-width: 75ch; }
  .frame { print-color-adjust: exact; }
  .frame-cover { height: 113mm; aspect-ratio: auto; }
  .cover-foot p { padding-block: 4mm; }
  .approaches, .collections { grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 4mm; }
  .approaches .frame { aspect-ratio: 4 / 5; }
  .approaches article, .collection, .scene, .addon-group, .term, .journey-list li, .booking-contact { break-inside: avoid; }
  .approach-copy { margin-top: 3mm; }
  blockquote { margin-top: 10mm; font-size: 28pt; }
  .split { grid-template-columns: 1.25fr 1fr; gap: 8mm; }
  .day-spread { grid-template-columns: 1fr 1fr; gap: 5mm; }
  .day-evening { margin-top: 0; padding-top: 4mm; }
  .scene:nth-child(n) { margin-top: 0; }
  .scene, .scene-wide { grid-column: auto; padding-top: 2mm; }
  .scene .frame, .scene-wide .frame { height: 44mm; aspect-ratio: auto; }
  .scene-copy, .scene-wide .scene-copy { display: block; padding-top: 2mm; }
  .scene-copy h3 { margin-bottom: 1mm; }
  .planning-list, .journey-list { grid-template-columns: 1fr 1fr; column-gap: 7mm; }
  .term, .journey-list li { padding-block: 2.5mm; }
  .term dt, .journey-list h3 { font-size: 15pt; }
  .section-note { margin-top: 4mm; }
  .keepsakes { grid-template-columns: .72fr 1fr; gap: 7mm; align-items: start; padding-top: 5mm; border-top: 1px solid var(--paper-rule); }
  .keepsakes .section-head { margin-bottom: 3mm; }
  .keepsakes .frame { height: 80mm; aspect-ratio: auto; }
  .keepsakes h2 { font-size: 29pt; }
  .collections { margin-bottom: 4mm; }
  .collection-head { padding: 3mm; }
  .collection-head h3, .collection-head:has(.most-booked) h3 { font-size: 21pt; margin-top: 0; }
  .collection-head .most-booked { margin-top: 0; margin-bottom: 1mm; }
  .collection-head .price { font-size: 27pt; margin: 2mm 0; }
  .mobile-facts { display: none; }
  .comparison { display: table; font-size: 9.1pt; }
  .comparison th, .comparison td { padding: 1.35mm 2mm; }
  .comparison thead { display: table-header-group; }
  .comparison tr { break-inside: avoid; }
  .investment-notes { margin-top: 3mm; font-size: 9.5pt; }
  .addon-groups { columns: 2; column-gap: 8mm; }
  .addon-group { margin-bottom: 4mm; }
  .addon-group h3 { font-size: 18pt; }
  .addon-row { padding-block: 1.25mm; break-inside: avoid; }
  .addon-row small { font-size: 9pt; }
  .travel .frame { height: 52mm; aspect-ratio: auto; }
  .recommendation { border: 0; }
  .recommendation .section-head { margin-top: 6mm; }
  .payment-plan { grid-template-columns: repeat(3, 1fr); margin-bottom: 3mm; break-inside: avoid; }
  .payment-plan > div { padding: 2mm; }
  .payment-plan dd { font-size: 25pt; }
  .booking-contact { margin-top: 2mm; }
  .closing-line { margin-top: 5mm; font-size: 20pt; }
  #approach, #the-day, .day-evening, #planning, #journey, #collections, #add-ons, #travel, #booking { break-before: page; }
}
/* The market comparison the owner moved into this guide on 2026-11-24. It
   cannot use .comparison, which is hidden below 640px because the collection
   cards repeat its contents on a phone; this table has nothing repeating it,
   so it collapses into stacked rows instead of disappearing. */
.market-compare { margin-top: clamp(40px, 5vw, 72px); padding-top: clamp(32px, 4vw, 56px); border-top: 1px solid var(--paper-rule); }
.market-compare h3 { margin-bottom: .4em; }
.market-compare > p { max-width: 62ch; color: var(--paper-muted); }
.market-table { width: 100%; margin-top: clamp(20px, 2.5vw, 32px); border-collapse: collapse; table-layout: fixed; text-align: left; font-size: .96rem; }
.market-table th, .market-table td { vertical-align: top; padding: 9px 12px; border-bottom: 1px solid var(--paper-rule); overflow-wrap: anywhere; }
.market-table thead { background: var(--paper-deep); }
.market-table thead th { font-weight: 600; }
.market-table thead th:first-child { width: 27%; }
.market-table tbody th { font-weight: 600; }
.market-table tbody td:last-child { color: var(--paper-muted); }
.market-compare .small-print { margin-top: 18px; font-size: .88rem; color: var(--paper-muted); }
@media screen and (max-width: 640px) {
  .market-table { display: block; }
  .market-table thead { display: none; }
  .market-table tbody, .market-table tr, .market-table th, .market-table td { display: block; }
  .market-table tr { padding: 14px 0; border-bottom: 1px solid var(--paper-rule); }
  .market-table th, .market-table td { padding: 0; border: 0; }
  .market-table tbody th { margin-bottom: 7px; }
  .market-table td { display: grid; grid-template-columns: minmax(0, 6em) minmax(0, 1fr); gap: 12px; padding-top: 5px; }
  .market-table td::before { content: attr(data-label); color: var(--paper-accent); font-size: .82rem; letter-spacing: .055em; text-transform: uppercase; line-height: 1.5; }
}
@media print {
  .market-table { display: table; font-size: 9.1pt; }
  .market-table thead { display: table-header-group; }
  .market-table tbody, .market-table tr { display: table-row-group; }
  .market-table tr { display: table-row; break-inside: avoid; }
  .market-table th, .market-table td { display: table-cell; padding: 1.35mm 2mm; }
  .market-table td::before { content: none; }
}
</style>
</head>
<body>
  <a class="skip" href="#main">Skip to content</a>
  <header class="masthead" id="top">
    <div class="masthead-inner wrap">
      <a class="wordmark" href="https://www.armanarai.ca/" aria-label="Arman Arai home">Arman Arai</a>
      <nav aria-label="Guide chapters"><a href="#approach">Approach</a><a href="#the-day">The Day</a><a href="#planning">Planning</a><a href="#experience">The Experience</a><a href="#collections">Collections</a><a href="#booking">Booking</a></nav>
      <button type="button" class="print-button" data-print-guide hidden>Print / PDF</button>
    </div>
  </header>
  <main id="main" tabindex="-1">
    <section class="cover" id="cover" aria-labelledby="cover-title">
      <div class="cover-copy">
        <p class="eyebrow">Wedding photography &amp; cinematic storytelling</p>
        <h1 id="cover-title">The Wedding<br><em>Experience</em></h1>
        <p class="cover-approach">Documentary. Editorial. Artistic.</p>
        <p>Your wedding deserves to be experienced, not performed. My role is to preserve the day as it unfolds, while bringing a deliberate artistic perspective to the way you remember it.</p>
        <a class="text-link explore" href="#approach">Explore the guide <span aria-hidden="true">↓</span></a>
        <p class="print-wordmark">Arman Arai</p>
      </div>
      <figure class="frame frame-cover" style="--position:50% 56%">
    <img src="/wedding-guide/photo-01.webp" width="1600" height="900" alt="Black and white frame of a couple kissing at the end of a long stone colonnade"
      fetchpriority="high">
  </figure>
      <div class="cover-foot wrap"><p>From the quiet anticipation of the morning to the last moments on the dance floor, every part of your celebration deserves its own visual language.</p></div>
    </section>

    <section class="paper section" id="approach" aria-labelledby="approach-title">
      <div class="wrap">
        <header class="section-head">
          <p class="eyebrow">The photographic philosophy</p>
          <h2 id="approach-title">Three perspectives.<br><em>One story.</em></h2>
        </header>
        <div class="approaches">
          <article><figure class="frame frame-portrait" style="--position:50% 45%">
    <img src="/wedding-guide/photo-02.webp" width="1600" height="900" alt="Guests laughing together with champagne at the reception"
      loading="lazy" decoding="async">
  </figure>
              <div class="approach-copy"><p class="eyebrow">The authenticity</p>
              <h3>Documentary</h3><p>The unplanned moments often become the most meaningful photographs. A parent’s reaction, a conversation between friends, the nervous excitement before the ceremony. I observe quietly so you can stay in the moment and see the things you might have missed.</p></div></article><article><figure class="frame frame-portrait" style="--position:50% 42%">
    <img src="/wedding-guide/photo-03.webp" width="2016" height="1344" alt="Couple in a wood-panelled library, the groom in a gold armchair"
      loading="lazy" decoding="async">
  </figure>
              <div class="approach-copy"><p class="eyebrow">The elegance</p>
              <h3>Editorial</h3><p>At other times, I step in with intention. Inspired by fashion and cinema, I guide movement, composition and interaction to create refined photographs that still feel like you. I’ll show you what to do, even if you’ve never posed for a photograph.</p></div></article><article><figure class="frame frame-portrait" style="--position:50% 50%">
    <img src="/wedding-guide/photo-04.webp" width="1344" height="2016" alt="Overhead black and white frame of a spinning dress dissolving into blur"
      loading="lazy" decoding="async">
  </figure>
              <div class="approach-copy"><p class="eyebrow">The character</p>
              <h3>Artistic</h3><p>I work with light, shadow, reflections, movement and analogue film. An unexpected angle or a change in light can give a photograph its own character, and reveal something about the day you wouldn’t otherwise see.</p></div></article>
        </div>
        <blockquote>“I know when to step in, and when to disappear into the background.”</blockquote>
      </div>
    </section>

    <section class="section day" id="the-day" aria-labelledby="day-title">
      <div class="wrap">
        <header class="section-head split">
          <div><p class="eyebrow">The anatomy of your wedding day</p>
          <h2 id="day-title">A day with its<br><em>own rhythm.</em></h2></div>
          <p>Every wedding unfolds differently. Here’s how I approach each part of the day. We adapt to your traditions, venue, priorities and available time.</p>
        </header>
        <nav class="scene-nav" aria-label="Wedding-day chapters"><ol><li><a href="#details"><span aria-hidden="true">I</span>Details</a></li><li><a href="#preparation"><span aria-hidden="true">II</span>Preparation</a></li><li><a href="#first-look"><span aria-hidden="true">III</span>First look</a></li><li><a href="#ceremony"><span aria-hidden="true">IV</span>Ceremony</a></li><li><a href="#family"><span aria-hidden="true">V</span>Family</a></li><li><a href="#portraits"><span aria-hidden="true">VI</span>Portraits</a></li><li><a href="#reception"><span aria-hidden="true">VII</span>Reception</a></li><li><a href="#after-dark"><span aria-hidden="true">VIII</span>After dark</a></li></ol></nav>
        <div class="day-spread" id="timeline"><article class="scene" id="details">
    <figure class="frame frame-landscape" style="--position:50% 56%">
    <img src="/wedding-guide/photo-05.webp" width="1600" height="900" alt="Hands and a wedding ring resting on a tulle skirt"
      loading="lazy" decoding="async">
  </figure>
    <div class="scene-copy">
      <p class="eyebrow" aria-hidden="true">I</p>
      <h3>The details</h3><p>I begin with the things that set the atmosphere: your attire, rings, flowers, invitations, handwritten vows and the spaces you’ve chosen. If there are sentimental objects you want photographed, tell me beforehand so we can have them together when I arrive.</p>
    </div>
  </article><article class="scene" id="preparation">
    <figure class="frame frame-landscape" style="--position:50% 48%">
    <img src="/wedding-guide/photo-06.webp" width="2048" height="1152" alt="Bridesmaids getting ready across a hotel bed strewn with clothes"
      loading="lazy" decoding="async">
  </figure>
    <div class="scene-copy">
      <p class="eyebrow" aria-hidden="true">II</p>
      <h3>The preparation</h3><p>The morning is about anticipation and the people closest to you. I look for flattering light, photograph the interactions around you and make a few intentional portraits when the time is right. Before the wedding, we can talk through which rooms will work best.</p>
    </div>
  </article><article class="scene" id="first-look">
    <figure class="frame frame-landscape" style="--position:50% 43%">
    <img src="/wedding-guide/photo-07.webp" width="1600" height="900" alt="Bride reading at a window in the morning, her dress hanging behind her"
      loading="lazy" decoding="async">
  </figure>
    <div class="scene-copy">
      <p class="eyebrow" aria-hidden="true">III</p>
      <h3>The first look &amp; private vows</h3><p>If you’d like a quiet moment together before the ceremony, we can make space for it. A first look may also free up time for some portraits earlier in the day. If you want to see each other for the first time at the ceremony, we’ll build the schedule around that moment.</p>
    </div>
  </article><article class="scene scene-wide" id="ceremony">
    <figure class="frame frame-wide" style="--position:50% 48%">
    <img src="/wedding-guide/photo-08.webp" width="1600" height="900" alt="The newly married couple smiling together in a candlelit room"
      loading="lazy" decoding="async">
  </figure>
    <div class="scene-copy">
      <p class="eyebrow" aria-hidden="true">IV</p>
      <h3>The ceremony</h3><p>I watch for your entrance, expressions, vows, rings and traditions, and the people witnessing them. I work within the ceremony and venue rules and choose unobtrusive positions. When a second photographer is booked, we can plan complementary perspectives.</p>
    </div>
  </article></div>
        <div class="day-spread day-evening"><article class="scene" id="family">
    <figure class="frame frame-landscape" style="--position:50% 53%">
    <img src="/wedding-guide/photo-09.webp" width="1344" height="2016" alt="Black-and-white photograph of the wedding party framed by mirrored doors"
      loading="lazy" decoding="async">
  </figure>
    <div class="scene-copy">
      <p class="eyebrow" aria-hidden="true">V</p>
      <h3>Family &amp; wedding party</h3><p>We agree on a family photo list beforehand and make space for any sensitive family dynamics. Someone who knows your relatives can help gather the right groups. I direct the photographs quickly so everyone can get back to the celebration.</p>
    </div>
  </article><article class="scene" id="portraits">
    <figure class="frame frame-landscape" style="--position:50% 48%">
    <img src="/wedding-guide/photo-10.webp" width="1195" height="1600" alt="A couple embracing at the water&#x27;s edge in soft evening light"
      loading="lazy" decoding="async">
  </figure>
    <div class="scene-copy">
      <p class="eyebrow" aria-hidden="true">VI</p>
      <h3>Just the two of you</h3><p>This is a chance to step away from the crowd. I scout for locations and light, then give you simple direction for movement and posing. We choose what suits the setting, the schedule and your comfort. If the weather and timing allow, we may step away again for a short sunset session.</p>
    </div>
  </article><article class="scene" id="reception">
    <figure class="frame frame-landscape" style="--position:50% 44%">
    <img src="/wedding-guide/photo-11.webp" width="2048" height="1152" alt="A guest raising a glass mid-toast at the reception"
      loading="lazy" decoding="async">
  </figure>
    <div class="scene-copy">
      <p class="eyebrow" aria-hidden="true">VII</p>
      <h3>The reception</h3><p>I photograph the room, the tables, entrances, speeches, first dances and the things your guests get up to between them. I coordinate timing with your planner or MC and adapt the lighting to the space so the photographs hold on to the atmosphere you created.</p>
    </div>
  </article><article class="scene scene-wide" id="after-dark">
    <figure class="frame frame-wide" style="--position:50% 51%">
    <img src="/wedding-guide/photo-12.webp" width="1600" height="900" alt="Reception guests blurred in motion around a still couple, black and white"
      loading="lazy" decoding="async">
  </figure>
    <div class="scene-copy">
      <p class="eyebrow" aria-hidden="true">VIII</p>
      <h3>After dark</h3><p>As the party gets going, the photography becomes more expressive. Direct flash, movement, silhouettes and creative lighting capture the energy on the dance floor and the people who stayed to the end.</p>
    </div>
  </article></div>
      </div>
    </section>

    <section class="paper section" id="planning" aria-labelledby="planning-title">
      <div class="wrap">
        <header class="section-head split">
          <div><p class="eyebrow">What happens behind the scenes</p><h2 id="planning-title">So you can<br><em>be present.</em></h2></div>
          <p>My involvement begins well before the wedding. I anticipate the photographic decisions so you have fewer things to think about on the day itself.</p>
        </header>
        <dl class="planning-list"><div class="term"><dt>Photography timeline</dt><dd>We work backwards from the ceremony and reception, making room for preparation, portraits, travel, available light and realistic transitions.</dd></div><div class="term"><dt>Location scouting</dt><dd>I look at light, accessibility, privacy, backgrounds and weather. For weddings across Canada I plan to arrive two days early to scout and build in time for travel disruptions.</dd></div><div class="term"><dt>Creative direction</dt><dd>I guide you through portraits and give you room when a genuine moment is unfolding. I’ll show you what to do in front of the camera.</dd></div><div class="term"><dt>Weather alternatives</dt><dd>We identify sheltered or indoor options and adapt the portrait plan if the forecast changes.</dd></div><div class="term"><dt>Family photography plan</dt><dd>We agree on essential groupings and a practical way to gather the right people quickly.</dd></div><div class="term"><dt>Vendor collaboration</dt><dd>I coordinate photography-related timing with your planner, coordinator, venue, beauty team, filmmaker and MC as needed.</dd></div><div class="term"><dt>Equipment preparation</dt><dd>I plan the cameras, lighting and backup equipment for the spaces and conditions we expect.</dd></div></dl>
        <p class="section-note">I manage the photography and work with your planner or coordinator, who looks after the wider event.</p>
      </div>
    </section>

    <section class="paper section experience" id="experience" aria-labelledby="experience-title">
      <div class="wrap keepsakes" id="keepsakes">
        <figure class="frame frame-portrait" style="--position:50% 45%">
    <img src="/wedding-guide/photo-13.webp" width="1344" height="2016" alt="Black and white portrait of a veiled bride beneath stone arches"
      loading="lazy" decoding="async">
  </figure>
        <div>
          <header class="section-head">
            <p class="eyebrow">Beyond the digital gallery</p>
            <h2 id="experience-title">Different ways<br><em>to remember.</em></h2>
          </header>
          <dl class="keepsakes-list"><div class="term"><dt>Analogue film</dt><dd>Included in every collection. Its organic texture complements the digital photographs. Rolls are processed and scanned, and the number of rolls depends on your collection.</dd></div><div class="term"><dt>Cinematic films</dt><dd>I capture Signature and Legacy’s short, colour-graded features alongside the photography. Photo + Film includes a dedicated filmmaker who can give movement and sound more attention. Complete ceremony and speech films are available separately with an agreed production plan.</dd></div><div class="term"><dt>Social reels</dt><dd>Every collection includes short vertical videos edited for easy sharing. They arrive in the first week, separately from the main film.</dd></div><div class="term"><dt>Prints &amp; albums</dt><dd>I share film prints with guests during the wedding. A Signature wedding album is included with Legacy and Photo + Film and available as an add-on with Signature.</dd></div></dl>
        </div>
      </div>
    </section>

    <section class="section journey" id="journey" aria-labelledby="journey-title">
      <div class="wrap">
        <header class="section-head"><p class="eyebrow">The journey together</p>
        <h2 id="journey-title">From our first conversation<br><em>to your finished photographs.</em></h2></header>
        <ol class="journey-list"><li><span aria-hidden="true">01</span><div><h3>The consultation</h3><p>We talk about what you’re planning, how you want the day to feel and how much coverage you need.</p></div></li><li><span aria-hidden="true">02</span><div><h3>Securing your date</h3><p>A signed agreement and booking deposit confirm your reservation.</p></div></li><li><span aria-hidden="true">03</span><div><h3>Preparation</h3><p>I share photography guidance and preferred vendor recommendations.</p></div></li><li><span aria-hidden="true">04</span><div><h3>The engagement session</h3><p>Every collection includes a 60-minute session. It gives us time to work together and find what feels natural on camera.</p></div></li><li><span aria-hidden="true">05</span><div><h3>Planning</h3><p>We talk through your schedule, locations, important people, traditions and portrait opportunities. The scope of formal planning calls depends on the collection.</p></div></li><li><span aria-hidden="true">06</span><div><h3>Final preparations</h3><p>We confirm the details and photography arrangements ahead of the celebration.</p></div></li><li><span aria-hidden="true">07</span><div><h3>Your wedding</h3><p>You enjoy the day. I photograph it, direct when needed and coordinate photography with the rest of your wedding team.</p></div></li><li><span aria-hidden="true">08</span><div><h3>Delivery</h3><p>The full edited gallery arrives within three weeks and reels in the first week. Previews, films and albums follow the terms of your collection.</p></div></li></ol>
      </div>
    </section>

    <section class="paper section investment" id="collections" aria-labelledby="collections-title">
      <div class="wrap">
        <header class="section-head split">
          <div><p class="eyebrow">The investment</p>
          <h2 id="collections-title">Three collections.<br><em>One price across Canada.</em></h2></div>
          <p>The right collection gives us time and the right people to document your celebration without rushing it. Canadian photographer travel is included. Applicable sales taxes and optional extras are additional.</p>
        </header>
        <div class="collections"><article class="collection">
    <div class="collection-head">
      <p class="eyebrow most-booked">Most booked</p>
      <h3>Signature</h3><p class="price">${money(SIGNATURE.price)}</p>
      <p class="collection-fit">The complete photographic story</p><p>For a day where eight hours can cover the essential preparations, ceremony, portraits and reception.</p>
    </div>
    <dl class="mobile-facts"><div><dt>Continuous lead photography</dt><dd>8 hours</dd></div><div><dt>Edited high-resolution images with print permission</dt><dd>600+ edited images</dd></div><div><dt>Second photographer</dt><dd>Available separately</dd></div><div><dt>Dedicated filmmaker</dt><dd>Available separately</dd></div><div><dt>Colour-graded cinematic film</dt><dd>1-minute feature film</dd></div><div><dt>Analogue film, processed and scanned</dt><dd>2 rolls</dd></div><div><dt>Engagement session</dt><dd>60 minutes</dd></div><div><dt>Social reels</dt><dd>First week</dd></div><div><dt>Film prints for guests</dt><dd>Included</dd></div><div><dt>Signature album</dt><dd>Optional</dd></div><div><dt>Planning</dt><dd>A 90-minute planning call and a family-photo plan</dd></div><div><dt>Photo preview</dt><dd>40 images next day</dd></div><div><dt>Full gallery</dt><dd>3 weeks</dd></div><div><dt>Dedicated wedding film delivery</dt><dd>—</dd></div></dl>
  </article><article class="collection">
    <div class="collection-head">
      
      <h3>Legacy</h3><p class="price">${money(LEGACY.price)}</p>
      <p class="collection-fit">More time, more perspectives</p><p>For extended celebrations, overlapping events, simultaneous preparations or couples who want the included album.</p>
    </div>
    <dl class="mobile-facts"><div><dt>Continuous lead photography</dt><dd>10 hours</dd></div><div><dt>Edited high-resolution images with print permission</dt><dd>800+ edited images</dd></div><div><dt>Second photographer</dt><dd>4 hours</dd></div><div><dt>Dedicated filmmaker</dt><dd>Available separately</dd></div><div><dt>Colour-graded cinematic film</dt><dd>3-minute feature film</dd></div><div><dt>Analogue film, processed and scanned</dt><dd>4 rolls</dd></div><div><dt>Engagement session</dt><dd>60 minutes</dd></div><div><dt>Social reels</dt><dd>First week</dd></div><div><dt>Film prints for guests</dt><dd>Included</dd></div><div><dt>Signature album</dt><dd>Included</dd></div><div><dt>Planning</dt><dd>Two planning calls and a location scout</dd></div><div><dt>Photo preview</dt><dd>50 images within 24 hours</dd></div><div><dt>Full gallery</dt><dd>3 weeks</dd></div><div><dt>Dedicated wedding film delivery</dt><dd>—</dd></div></dl>
  </article><article class="collection">
    <div class="collection-head">
      
      <h3>Photo + Film</h3><p class="price">${money(PHOTO_FILM.price)}</p>
      <p class="collection-fit">A story in photographs and motion</p><p>For couples who want dedicated filmmaking throughout the day, with close attention to atmosphere, movement and sound.</p>
    </div>
    <dl class="mobile-facts"><div><dt>Continuous lead photography</dt><dd>12 hours</dd></div><div><dt>Edited high-resolution images with print permission</dt><dd>800+ edited images</dd></div><div><dt>Second photographer</dt><dd>Available separately</dd></div><div><dt>Dedicated filmmaker</dt><dd>12 hours</dd></div><div><dt>Colour-graded cinematic film</dt><dd>3–5-minute highlight</dd></div><div><dt>Analogue film, processed and scanned</dt><dd>4 rolls</dd></div><div><dt>Engagement session</dt><dd>60 minutes</dd></div><div><dt>Social reels</dt><dd>First week</dd></div><div><dt>Film prints for guests</dt><dd>Included</dd></div><div><dt>Signature album</dt><dd>Included</dd></div><div><dt>Planning</dt><dd>Scope confirmed in proposal</dd></div><div><dt>Photo preview</dt><dd>—</dd></div><div><dt>Full gallery</dt><dd>3 weeks</dd></div><div><dt>Dedicated wedding film delivery</dt><dd>10 weeks</dd></div></dl>
  </article></div>
        <table class="comparison">
  <caption class="visually-hidden">Compare wedding photography collection inclusions</caption>
  <thead><tr><th scope="col">Inclusion</th><th scope="col">Signature<span>${money(SIGNATURE.price)}</span></th><th scope="col">Legacy<span>${money(LEGACY.price)}</span></th><th scope="col">Photo + Film<span>${money(PHOTO_FILM.price)}</span></th></tr></thead>
  <tbody><tr><th scope="row">Continuous lead photography</th><td>8 hours</td><td>10 hours</td><td>12 hours</td></tr><tr><th scope="row">Edited high-resolution images with print permission</th><td>600+ edited images</td><td>800+ edited images</td><td>800+ edited images</td></tr><tr><th scope="row">Second photographer</th><td>Available separately</td><td>4 hours</td><td>Available separately</td></tr><tr><th scope="row">Dedicated filmmaker</th><td>Available separately</td><td>Available separately</td><td>12 hours</td></tr><tr><th scope="row">Colour-graded cinematic film</th><td>1-minute feature film</td><td>3-minute feature film</td><td>3–5-minute highlight</td></tr><tr><th scope="row">Analogue film, processed and scanned</th><td>2 rolls</td><td>4 rolls</td><td>4 rolls</td></tr><tr><th scope="row">Engagement session</th><td>60 minutes</td><td>60 minutes</td><td>60 minutes</td></tr><tr><th scope="row">Social reels</th><td>First week</td><td>First week</td><td>First week</td></tr><tr><th scope="row">Film prints for guests</th><td>Included</td><td>Included</td><td>Included</td></tr><tr><th scope="row">Signature album</th><td>Optional</td><td>Included</td><td>Included</td></tr><tr><th scope="row">Planning</th><td>A 90-minute planning call and a family-photo plan</td><td>Two planning calls and a location scout</td><td>Scope confirmed in proposal</td></tr><tr><th scope="row">Photo preview</th><td>40 images next day</td><td>50 images within 24 hours</td><td>—</td></tr><tr><th scope="row">Full gallery</th><td>3 weeks</td><td>3 weeks</td><td>3 weeks</td></tr><tr><th scope="row">Dedicated wedding film delivery</th><td>—</td><td>—</td><td>10 weeks</td></tr></tbody>
</table>
        <div class="investment-notes">
          <p><strong>Short feature films.</strong> I make Signature and Legacy’s short features alongside the photography. A dedicated filmmaker and complete recordings of the ceremony or speeches are available separately.</p>
          <p><strong>Photo + Film highlight.</strong> Includes licensed music, vows or speeches where I have usable audio, and one consolidated round of minor revisions.</p>
          <p><strong>The Signature album.</strong> A 10×10-inch album, 30 pages across 15 lay-flat spreads, printed on medium-weight lustre photographic paper on a rigid core so a picture can run across the gutter without breaking. Linen or vegan leather cover. I design the sequence and you get two rounds of changes.</p>
        </div>
        ${marketComparisonHtml()}
        <a class="text-link" href="https://www.armanarai.ca/pricing">See full pricing details <span aria-hidden="true">↗</span></a>
      </div>
    </section>

    <section class="paper section addons" id="add-ons" aria-labelledby="addons-title">
      <div class="wrap">
        <header class="section-head">
          <p class="eyebrow">Personalising your experience</p>
          <h2 id="addons-title">Make the coverage <em>your own.</em></h2>
          <p>All prices are in CAD, before applicable sales tax.</p>
        </header>
        <div class="addon-groups"><section class="addon-group"><h3>Coverage</h3><dl><div class="addon-row"><dt>Extra coverage hour<small>Lead photography. Book in advance, consecutive with collection coverage.</small></dt><dd>C$400</dd></div><div class="addon-row"><dt>Second photographer, 4 hours<small>Four-hour minimum. Included in Legacy.</small></dt><dd>C$800</dd></div><div class="addon-row"><dt>Extra second-photographer hour</dt><dd>C$175</dd></div><div class="addon-row"><dt>Rehearsal dinner or welcome event<small>Up to three hours on another day.</small></dt><dd>C$1,000</dd></div></dl></section><section class="addon-group"><h3>Sessions</h3><dl><div class="addon-row"><dt>Destination welcome session<small>45 minutes when I’m already on location.</small></dt><dd>C$550</dd></div><div class="addon-row"><dt>Anniversary session<small>60 minutes, 40+ images, within 12 months of the wedding.</small></dt><dd>C$400</dd></div></dl></section><section class="addon-group"><h3>Print</h3><dl><div class="addon-row"><dt>Signature album, 10×10 inches</dt><dd>C$1,200</dd></div><div class="addon-row"><dt>Heirloom album, 12×12 inches</dt><dd>C$1,800</dd></div><div class="addon-row"><dt>Parent album<small>Per copy.</small></dt><dd>C$550</dd></div><div class="addon-row"><dt>Fine-art print box</dt><dd>C$400</dd></div><div class="addon-row"><dt>Large framed fine-art print</dt><dd>C$300–900</dd></div></dl></section><section class="addon-group"><h3>Motion</h3><dl><div class="addon-row"><dt>Dedicated filmmaker, 8 hours</dt><dd>C$2,900</dd></div><div class="addon-row"><dt>Extra filmmaking hour</dt><dd>C$250</dd></div><div class="addon-row"><dt>Full ceremony and speeches films<small>Requires an agreed multi-camera and audio plan.</small></dt><dd>C$650</dd></div></dl></section><section class="addon-group"><h3>Film</h3><dl><div class="addon-row"><dt>One more roll of film</dt><dd>C$175</dd></div><div class="addon-row"><dt>Two-roll film add-on</dt><dd>C$300</dd></div><div class="addon-row"><dt>Film Story, four rolls</dt><dd>C$500</dd></div></dl></section><section class="addon-group"><h3>Aerial</h3><dl><div class="addon-row"><dt>Drone add-on<small>Subject to safety, weather, airspace and venue rules.</small></dt><dd>C$350</dd></div></dl></section><section class="addon-group"><h3>Delivery</h3><dl><div class="addon-row"><dt>Seven-day gallery rush<small>Subject to capacity.</small></dt><dd>C$750</dd></div></dl></section></div>
        <p class="section-note">Film roll add-ons include processing and scans. Each roll’s frame count varies. I quote extensive retouching, dedicated content creation, additional social edits and multi-day or cultural weddings individually. Album upgrades can be confirmed in your proposal.</p>
      </div>
    </section>

    <section class="section travel" id="travel" aria-labelledby="travel-title">
      <div class="wrap">
        <header class="section-head split">
          <div><p class="eyebrow">Wherever your story takes us</p>
          <h2 id="travel-title">One collection price,<br><em>anywhere in Canada.</em></h2></div>
          <div><p>Whether you’re getting married in Vancouver, Montréal, Toronto, the Rockies or elsewhere in Canada, your collection price includes my required transport and accommodation. I plan to arrive two days early to scout and allow for travel disruptions.</p>
          <p>Third-party costs such as permits, helicopters or guest shuttles are disclosed separately. I quote international weddings outside the United States individually.</p></div>
        </header>
        <figure class="frame frame-wide" style="--position:50% 50%">
    <img src="/wedding-guide/photo-14.webp" width="1600" height="1195" alt="A couple in wedding attire on a rocky mountain ridge with a helicopter in the distance"
      loading="lazy" decoding="async">
  </figure>
      </div>
    </section>

    <section class="paper section recommendation" id="finding-your-collection" aria-labelledby="fit-title">
      <div class="wrap">
        <header class="section-head split">
          <div><p class="eyebrow">Finding the right collection</p>
          <h2 id="fit-title">Coverage built<br><em>around your day.</em></h2></div>
          <div><p>On our call, we look at when the celebration starts and ends, what overlaps, how important film and sound are to you and which photographs you value most. I recommend the collection that fits your timeline.</p>
          <p>Signature may fit an eight-hour celebration. Legacy gives a longer day more room and can cover simultaneous moments. If dedicated filmmaking is a priority, Photo + Film gives you a filmmaker throughout the day.</p></div>
        </header>
      </div>
    </section>

    <section class="paper section booking" id="booking" aria-labelledby="booking-title">
      <div class="wrap" id="begin">
        <header class="section-head split">
          <div><p class="eyebrow">Making it official</p>
          <h2 id="booking-title">Let us begin<br><em>with your date.</em></h2></div>
          <div><p>After we talk, I prepare a personalised proposal with my recommended collection, any alternatives, your selected extras and applicable taxes. I can offer a complimentary 48-hour hold on your date, subject to availability.</p>
          <p>A signed agreement and the booking deposit officially reserve your date.</p></div>
        </header>
        <dl class="payment-plan" aria-label="Payment schedule">
          <div><dt>Booking, non-refundable deposit</dt><dd>30%</dd></div>
          <div><dt>60 days before the wedding</dt><dd>35%</dd></div>
          <div><dt>30 days before the wedding</dt><dd>35%</dd></div>
        </dl>
        <div class="booking-actions">
          <a class="inquiry-link" href="https://www.armanarai.ca/contact">Let’s talk about your wedding <span aria-hidden="true">↗</span></a>
          <a class="text-link" href="https://www.armanarai.ca/pricing">View pricing <span aria-hidden="true">↗</span></a>
        </div>
        <p class="booking-contact"><a href="mailto:i@armanarai.com">i@armanarai.com</a><a href="tel:+17783025231">+1 778-302-5231</a></p>
        <p class="closing-line">Your wedding deserves to be experienced, not performed.</p>
      </div>
    </section>
  </main>
  <footer class="footer"><div class="wrap">
    <a class="wordmark" href="https://www.armanarai.ca/">Arman Arai</a>
    <p>Wedding photography &amp; cinematic storytelling</p>
    <a class="text-link back-to-top" href="#top">Back to top <span aria-hidden="true">↑</span></a>
  </div></footer>
<script>
(() => {
  const button = document.querySelector("[data-print-guide]");
  if (!button) return;

  const images = [...document.querySelectorAll("main img")];

  function prepareImages() {
    for (const image of images) image.loading = "eager";
  }

  window.addEventListener("beforeprint", prepareImages);
  button.hidden = false;
  button.addEventListener("click", async () => {
    button.disabled = true;
    prepareImages();

    let timeout;
    try {
      await Promise.race([
        Promise.allSettled([document.fonts.ready, ...images.map((image) => image.decode())]),
        new Promise((resolve) => { timeout = window.setTimeout(resolve, 5000); }),
      ]);
      window.print();
    } finally {
      window.clearTimeout(timeout);
      button.disabled = false;
    }
  });
})();
</script>
</body>
</html>`;

export default guideHtml;
