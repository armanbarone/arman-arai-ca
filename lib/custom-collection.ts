/* The custom collection builder, and the only place its arithmetic lives.
 *
 * FROM SCRATCH, not from a package (owner, 2026-11-19, correcting the first
 * version, which made you pick Signature, Legacy or Photo + Film and add to
 * it). A build starts at nothing but hours and is assembled line by line.
 *
 * Where the numbers come from, since a from-scratch build cannot read a
 * collection price:
 *   - Coverage is HOURLY, at TERMS.extraHour, which is the published rate for
 *     an hour on any collection. It is the only derived figure on the page.
 *     Eight hours à la carte therefore comes to slightly more than Signature,
 *     which is correct: a package is meant to be the cheaper way to buy.
 *   - Everything else is a published ADDONS line at its published price.
 *   - Anything whose honest answer is a quote is a QUOTED_ADDONS line and
 *     carries no figure at all.
 *   - STANDARD is what Signature carries at its own price, so it is what any
 *     build carries. None of it is charged for separately.
 *
 * The browser and the API route call the same functions, so the total in the
 * owner's inbox is priced from the selection and never from a number the page
 * posted.
 */

import { ADDONS, QUOTED_ADDONS, TERMS, TIERS, type Addon } from "./site";

export const BUILDER_PATH = "/build-your-collection";

/** The published rate for an hour of coverage. */
export const HOURLY = TERMS.extraHour;
export const MIN_HOURS = 6;
export const MAX_HOURS = 14;
export const DEFAULT_HOURS = 8;

/** In every build, because it is in the cheapest collection at its own price.
 *  Charging for any of it à la carte would be charging twice. */
export const STANDARD = [
  "A 60-minute engagement session",
  "600+ edited images, high resolution with print permission",
  "A 1-minute feature film, colour graded",
  "2 rolls of film, processed and scanned",
  "Vertical social reels, sent in the first week",
  "Film prints handed to guests on the night",
  "A 90-minute planning call and a family-photo plan",
  "40-image preview next day, full gallery in 3 weeks",
  "Travel anywhere in Canada, and two days on the ground before the wedding",
];

/** Coverage is the base, so the hourly add-on is not also an option. */
const HOURS_ADDON = "Extra coverage hour";

/** Several ADDONS notes end by naming the collection that already carries
 *  the thing. On a page with no collections on it that sentence is noise, so
 *  it is cut, and only that sentence. The price and the substance are the
 *  published ones either way. */
const STRIP = /\s*(Included in [^.]+\.|Photo \+ Film already includes one[^.]*\.|The upgrade from the Signature album\.)/g;

export const OPTIONS: Addon[] = ADDONS.filter((a) => a.name !== HOURS_ADDON).map((a) => ({
  ...a,
  note: a.note.replace(STRIP, "").trim(),
}));

/** The group headings this page uses. "Coverage" is already the hours card,
 *  so the people you add to the day get their own word. */
export const GROUP_LABEL: Record<string, string> = {
  Coverage: "People on the day",
  "Film and motion": "Film and motion",
  Prints: "Albums and prints",
  Sessions: "Other days",
  Delivery: "Delivery",
};

/** Options a couple can genuinely want more than one of. */
const MULTIPLE: Record<string, number> = {
  "Extra second-photographer hour": 6,
  "Extra filmmaking hour": 6,
  "Parent album": 4,
  "One more roll of film": 6,
  "Large framed fine-art print": 4,
};

/** Some options only mean something once there is somebody there to do them. */
type Gate = { needs: string; why: string };
const GATES: Record<string, Gate> = {
  "Extra second-photographer hour": { needs: "second", why: "Add the second photographer first." },
  "Extra filmmaking hour": { needs: "filmmaker", why: "Add the filmmaker first." },
  "Full ceremony and speeches films": { needs: "filmmaker", why: "Add the filmmaker first." },
};

export type Selection = {
  /** Hours of coverage by the lead photographer. */
  hours: number;
  /** Option name to quantity. A quantity of 0 or less is not selected. */
  items: Record<string, number>;
  /** QUOTED_ADDONS names, which carry no price. */
  quoted: string[];
};

export const emptySelection = (): Selection => ({ hours: DEFAULT_HOURS, items: {}, quoted: [] });

export const addonByName = (name: string) => OPTIONS.find((a) => a.name === name);
export const maxQuantity = (name: string) => MULTIPLE[name] ?? 1;
export const clampHours = (hours: number) =>
  Math.min(MAX_HOURS, Math.max(MIN_HOURS, Math.round(Number(hours) || DEFAULT_HOURS)));

/** The gate blocking an option in this build, or nothing. */
export function blockedBy(name: string, selection: Selection): Gate | undefined {
  const gate = GATES[name];
  if (!gate) return undefined;
  const crew: Record<string, boolean> = {
    second: (selection.items["Second photographer, 4 hours"] ?? 0) > 0,
    filmmaker: (selection.items["Dedicated filmmaker, 8 hours"] ?? 0) > 0,
  };
  return crew[gate.needs] ? undefined : gate;
}

export type Line = {
  name: string;
  quantity: number;
  /** The low figure. Equal to `max` for everything but the framed print. */
  min: number;
  max: number;
};

export type Build = {
  hours: number;
  /** The coverage line, always first. */
  coverage: Line;
  lines: Line[];
  quoted: string[];
  totalMin: number;
  totalMax: number;
  /** True when a quoted line or a ranged price means the figure is not final. */
  approximate: boolean;
};

/** The one pricing function. The page and the API route both call it. */
export function priceBuild(selection: Partial<Selection>): Build {
  const hours = clampHours(selection.hours ?? DEFAULT_HOURS);
  const items = selection.items ?? {};
  const normalised: Selection = { hours, items, quoted: selection.quoted ?? [] };

  const coverage: Line = {
    name: `${hours} hours of coverage, one lead photographer`,
    quantity: hours,
    min: hours * HOURLY,
    max: hours * HOURLY,
  };

  const lines: Line[] = [];
  for (const option of OPTIONS) {
    const wanted = Math.floor(Number(items[option.name] ?? 0));
    if (!(wanted > 0)) continue;
    if (blockedBy(option.name, normalised)) continue;
    const quantity = Math.min(wanted, maxQuantity(option.name));
    lines.push({
      name: option.name,
      quantity,
      min: option.price * quantity,
      max: (option.priceMax ?? option.price) * quantity,
    });
  }

  const quoted = QUOTED_ADDONS.filter((q) => normalised.quoted.includes(q.name)).map((q) => q.name);
  const totalMin = lines.reduce((sum, line) => sum + line.min, coverage.min);
  const totalMax = lines.reduce((sum, line) => sum + line.max, coverage.max);

  return {
    hours,
    coverage,
    lines,
    quoted,
    totalMin,
    totalMax,
    approximate: totalMax !== totalMin || quoted.length > 0,
  };
}

export const money = (amount: number) => `C$${amount.toLocaleString("en-CA")}`;

export const lineAmount = (line: Line) =>
  line.max === line.min ? money(line.min) : `${money(line.min)}–${line.max.toLocaleString("en-CA")}`;

/** The total as one string: a figure, or a range where a ranged option made
 *  it one. Never rounded and never averaged. */
export const buildTotal = (build: Build) =>
  build.totalMax === build.totalMin
    ? money(build.totalMin)
    : `${money(build.totalMin)}–${build.totalMax.toLocaleString("en-CA")}`;

/** The nearest published collection, so the owner's email says in one line
 *  whether the build is better bought as a package. */
export function againstCollections(build: Build) {
  return TIERS.map((tier) => ({
    name: tier.name,
    price: tier.price,
    hours: tier.hours,
    difference: build.totalMin - tier.price,
  }));
}

/** A reference a build can be called by, so an inquiry in the inbox can be
 *  matched to the package it belongs to (owner, 2026-11-19). Crockford-ish
 *  base32 without the letters that are misread aloud or in handwriting. */
const ALPHABET = "ACDEFGHJKLMNPQRTUVWXY34679";
export function buildReference(random: () => number = Math.random) {
  let out = "";
  for (let i = 0; i < 5; i++) out += ALPHABET[Math.floor(random() * ALPHABET.length)];
  return `CC-${out}`;
}

/** The build as plain lines, for the owner's email and the stored lead. */
export function buildSummary(build: Build): string[] {
  return [
    `${build.coverage.name} — ${lineAmount(build.coverage)}`,
    ...build.lines.map((line) => `${line.name}${line.quantity > 1 ? ` ×${line.quantity}` : ""} — ${lineAmount(line)}`),
    ...build.quoted.map((name) => `${name} — quoted, no published figure`),
    `Total before tax: ${buildTotal(build)}${build.quoted.length ? " plus the quoted lines" : ""}`,
  ];
}
