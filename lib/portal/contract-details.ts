import { z } from "zod";
import { TIERS, type Tier } from "@/lib/site";
import type { Booking, Client } from "./types";
import { PROVINCES } from "./presets";

export const WEDDING_COLLECTIONS = TIERS;
const provinces = PROVINCES.map((p) => p.code) as [string, ...string[]];
const short = z.string().trim().max(500);
const date = z
  .string()
  .refine(
    (s) =>
      !s ||
      (/^\d{4}-\d{2}-\d{2}$/.test(s) &&
        Number.isFinite(Date.parse(s)) &&
        new Date(s).toISOString().slice(0, 10) === s),
    "Enter a valid date",
  );
const person = z
  .object({
    legalName: short,
    preferredName: short,
    phone: short,
    address: z.object({
      line1: short,
      line2: short,
      city: short,
      province: z.enum(provinces),
      postalCode: short,
    }),
  })
  .strict();
export const contractDetailsSchema = z
  .object({
    people: z.tuple([person, person]),
    date,
    serviceDates: short,
    municipality: short,
    province: z.enum(provinces),
    eventVenue: short,
    preparationLocation: short,
    ceremonyLocation: short,
    receptionLocation: short,
    ceremonyTime: short,
    receptionTime: short,
    guestCount: short,
    collectionKey: z
      .string()
      .refine(
        (k) => TIERS.some((t) => t.slug === k) || k === "custom",
        "Choose an available collection",
      ),
    requests: z.string().trim().max(4000),
  })
  .strict();
export type ContractDetails = z.infer<typeof contractDetailsSchema>;
export type ContractIntake = {
  values: ContractDetails;
  status: "draft" | "submitted" | "approved";
  updatedAt: string;
  actor: string;
  approvedAt?: string;
  approvedBy?: string;
};
export const collectionFor = (key: string) => TIERS.find((t) => t.slug === key);
export function datePlusDays(value: string, days: number) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return "";
  const d = new Date(`${value}T12:00:00Z`);
  if (!Number.isFinite(d.valueOf())) return "";
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}
export function collectionBookingFields(
  t: Tier,
  eventDate: string,
): Record<string, string> {
  return {
    coverageHours: String(t.hours),
    coverage: `${t.hours} continuous hours; exact start and end times to be agreed`,
    teamOnSite: t.crew,
    overview: t.includes.join("\n"),
    photoSpec: `${t.coverage}; ${t.crew}; ${t.images}, high resolution with print permission`,
    filmSpec: `${t.film}${t.slug === "photo-film" ? "; vows or speeches in the film wherever the audio comes back clean; one consolidated round of minor film revisions" : ""}`,
    planningSpec: t.planning,
    engagementSpec: t.engagement,
    previewSpec: t.preview,
    gallerySpec: `${t.images}, high resolution with print permission`,
    socialSpec: t.reels,
    analogueSpec: t.rolls,
    printsSpec: t.prints,
    otherSpec: `${t.rolls}; ${t.prints}`,
    albumSpec:
      t.slug === "signature"
        ? `Album not included; available as an add-on. ${t.prints}`
        : `${t.album}; ${t.prints}`,
    previewDate: datePlusDays(eventDate, 1),
    socialDate: datePlusDays(eventDate, 7),
    finalDeliveryDate: datePlusDays(eventDate, 21),
    featureFilmDeliveryDate:
      t.slug === "photo-film" ? datePlusDays(eventDate, 70) : "",
  };
}
export function initialContractDetails(b: Booking): ContractDetails {
  return b.wedding?.intake?.values
    ? structuredClone(b.wedding.intake.values)
    : {
        people: b.clients.map((c) => ({
          legalName: c.legalName,
          preferredName: c.preferredName,
          phone: c.phone,
          address: { ...c.address, line2: c.address.line2 || "" },
        })) as ContractDetails["people"],
        date: b.event.date,
        serviceDates: b.event.serviceDates,
        municipality: b.event.location,
        province: b.event.province,
        eventVenue: b.fields.eventVenue || "",
        preparationLocation: b.fields.preparationLocation || "",
        ceremonyLocation: b.fields.ceremonyLocation || "",
        receptionLocation: b.fields.receptionLocation || "",
        ceremonyTime: b.fields.ceremonyTime || "",
        receptionTime: b.fields.receptionTime || "",
        guestCount: b.fields.guestCount || "",
        collectionKey: collectionFor(b.packageKey) ? b.packageKey : "custom",
        requests: "",
      };
}
export function missingContractDetails(v: ContractDetails) {
  const missing: string[] = [];
  if (!v.date) missing.push("wedding date");
  if (!v.municipality) missing.push("event municipality");
  for (const [label, value] of [
    ["event venue", v.eventVenue],
    ["preparation location", v.preparationLocation],
    ["ceremony location", v.ceremonyLocation],
    ["reception location", v.receptionLocation],
  ])
    if (!value) missing.push(label);
  v.people.forEach((p, i) => {
    if (p.legalName.length < 3) missing.push(`partner ${i + 1}'s legal name`);
    if (p.phone.length < 7) missing.push(`partner ${i + 1}'s phone`);
    if (
      !p.address.line1 ||
      !p.address.city ||
      !/^[A-Z]\d[A-Z] ?\d[A-Z]\d$/i.test(p.address.postalCode)
    )
      missing.push(`partner ${i + 1}'s mailing address`);
  });
  return missing;
}
export function contractIsLocked(b: Booking) {
  return (
    b.status === "cancelled" ||
    !!b.payments.length ||
    !!b.wedding?.documents.some(
      (d) =>
        d.templateKey === "agreement" &&
        d.signatures.some((s) => s.party === "client"),
    )
  );
}
export function applyContractDetails(b: Booking, v: ContractDetails) {
  b.clients = b.clients.map((c, i) => ({
    ...c,
    ...v.people[i],
    address: { ...v.people[i].address },
    id: c.id,
    email: c.email,
  })) as [Client, Client];
  b.event = {
    ...b.event,
    date: v.date,
    serviceDates: v.serviceDates || v.date,
    location: v.municipality,
    province: v.province,
  };
  Object.assign(b.fields, {
    eventVenue: v.eventVenue,
    preparationLocation: v.preparationLocation,
    ceremonyLocation: v.ceremonyLocation,
    receptionLocation: v.receptionLocation,
    ceremonyTime: v.ceremonyTime,
    receptionTime: v.receptionTime,
    guestCount: v.guestCount,
    locations: `Event venue: ${v.eventVenue}\nPreparation: ${v.preparationLocation}\nCeremony: ${v.ceremonyLocation}\nReception: ${v.receptionLocation}`,
  });
}
