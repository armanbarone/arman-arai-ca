// Custom next/image loader. Every photograph on armanarai.ca lives in the R2
// bucket `canadian-wedding`, served at the root of cdn.armanarai.ca and resized
// on the fly by Cloudflare Image Transformations (enabled on the zone
// 2026-08-13). TRANSFORMS exists so the site degrades to serving the original
// object, which is already WebP and capped at 2400px, if that ever gets turned
// off again rather than every image 404ing.
const CDN = "https://cdn.armanarai.ca";
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
