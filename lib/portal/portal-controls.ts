import type { Booking } from "./types";
export const ALWAYS_VISIBLE_WORKFLOWS = [
  "agreement",
  "proposal",
  "invoice",
  "privacy",
  "request",
  "change",
];
export function workflowIsVisible(b: Booking, key: string) {
  return (
    ALWAYS_VISIBLE_WORKFLOWS.includes(key) ||
    !!b.wedding?.documents.some(
      (d) =>
        d.templateKey === key && !["draft", "withdrawn"].includes(d.status),
    ) ||
    !b.portal?.hiddenWorkflows?.includes(key)
  );
}
export function assertClientPortalAccess(
  b: Booking,
  session: { role: string; email: string },
) {
  if (session.role === "admin") return;
  if (
    b.archivedAt ||
    b.portal?.enabled === false ||
    !b.clients.some((c) => c.email === session.email)
  )
    throw new Error("Portal access changed. Contact the studio.");
}
