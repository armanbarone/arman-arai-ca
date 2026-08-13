// Custom next/image loader. Every photograph on armanarai.ca lives in the R2
// bucket `canadian-wedding` and is served through Cloudflare Image
// Transformations, which is what keeps the pages as fast as armanarai.com.
//
// CDN_HOST is deliberately the .com CDN for now: cdn.armanarai.com is already a
// live Cloudflare custom domain over R2, and armanarai.ca is not on Cloudflare
// yet. The identical objects exist under both `canadian-wedding/<key>` and
// `website/ca/<key>`, so pointing this at a future cdn.armanarai.ca (mapped to
// the canadian-wedding bucket) is a one-line change here plus dropping the
// "/ca" prefix in lib/images.ts.
//
// Anything not on the CDN host passes through untouched.
const CDN = "https://cdn.armanarai.com";

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
  // file and responsive sizing silently does nothing.
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

  if (src.startsWith(`${CDN}/`)) {
    const path = src.slice(CDN.length);
    const opts = `format=auto,quality=${quality || 80},width=${width},fit=scale-down`;
    return `${CDN}/cdn-cgi/image/${opts}${path}`;
  }
  return src;
}
