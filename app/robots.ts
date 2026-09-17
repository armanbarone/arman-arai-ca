import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";

export const dynamic = "force-static";

// The client portal (/portal) and admin (/admin) hold contracts and payment
// details. They sit behind sign-in and send noindex headers; this file is the
// polite notice on top of that. A crawler that matches a named group ignores
// the "*" group, so every AI crawler group repeats the same private paths.
const PRIVATE = ["/api/", "/portal", "/admin"];

const AI_CRAWLERS = [
  "GPTBot", "ChatGPT-User", "OAI-SearchBot", "ClaudeBot", "Claude-User", "Claude-SearchBot", "anthropic-ai",
  "PerplexityBot", "Perplexity-User", "Google-Extended", "Applebot-Extended", "CCBot", "Bytespider",
  "Meta-ExternalAgent", "FacebookBot", "Amazonbot", "cohere-ai", "Diffbot", "YouBot", "DuckAssistBot", "MistralAI-User",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: PRIVATE },
      // The public site stays open to AI answer engines; only the private area is closed.
      { userAgent: AI_CRAWLERS, allow: "/", disallow: PRIVATE },
    ],
    sitemap: `${SITE.url}/sitemap.xml`,
    host: SITE.url,
  };
}
