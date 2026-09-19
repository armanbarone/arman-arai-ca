// Custom next/image loader for the Canadian portfolio and the original .com
// hub imagery used on city landing pages. Both hosts resize through Cloudflare
// Image Transformations; keep their responsive srcsets on the source host.
// TRANSFORMS can fall back to the original objects if transforms are disabled.
const CDNS = ["https://cdn.armanarai.ca", "https://cdn.armanarai.com"];
const TRANSFORMS = true;

export default function cloudflareLoader({
  src,
  width,
  quality,
}: {
  src: string;
  width: number;
  quality?: number;
}): string {
  const MARKER = "/cdn-cgi/image/";
  const CDN = CDNS.find((host) => src.startsWith(`${host}/`));
  if (!CDN) return src;

  // A src that already baked in its own transform: rewrite the width to the one
  // next/image is asking for, otherwise every srcset entry resolves to the same
  // file and responsive sizing silently does nothing. With transforms off, the
  // options segment is stripped back off instead.
  if (src.startsWith(`${CDN}${MARKER}`)) {
    const rest = src.slice(CDN.length + MARKER.length);
    const slash = rest.indexOf("/");
    if (slash > 0) {
      const opts = rest.slice(0, slash);
      const path = rest.slice(slash);
      const kv = new Map<string, string>();
      for (const part of opts.split(",")) {
        const eq = part.indexOf("=");
        if (eq > 0) kv.set(part.slice(0, eq), part.slice(eq + 1));
      }
      // Only rewrite when this really is an options segment, never a path.
      if (kv.has("width") || kv.has("format") || kv.has("quality")) {
        if (!TRANSFORMS) return `${CDN}${path}`;
        kv.set("format", kv.get("format") ?? "auto");
        kv.set("quality", String(quality || kv.get("quality") || 80));
        kv.set("width", String(width));
        kv.set("fit", kv.get("fit") ?? "scale-down");
        const rebuilt = [...kv].map(([k, v]) => `${k}=${v}`).join(",");
        return `${CDN}${MARKER}${rebuilt}${path}`;
      }
    }
    return src;
  }

  if (TRANSFORMS && src.startsWith(`${CDN}/`)) {
    const path = src.slice(CDN.length);
    const opts = `format=auto,quality=${quality || 80},width=${width},fit=scale-down`;
    return `${CDN}${MARKER}${opts}${path}`;
  }
  return src;
}
