/* The custom collection builder, and the only place its arithmetic lives.
 *
 * Owner, 2026-11-18: the welcome email should stop saying "three collections,
 * and only three" and instead invite a couple to "build your own custom
 * collection and send it to me", on a page of its own.
 *
 * Every number here is read from lib/site.ts. Nothing is invented and nothing
 * is interpolated: a collection is one of the three published ones, an option
 * is one of the published ADDONS at its published price, and anything whose
 * honest answer is "it depends" is a QUOTED_ADDONS line that carries no
 * figure at all. If a price changes in site.ts it changes here, on /pricing
 * and in the email together.
 *
 * The browser renders the same functions the API route prices with, so the
 * total in the owner's inbox is computed from the slugs and never from a
 * number the page posted. A built total is still an indication rather than an
 * invoice: tax is provincial and the owner confirms the figure himself.
 */

import { ADDONS, ALBUM_SPECS, QUOTED_ADDONS, TIERS, type Addon, type Tier } from "./site";

export const BUILDER_PATH = "/build-your-collection";

/** Options a couple can genuinely want more than one of. Everything else is
 *  a yes or a no, because two albums of the same size is not a thing anybody
 *  orders by accident and two gallery rushes is nonsense. */
const MULTIPLE: Record<string, number> = {
  "Extra coverage hour": 6,
  "Extra second-photographer hour": 6,
  "Extra filmmaking hour": 6,
  "Parent album": 4,
  "One more roll of film": 6,
  "Large framed fine-art print": 4,
};

/** What each collection already carries, so an option that is included is
 *  shown as included and cannot be charged for twice. Taken from the add-on
 *  notes in site.ts, which say so in words: the second photographer is in
 *  Legacy, the Signature album is in Legacy and Photo + Film, and Photo + Film
 *  already has a filmmaker for its full twelve hours. */
const INCLUDED_IN: Record<string, string[]> = {
  "Second photographer, 4 hours": ["complete"],
  "Dedicated filmmaker, 8 hours": ["photo-film"],
  [`Signature album, ${ALBUM_SPECS.signature.size}`]: ["complete", "photo-film"],
};

/** Two options only mean something once there is somebody there to do them.
 *  The gate is stated to the couple rather than silently hidden, so the list
 *  reads as one list and not as a form that changes shape under them. */
type Gate = { needs: string; why: string };
const GATES: Record<string, Gate> = {
  "Extra second-photographer hour": {
    needs: "second-photographer",
    why: "Needs a second photographer on the day, which is the four-hour option above or Legacy.",
  },
  "Extra filmmaking hour": {
    needs: "filmmaker",
    why: "Needs a dedicated filmmaker on the day, which is the eight-hour option above or Photo + Film.",
  },
  "Full ceremony and speeches films": {
    needs: "filmmaker",
    why: "Needs a dedicated filmmaker on the day, which is the eight-hour option above or Photo + Film.",
  },
};

export type Selection = {
  /** A tier slug. Anything else is rejected rather than defaulted. */
  base: string;
  /** Option name to quantity. A quantity of 0 or less is not selected. */
  items: Record<string, number>;
  /** QUOTED_ADDONS names, which carry no price. */
  quoted: string[];
};

export const emptySelection = (base = TIERS[0].slug): Selection => ({ base, items: {}, quoted: [] });

export const baseBySlug = (slug: string): Tier | undefined => TIERS.find((t) => t.slug === slug);
export const addonByName = (name: string): Addon | undefined => ADDONS.find((a) => a.name === name);
export const maxQuantity = (name: string) => MULTIPLE[name] ?? 1;
export const includedIn = (name: string) => INCLUDED_IN[name] ?? [];
export const isIncluded = (name: string, base: string) => includedIn(name).includes(base);

/** Does this build have a second photographer, or a filmmaker, on the day?
 *  Either because the collection carries one or because one was chosen. */
function crew(selection: Selection) {
  const has = (name: string) =>
    isIncluded(name, selection.base) || (selection.items[name] ?? 0) > 0;
  return {
    "second-photographer": has("Second photographer, 4 hours"),
    filmmaker: has("Dedicated filmmaker, 8 hours"),
  } as Record<string, boolean>;
}

/** The gate blocking an option in this build, or nothing. */
export function blockedBy(name: string, selection: Selection): Gate | undefined {
  const gate = GATES[name];
  if (!gate) return undefined;
  return crew(selection)[gate.needs] ? undefined : gate;
}

export type Line = {
  name: string;
  note: string;
  quantity: number;
  /** The low figure. Equal to `max` for everything but the framed print. */
  min: number;
  max: number;
};

export type Build = {
  base: Tier;
  lines: Line[];
  /** Options the chosen collection already carries, listed so the page can
   *  say "already yours" rather than quietly dropping them. */
  included: string[];
  /** Chosen options that have no price because the honest answer is a quote. */
  quoted: string[];
  /** The collection plus every priced line, before tax. */
  totalMin: number;
  totalMax: number;
  /** True when a quoted line or a ranged price means the figure is not final. */
  approximate: boolean;
};

/** The one pricing function. The page and the API route both call it, so what
 *  a couple sees and what lands in the owner's inbox cannot disagree. */
export function priceBuild(selection: Selection): Build {
  const base = baseBySlug(selection.base) ?? TIERS[0];
  const normalised: Selection = { ...selection, base: base.slug };
  const lines: Line[] = [];
  const included: string[] = [];

  for (const addon of ADDONS) {
    const wanted = Math.floor(Number(normalised.items[addon.name] ?? 0));
    if (isIncluded(addon.name, base.slug)) {
      included.push(addon.name);
      continue;
    }
    if (!(wanted > 0)) continue;
    if (blockedBy(addon.name, normalised)) continue;
    const quantity = Math.min(wanted, maxQuantity(addon.name));
    lines.push({
      name: addon.name,
      note: addon.note,
      quantity,
      min: addon.price * quantity,
      max: (addon.priceMax ?? addon.price) * quantity,
    });
  }

  const quoted = QUOTED_ADDONS.filter((q) => normalised.quoted.includes(q.name)).map((q) => q.name);
  const totalMin = lines.reduce((sum, line) => sum + line.min, base.price);
  const totalMax = lines.reduce((sum, line) => sum + line.max, base.price);

  return {
    base,
    lines,
    included,
    quoted,
    totalMin,
    totalMax,
    approximate: totalMax !== totalMin || quoted.length > 0,
  };
}

export const money = (amount: number) => `C$${amount.toLocaleString("en-CA")}`;

/** The total as one string: a figure, or a range where a ranged option made
 *  it one. Never rounded and never averaged. */
export const buildTotal = (build: Build) =>
  build.totalMax === build.totalMin
    ? money(build.totalMin)
    : `${money(build.totalMin)}–${build.totalMax.toLocaleString("en-CA")}`;

/** The build as plain lines, for the owner's email and the stored lead. */
export function buildSummary(build: Build): string[] {
  return [
    `${build.base.name} — ${build.base.coverage} — ${money(build.base.price)}`,
    ...build.included.map((name) => `${name} — included in ${build.base.name}`),
    ...build.lines.map((line) =>
      `${line.name}${line.quantity > 1 ? ` ×${line.quantity}` : ""} — ${
        line.max === line.min ? money(line.min) : `${money(line.min)}–${line.max.toLocaleString("en-CA")}`
      }`,
    ),
    ...build.quoted.map((name) => `${name} — quoted, no published figure`),
    `Total before tax: ${buildTotal(build)}${build.approximate ? " (plus the quoted lines)" : ""}`,
  ];
}
