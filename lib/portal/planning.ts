import type { PlanningItem } from "./types";
import { monthsBefore } from "./money";

// The planning process every Canadian elopement goes through, in order. It is
// the work order's timeline (section 07) turned into a live checklist: the
// couple sees what is done and what is still to come, and Arman ticks items off
// as they happen. Due dates count back from the elopement date.

interface Step {
  section: string;
  en: string;
  fr: string;
  /** Days before the elopement; negative means after. Undefined = no date. */
  daysBefore?: number;
  monthsBefore?: number;
  internal?: boolean;
}

const STEPS: Step[] = [
  { section: "Booking", en: "Agreement and work order signed", fr: "Contrat et bon de travail signés" },
  { section: "Booking", en: "Non-refundable deposit received, date and vendors locked", fr: "Acompte non remboursable reçu, date et fournisseurs réservés" },
  { section: "Planning", en: "Planning call 1: vision, location and timeline", fr: "Appel de planification 1 : vision, lieu et horaire" },
  { section: "Planning", en: "Style questionnaire completed", fr: "Questionnaire de style rempli" },
  { section: "Travel", en: "Couple books travel and accommodation", fr: "Le couple réserve son transport et son hébergement", monthsBefore: 4 },
  { section: "Vendors", en: "Officiant booked", fr: "Célébrant réservé", monthsBefore: 5 },
  { section: "Vendors", en: "Hair and makeup artist booked", fr: "Coiffure et maquillage réservés", monthsBefore: 4 },
  { section: "Vendors", en: "Florals and styling booked", fr: "Fleurs et stylisme réservés", monthsBefore: 3 },
  { section: "Vendors", en: "Signature activity booked", fr: "Activité signature réservée", monthsBefore: 4 },
  { section: "Vendors", en: "Dinner reservation confirmed", fr: "Réservation du souper confirmée", monthsBefore: 2 },
  { section: "Vendors", en: "Local transport and driver booked", fr: "Transport local et chauffeur réservés", monthsBefore: 2 },
  { section: "Permits", en: "Park and location permits submitted", fr: "Demandes de permis de parc et de lieu soumises", monthsBefore: 3 },
  { section: "Permits", en: "Permits approved", fr: "Permis approuvés", daysBefore: 30 },
  { section: "Legal", en: "Marriage licence documents received", fr: "Documents pour la licence de mariage reçus", daysBefore: 30 },
  { section: "Legal", en: "Marriage licence obtained", fr: "Licence de mariage obtenue", daysBefore: 14 },
  { section: "Planning", en: "Backup plan and contingency schedule confirmed", fr: "Plan de rechange et calendrier de contingence confirmés", daysBefore: 21 },
  { section: "Planning", en: "Final itinerary locked", fr: "Itinéraire final confirmé", daysBefore: 14 },
  { section: "Planning", en: "Planning call 2: run of show", fr: "Appel de planification 2 : déroulement de la journée", daysBefore: 10 },
  { section: "Event", en: "Weather call made", fr: "Décision météo prise", daysBefore: 2 },
  { section: "Event", en: "Elopement day", fr: "Jour de l'élopement", daysBefore: 0 },
  { section: "Legal", en: "Marriage registration submitted", fr: "Enregistrement du mariage soumis", daysBefore: -14 },
  { section: "Delivery", en: "Sneak peek delivered", fr: "Aperçu livré", daysBefore: -7 },
  { section: "Delivery", en: "Full photo gallery delivered", fr: "Galerie photo complète livrée" },
  { section: "Delivery", en: "Cinematic film delivered", fr: "Film cinématographique livré" },
  { section: "Delivery", en: "Heirloom album designed and delivered", fr: "Album souvenir conçu et livré" },
];

function addDays(iso: string, days: number): string {
  const [y, m, d] = iso.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d + days));
  return dt.toISOString().slice(0, 10);
}

export function defaultPlanning(eventDate: string, opts: { film: boolean; album: boolean }): PlanningItem[] {
  return STEPS
    .filter((s) => (opts.film || !s.en.startsWith("Cinematic film")) && (opts.album || !s.en.startsWith("Heirloom album")))
    .map((s, i) => {
      let dueDate: string | undefined;
      if (eventDate && s.monthsBefore !== undefined) dueDate = monthsBefore(eventDate, s.monthsBefore);
      else if (eventDate && s.daysBefore !== undefined) dueDate = addDays(eventDate, -s.daysBefore);
      return {
        id: `p${i + 1}`,
        section: s.section,
        titleEn: s.en,
        titleFr: s.fr,
        dueDate,
        status: "todo" as const,
        clientVisible: !s.internal,
        sortOrder: i,
      };
    });
}
