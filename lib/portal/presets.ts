import type { AllocationLine, TaxLine } from "./types";
import { BUSINESS } from "./business";

// Package names come from the Canadian Elopement Work Order. The price is typed
// per couple; only the name and the default split are preset here.
//
// The split is what the agreement uses to value a part that could not be
// delivered (sections 13, 18 and 20). It is seeded from the Canadian elopement
// cost model, where vendors, activities and dining run about half the price and
// photo and film about a fifth, and Arman can change it on each booking.
// Drone work is a no-charge inclusion "wherever legally permitted", so it has
// no share and nothing is refunded when a park or airspace rule prevents it.

export interface PackagePreset {
  key: string;
  name: string;
  includesFilm: boolean;
  includesAlbum: boolean;
  allocation: AllocationLine[];
}

const WITH_FILM: AllocationLine[] = [
  { key: "planning", label: "Planning, design and coordination", bps: 2500 },
  { key: "vendors", label: "Vendors, permits, activities, dining and local transport", bps: 5000 },
  { key: "photo", label: "Photography and gallery", bps: 1300 },
  { key: "film", label: "Film and social videos", bps: 1000 },
  { key: "album", label: "Printed heirloom album", bps: 200 },
];

const PHOTO_ONLY: AllocationLine[] = [
  { key: "planning", label: "Planning, design and coordination", bps: 2500 },
  { key: "vendors", label: "Vendors, permits, activities, dining and local transport", bps: 5200 },
  { key: "photo", label: "Photography and gallery", bps: 2300 },
];

const BANFF_DAY: AllocationLine[] = [
  { key: "planning", label: "Planning, design and coordination", bps: 2500 },
  { key: "vendors", label: "Vendors, permits, adventure budget and local transport", bps: 5000 },
  { key: "photo", label: "Photography and gallery", bps: 1700 },
  { key: "film", label: "Social videos", bps: 800 },
];

export const PACKAGES: PackagePreset[] = [
  { key: "canada-blueprint", name: "Canada Blueprint", includesFilm: false, includesAlbum: false, allocation: PHOTO_ONLY },
  { key: "canada-signature", name: "Canada Signature", includesFilm: true, includesAlbum: true, allocation: WITH_FILM },
  { key: "banff-day", name: "Banff Day", includesFilm: true, includesAlbum: false, allocation: BANFF_DAY },
  { key: "banff-blueprint", name: "Banff Blueprint", includesFilm: false, includesAlbum: false, allocation: PHOTO_ONLY },
  { key: "banff-signature", name: "Banff Signature", includesFilm: true, includesAlbum: true, allocation: WITH_FILM },
  { key: "custom", name: "Custom elopement", includesFilm: false, includesAlbum: false, allocation: PHOTO_ONLY },
];

export function packageByKey(key: string): PackagePreset {
  return PACKAGES.find((p) => p.key === key) ?? PACKAGES[PACKAGES.length - 1];
}

export const PROVINCES: { code: string; name: string; nameFr: string }[] = [
  { code: "AB", name: "Alberta", nameFr: "Alberta" },
  { code: "BC", name: "British Columbia", nameFr: "Colombie-Britannique" },
  { code: "MB", name: "Manitoba", nameFr: "Manitoba" },
  { code: "NB", name: "New Brunswick", nameFr: "Nouveau-Brunswick" },
  { code: "NL", name: "Newfoundland and Labrador", nameFr: "Terre-Neuve-et-Labrador" },
  { code: "NS", name: "Nova Scotia", nameFr: "Nouvelle-Écosse" },
  { code: "NT", name: "Northwest Territories", nameFr: "Territoires du Nord-Ouest" },
  { code: "NU", name: "Nunavut", nameFr: "Nunavut" },
  { code: "ON", name: "Ontario", nameFr: "Ontario" },
  { code: "PE", name: "Prince Edward Island", nameFr: "Île-du-Prince-Édouard" },
  { code: "QC", name: "Quebec", nameFr: "Québec" },
  { code: "SK", name: "Saskatchewan", nameFr: "Saskatchewan" },
  { code: "YT", name: "Yukon", nameFr: "Yukon" },
];

export function provinceName(code: string, lang: "en" | "fr" = "en"): string {
  const p = PROVINCES.find((x) => x.code === code);
  return p ? (lang === "fr" ? p.nameFr : p.name) : code;
}

export const TIMEZONES: Record<string, string> = {
  BC: "America/Vancouver", AB: "America/Edmonton", SK: "America/Regina", MB: "America/Winnipeg",
  ON: "America/Toronto", QC: "America/Toronto", NB: "America/Moncton", NS: "America/Halifax",
  PE: "America/Halifax", NL: "America/St_Johns", YT: "America/Whitehorse", NT: "America/Yellowknife", NU: "America/Iqaluit",
};

// Arasaka Inc. is registered for GST/HST only (no QST, no provincial PST
// registration). The default follows the province where the elopement takes
// place; Arman can change it per booking. Place-of-supply is his accountant's
// call, not this table's.
const HST: Record<string, number> = { ON: 1300, NB: 1500, NL: 1500, NS: 1400, PE: 1500 };

export function defaultTaxesFor(province: string): TaxLine[] {
  const hst = HST[province];
  if (hst) {
    return [{ code: `HST_${province}`, label: `HST (${province})`, rateBps: hst, registration: BUSINESS.gstHstNumber }];
  }
  return [{ code: "GST", label: "GST", rateBps: 500, registration: BUSINESS.gstHstNumber }];
}

export const TAX_PRESETS: TaxLine[] = [
  { code: "GST", label: "GST", rateBps: 500, registration: BUSINESS.gstHstNumber },
  ...Object.entries(HST).map(([p, r]) => ({ code: `HST_${p}`, label: `HST (${p})`, rateBps: r, registration: BUSINESS.gstHstNumber })),
];
