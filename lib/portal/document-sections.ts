import type { WeddingBlock, WeddingDocument } from "./wedding";
export type InitialSection = { id: string; title: string };
export function documentSections(blocks: WeddingBlock[]) {
  const sections: { title: string; blocks: WeddingBlock[] }[] = [
    { title: "Your details", blocks: [] },
  ];
  for (const b of blocks) {
    if (b.kind === "h" && /^Part [A-D]|^Appendix/.test(b.text))
      sections.push({ title: b.text, blocks: [] });
    else sections.at(-1)!.blocks.push(b);
  }
  return sections
    .filter((s) => s.blocks.length)
    .map((s, i) => ({ ...s, id: `section-${i + 1}` }));
}
export const initialSectionsFor = (d: WeddingDocument): InitialSection[] =>
  d.initialSections ??
  documentSections(d.blocks).map(({ id, title }) => ({ id, title }));
export const initialsForName = (name: string) =>
  name
    .normalize("NFKC")
    .trim()
    .split(/\s+/)
    .map((s) => s.match(/[\p{L}\p{N}]/u)?.[0] || "")
    .join("")
    .toUpperCase();
export const normalizeInitials = (s: string) =>
  s
    .normalize("NFKC")
    .replace(/[^\p{L}\p{N}]/gu, "")
    .toUpperCase();
export function validateInitials(
  d: WeddingDocument,
  name: string,
  raw: Record<string, string>,
) {
  const sections = initialSectionsFor(d),
    expected = initialsForName(name);
  if (
    !raw ||
    typeof raw !== "object" ||
    Array.isArray(raw) ||
    Object.keys(raw).some((id) => !sections.some((s) => s.id === id))
  )
    throw new Error("Invalid section initials");
  const initials: Record<string, string> = {};
  for (const s of sections) {
    const value = raw[s.id];
    if (
      typeof value !== "string" ||
      value.length > 30 ||
      normalizeInitials(value) !== expected
    )
      throw new Error(`Initial ${s.title} using ${expected} before signing`);
    initials[s.id] = expected;
  }
  return initials;
}
