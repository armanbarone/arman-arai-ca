// Parse an existing post body (HTML string of <h2>/<p>/<figure>) into the
// structured shape the Elopement Gazette template renders: an intro lede plus
// a list of sections (each an <h2> with its paragraphs and first figure).

export interface GzImage { src: string; alt: string; caption: string; }
export interface GzSection { heading: string; paras: string[]; img: GzImage | null; tables: string[]; }
export interface GzBody { introParas: string[]; sections: GzSection[]; }

function stripTags(s: string): string {
  return s.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
}

function extractParas(chunk: string): string[] {
  const noFig = chunk.replace(/<figure[\s\S]*?<\/figure>/g, "");
  return [...noFig.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/g)]
    .map((m) => m[1].trim())
    .filter(Boolean);
}

function extractTables(chunk: string): string[] {
  return [...chunk.matchAll(/<table[\s\S]*?<\/table>/g)].map((m) => m[0]);
}

function extractImg(chunk: string): GzImage | null {
  const fm = chunk.match(/<figure[\s\S]*?<\/figure>/);
  if (!fm) return null;
  const fig = fm[0];
  const src = (fig.match(/<img[^>]*\ssrc="([^"]+)"/) || [])[1];
  if (!src) return null;
  const alt = (fig.match(/<img[^>]*\salt="([^"]*)"/) || [])[1] || "";
  const caption = stripTags((fig.match(/<figcaption[^>]*>([\s\S]*?)<\/figcaption>/) || [])[1] || "");
  return { src, alt, caption };
}

export function parseGazetteBody(html: string): GzBody {
  const parts = html.split(/<h2>/);
  const introParas = extractParas(parts[0] || "");
  const sections: GzSection[] = parts.slice(1).map((raw) => {
    const hm = raw.match(/^([\s\S]*?)<\/h2>([\s\S]*)$/);
    const heading = hm ? stripTags(hm[1]) : "";
    const content = hm ? hm[2] : raw;
    return { heading, paras: extractParas(content), img: extractImg(content), tables: extractTables(content) };
  });
  return { introParas, sections };
}

export const ORDINALS = [
  "one", "two", "three", "four", "five", "six", "seven",
  "eight", "nine", "ten", "eleven", "twelve", "thirteen", "fourteen",
];
