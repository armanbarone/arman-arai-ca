import type { PlanningItem } from "./types";
const steps = [
  ["Booking", "Agreement signed", 0],
  ["Booking", "Booking payment received", 0],
  ["Planning", "Discovery answers submitted", 90],
  ["Planning", "Creative brief approved", 60],
  ["Planning", "Family photo list confirmed", 35],
  ["Permissions", "Venue rules, permits and insurance confirmed", 30],
  ["Wedding day", "Final wedding plan approved", 14],
  ["Wedding day", "Wedding day summary ready", 2],
  ["Delivery", "Photographs delivered", -1],
  ["Delivery", "Films delivered", -1],
  ["Delivery", "Album proof approved", -1],
  ["Studio", "Production and media backup plan reviewed", 7],
] as const;
export function defaultPlanning(
  date: string,
  opts: { film: boolean; album: boolean },
): PlanningItem[] {
  return steps
    .filter(
      (s) =>
        (opts.film || s[1] !== "Films delivered") &&
        (opts.album || s[1] !== "Album proof approved"),
    )
    .map(([section, title, days], i) => ({
      id: `p${i + 1}`,
      section,
      titleEn: title,
      titleFr: title,
      status: "todo",
      clientVisible: section !== "Studio",
      sortOrder: i,
      ...(days > 0
        ? {
            dueDate: new Date(Date.parse(date + "T12:00:00Z") - days * 86400000)
              .toISOString()
              .slice(0, 10),
          }
        : {}),
    }));
}
