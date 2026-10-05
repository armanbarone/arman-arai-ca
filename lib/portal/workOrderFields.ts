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
    key: "deliverables",
    title: "Customize this collection",
    note: "The selected website collection fills these starting details. Edit the exact inclusions before preparing the proposal and agreement.",
    fields: [
      {
        id: "coverageHours",
        label: "Total scheduled photography hours",
        type: "number",
      },
      ...[
        ["otherSpec", "Analogue film, instant prints and other included items"],
        ["photoSpec", "Photography coverage and image count"],
        ["filmSpec", "Film deliverables and revisions"],
        ["planningSpec", "Planning calls and location scout"],
        ["engagementSpec", "Engagement session"],
        ["previewSpec", "Preview images"],
        ["gallerySpec", "Full gallery"],
        ["socialSpec", "Vertical reels"],
        ["analogueSpec", "Analogue film rolls"],
        ["printsSpec", "Prints on the wedding night"],
        ["albumSpec", "Album size, pages and inclusions"],
      ].map(([id, label]) => ({ id, label, type: "textarea" as const })),
      ...[
        ["previewDate", "Preview due"],
        ["socialDate", "Reels due"],
        ["featureFilmDeliveryDate", "Feature film due"],
      ].map(([id, label]) => ({ id, label, type: "date" as const })),
    ],
  },
  {
    key: "coverage",
    title: "Wedding coverage",
    note: "Exact legal terms are prepared in the native agreement editor after the booking is saved.",
    fields: [
      {
        id: "coverage",
        label: "Coverage hours, start, end and time zone",
        type: "textarea",
        requiredToSend: true,
      },
      {
        id: "locations",
        label: "Preparation, ceremony and reception locations",
        type: "textarea",
        requiredToSend: true,
      },
      {
        id: "teamOnSite",
        label: "Included team",
        type: "text",
        defaultValue: "Arman Arai — lead photographer",
      },
      { id: "guestCount", label: "Estimated guest count", type: "number" },
      {
        id: "finalDeliveryDate",
        label: "Final photograph delivery date",
        type: "date",
        requiredToSend: true,
      },
      {
        id: "overview",
        label: "Collection inclusions and exclusions",
        type: "textarea",
      },
    ],
  },
];
export const ALL_FIELDS = FIELD_GROUPS.flatMap((g) => g.fields);
export const defaultFields = () =>
  Object.fromEntries(
    ALL_FIELDS.filter((f) => f.defaultValue).map((f) => [
      f.id,
      f.defaultValue!,
    ]),
  );
export const missingRequiredFields = (fields: Record<string, string>) =>
  ALL_FIELDS.filter((f) => f.requiredToSend && !fields[f.id]?.trim());
