import type { AllocationLine, TaxLine } from "./types";
import { BUSINESS } from "./business";

// Collection names are booking shortcuts. Exact inclusions and prices belong
// to the completed proposal and agreement; a name never promises film, albums
// or optional services. The initial allocation is photography only and the
// studio can change it before issuing commercial terms.

export interface PackagePreset {
  key: string;
  name: string;
  includesFilm: boolean;
  includesAlbum: boolean;
  allocation: AllocationLine[];
}

const PHOTO_ONLY: AllocationLine[] = [
  { key: "photo", label: "Wedding photography and gallery", bps: 10000 },
];
export const PACKAGES: PackagePreset[] = [
  {
    key: "core",
    name: "Core",
    includesFilm: false,
    includesAlbum: false,
    allocation: PHOTO_ONLY,
  },
  {
    key: "signature",
    name: "Signature",
    includesFilm: false,
    includesAlbum: false,
    allocation: PHOTO_ONLY,
  },
  {
    key: "heirloom",
    name: "Heirloom",
    includesFilm: false,
    includesAlbum: false,
    allocation: PHOTO_ONLY,
  },
  {
    key: "custom",
    name: "Custom wedding collection",
    includesFilm: false,
    includesAlbum: false,
    allocation: PHOTO_ONLY,
  },
];

export function packageByKey(key: string): PackagePreset {
  return PACKAGES.find((p) => p.key === key) ?? PACKAGES[PACKAGES.length - 1];
}

export const PROVINCES: { code: string; name: string; nameFr: string }[] = [
  { code: "AB", name: "Alberta", nameFr: "Alberta" },
  { code: "BC", name: "British Columbia", nameFr: "Colombie-Britannique" },
  { code: "MB", name: "Manitoba", nameFr: "Manitoba" },
  { code: "NB", name: "New Brunswick", nameFr: "Nouveau-Brunswick" },
  {
    code: "NL",
    name: "Newfoundland and Labrador",
    nameFr: "Terre-Neuve-et-Labrador",
  },
  { code: "NS", name: "Nova Scotia", nameFr: "Nouvelle-Écosse" },
  {
    code: "NT",
    name: "Northwest Territories",
    nameFr: "Territoires du Nord-Ouest",
  },
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
  BC: "America/Vancouver",
  AB: "America/Edmonton",
  SK: "America/Regina",
  MB: "America/Winnipeg",
  ON: "America/Toronto",
  QC: "America/Toronto",
  NB: "America/Moncton",
  NS: "America/Halifax",
  PE: "America/Halifax",
  NL: "America/St_Johns",
  YT: "America/Whitehorse",
  NT: "America/Yellowknife",
  NU: "America/Iqaluit",
};

// Arasaka Inc. is registered for GST/HST only (no QST, no provincial PST
// registration). The default follows the province where the elopement takes
// place; Arman can change it per booking. Place-of-supply is his accountant's
// call, not this table's.
const HST: Record<string, number> = {
  ON: 1300,
  NB: 1500,
  NL: 1500,
  NS: 1400,
  PE: 1500,
};

export function defaultTaxesFor(province: string): TaxLine[] {
  const hst = HST[province];
  if (hst) {
    return [
      {
        code: `HST_${province}`,
        label: `HST (${province})`,
        rateBps: hst,
        registration: BUSINESS.gstHstNumber,
      },
    ];
  }
  return [
    {
      code: "GST",
      label: "GST",
      rateBps: 500,
      registration: BUSINESS.gstHstNumber,
    },
  ];
}

export const TAX_PRESETS: TaxLine[] = [
  {
    code: "GST",
    label: "GST",
    rateBps: 500,
    registration: BUSINESS.gstHstNumber,
  },
  ...Object.entries(HST).map(([p, r]) => ({
    code: `HST_${p}`,
    label: `HST (${p})`,
    rateBps: r,
    registration: BUSINESS.gstHstNumber,
  })),
];
