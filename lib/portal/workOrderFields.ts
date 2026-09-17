// Every blank in the Canadian Elopement Agreement and Work Order that changes
// from couple to couple. The admin form renders from this list and the
// documents read values by id, so a field added here shows up in both.
//
// `translatable` fields are prose Arman writes for the couple; each gets an
// optional French twin (`<id>_fr`) used in the French documents, falling back
// to the English text when left blank.

export type FieldType = "text" | "textarea" | "date" | "number";

export interface FieldDef {
  id: string;
  label: string;
  hint?: string;
  type: FieldType;
  translatable?: boolean;
  defaultValue?: string;
  requiredToSend?: boolean;
}

export interface FieldGroup {
  key: string;
  title: string;
  note?: string;
  fields: FieldDef[];
}

export const FIELD_GROUPS: FieldGroup[] = [
  {
    key: "particulars",
    title: "Agreement particulars",
    fields: [
      { id: "serviceStartDate", label: "Planning / service start date", type: "date", requiredToSend: true },
      { id: "finalDeliveryDate", label: "Final photos and films deadline", type: "date", requiredToSend: true },
      { id: "deliveryMethod", label: "Delivery method", type: "text", defaultValue: "Private online gallery with high-resolution download", translatable: true },
      { id: "officiantArrangements", label: "Officiant, witnesses and licence fee responsibility", type: "textarea", translatable: true, requiredToSend: true,
        defaultValue: "Arasaka Inc. books and pays the licensed officiant and arranges witnesses where required. The couple obtains and pays for the marriage licence." },
      { id: "provincialRider", label: "Provincial rider or additional price schedule", type: "text", defaultValue: "NONE" },
    ],
  },
  {
    key: "overview",
    title: "Work order: experience overview",
    fields: [
      { id: "issueDate", label: "Issue date", type: "date" },
      { id: "validUntil", label: "Valid until", type: "date" },
      { id: "travelWindow", label: "Travel window (arrival to departure)", type: "text" },
      { id: "overview", label: "Experience overview (2 to 3 sentences, written for the couple)", type: "textarea", translatable: true, requiredToSend: true },
      { id: "coverage", label: "Coverage", hint: "e.g. 8 hours across 1 day", type: "text", translatable: true, requiredToSend: true },
      { id: "locations", label: "Locations", type: "textarea", translatable: true, requiredToSend: true },
      { id: "teamOnSite", label: "Team on site", type: "text", translatable: true, defaultValue: "Arman Arai, hair and makeup artist, officiant, local fixer, driver" },
    ],
  },
  {
    key: "support",
    title: "Support arrangements (agreement section 6)",
    fields: [
      { id: "serviceWindows", label: "Scheduled service windows and time zone", type: "textarea", translatable: true, requiredToSend: true },
      { id: "freeTime", label: "Free time and services outside the main event", type: "textarea", translatable: true },
      { id: "coordinator", label: "Coordinator or local fixer and their role", type: "textarea", translatable: true, requiredToSend: true },
      { id: "supportChannel", label: "Support channel and staffed response windows", type: "textarea", translatable: true, defaultValue: "WhatsApp or phone to +1 (778) 302-5231. Replies within 24 hours on planning days and within 30 minutes during service windows." },
      { id: "emergencyInfo", label: "On-service backup and emergency information", type: "textarea", translatable: true },
      { id: "includedJourneys", label: "Included journeys and return arrangements", type: "textarea", translatable: true, requiredToSend: true },
      { id: "airportTransfers", label: "Airport arrival and departure transfers", type: "text", translatable: true, defaultValue: "EXCLUDED" },
      { id: "vehicleAvailability", label: "Vehicle and driver availability", type: "text", translatable: true },
      { id: "offItinerary", label: "Off-itinerary transport and optional support", type: "textarea", translatable: true, defaultValue: "Not included unless added as an upgrade in writing." },
      { id: "supportContinuation", label: "Support schedule continuation", type: "text", defaultValue: "NONE" },
    ],
  },
  {
    key: "travel",
    title: "Work order: travel, transport, permits and experiences",
    note: "The couple books and pays for their own airfare and accommodation. These fields only record what they have planned.",
    fields: [
      { id: "flightRoute", label: "Flight or long-distance travel route", type: "text" },
      { id: "travelers", label: "Travellers", type: "number", defaultValue: "2" },
      { id: "flightStatus", label: "Travel status", hint: "researching / held / ticketed / driving", type: "text" },
      { id: "accommodationProperty", label: "Accommodation property", type: "text" },
      { id: "accommodationNights", label: "Nights and dates", type: "text" },
      { id: "roomType", label: "Room type", type: "text" },
      { id: "accommodationRecommendation", label: "Arman Arai recommendation", hint: "provided / approved / pending", type: "text" },
      { id: "pickupDropoff", label: "Pickup and drop-off", type: "text", translatable: true },
      { id: "vehicle", label: "Vehicle", hint: "standard / private SUV / classic car", type: "text", translatable: true },
      { id: "driverFixer", label: "Driver / local fixer", type: "text", translatable: true },
      { id: "permitsRequired", label: "Required permits (by location)", type: "textarea", translatable: true },
      { id: "accessReservations", label: "Access reservations", type: "text", translatable: true, defaultValue: "N/A" },
      { id: "primaryActivity", label: "Signature activity (activity, duration, location)", type: "text", translatable: true, requiredToSend: true },
      { id: "additionalActivity", label: "Additional activity", type: "text", translatable: true, defaultValue: "N/A" },
      { id: "plannedDining", label: "Planned dinner and meals", type: "text", translatable: true, requiredToSend: true },
      { id: "fixerSupport", label: "Local fixer support", hint: "on the day / throughout coverage", type: "text", translatable: true },
    ],
  },
  {
    key: "ceremony",
    title: "Ceremony and legal status",
    fields: [
      { id: "officiant", label: "Licensed officiant", type: "text", defaultValue: "Arranged and paid by Arasaka Inc." },
      { id: "witnesses", label: "Witnesses", type: "text", translatable: true, defaultValue: "2 required, arranged by Arman Arai" },
      { id: "marriageLicence", label: "Marriage licence", type: "text", translatable: true, defaultValue: "Obtained by the couple with guidance from Arman Arai" },
      { id: "documentsRequired", label: "Documents the couple must supply", type: "textarea", translatable: true, defaultValue: "Government-issued photo ID, licence application details, and divorce documents if applicable" },
      { id: "documentsDeadlineDays", label: "Deadline for documents (days before ceremony)", type: "number", defaultValue: "30" },
    ],
  },
  {
    key: "photo",
    title: "Photography deliverables",
    fields: [
      { id: "photoCoverage", label: "Photo coverage", type: "text", translatable: true, requiredToSend: true },
      { id: "lensSet", label: "Lens set", type: "text" },
      { id: "filmComponent", label: "35mm film component", type: "text", translatable: true, defaultValue: "None" },
      { id: "editedImagesMin", label: "Minimum edited images", type: "number", requiredToSend: true },
      { id: "fullGalleryWeeks", label: "Full gallery delivered within (weeks)", type: "number", requiredToSend: true },
      { id: "galleryHostingMonths", label: "Gallery hosting (months)", type: "number", requiredToSend: true },
      { id: "albumSpec", label: "Heirloom album pages / size / finish", type: "text", translatable: true, defaultValue: "N/A" },
      { id: "rawPrice", label: "RAW access price (C$)", type: "text", defaultValue: "Not offered" },
    ],
  },
  {
    key: "film",
    title: "Cinematography deliverables",
    note: "Leave as N/A for photography-only packages.",
    fields: [
      { id: "filmCoverage", label: "Film coverage", type: "text", translatable: true, defaultValue: "N/A" },
      { id: "cinematicFilmMinutes", label: "Cinematic film length (minutes)", type: "text", defaultValue: "N/A" },
      { id: "filmDeliveryWeeks", label: "Film delivered within (weeks)", type: "text", defaultValue: "N/A" },
      { id: "socialVideos", label: "Social videos", type: "text", defaultValue: "N/A" },
      { id: "socialCutSeconds", label: "Social cut length (seconds)", type: "text", defaultValue: "N/A" },
      { id: "documentaryEdit", label: "Documentary edit", hint: "included / add-on / not included", type: "text", defaultValue: "not included" },
      { id: "ceremonyEdit", label: "Full ceremony edit", hint: "included / add-on / not included", type: "text", defaultValue: "not included" },
      { id: "filmHostingMonths", label: "Film hosting (months)", type: "text", defaultValue: "N/A" },
      { id: "revisionRounds", label: "Revision rounds on the film", type: "text", defaultValue: "1" },
      { id: "revisionDays", label: "Revision request window (days)", type: "text", defaultValue: "14" },
      { id: "aerialStatus", label: "Drone status at the locations", hint: "permitted / restricted / not permitted", type: "text", translatable: true, defaultValue: "To be confirmed with the final itinerary" },
    ],
  },
  {
    key: "contingency",
    title: "Contingency schedule (agreement section 15)",
    note: "The backup date is set with the booking. These fields describe Plan B on the day.",
    fields: [
      { id: "weatherCallHours", label: "Weather call made how many hours before coverage", type: "number", defaultValue: "48" },
      { id: "backupLocations", label: "Backup locations", type: "textarea", translatable: true },
      { id: "planAB", label: "Primary plan and agreed alternative", type: "textarea", translatable: true },
      { id: "reservationStatus", label: "Reservation and permit status", type: "textarea", translatable: true },
      { id: "decisionProcess", label: "Decision time, decision-maker and notification", type: "textarea", translatable: true },
      { id: "transportShelter", label: "Transport, shelter and costs on the backup plan", type: "textarea", translatable: true },
    ],
  },
  {
    key: "responsibilities",
    title: "Couple's responsibilities",
    fields: [
      { id: "arrivalBy", label: "Arrive at the destination no later than", type: "date" },
      { id: "responseDays", label: "Reply to planning questions within (business days)", type: "number", defaultValue: "3" },
    ],
  },
];

export const ALL_FIELDS: FieldDef[] = FIELD_GROUPS.flatMap((g) => g.fields);

export function defaultFields(): Record<string, string> {
  const out: Record<string, string> = {};
  for (const f of ALL_FIELDS) if (f.defaultValue !== undefined) out[f.id] = f.defaultValue;
  return out;
}

export function missingRequiredFields(fields: Record<string, string>): FieldDef[] {
  return ALL_FIELDS.filter((f) => f.requiredToSend && !(fields[f.id] ?? "").trim());
}
