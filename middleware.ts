import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, verifyToken } from "@/lib/portal/token";

// The client portal and admin are private. Every response on these paths tells
// search engines and AI crawlers to stay out, is never cached, and nobody
// without a valid signed session gets past the sign-in page. Pages still check
// per-booking access on the server; this is the outer wall, not the only one.

const PRIVATE_HEADERS: Record<string, string> = {
  "X-Robots-Tag": "noindex, nofollow, noarchive, nosnippet, noimageindex, noai, noimageai",
  "Cache-Control": "private, no-store, max-age=0",
  "Referrer-Policy": "no-referrer",
  "X-Frame-Options": "DENY",
  "X-Content-Type-Options": "nosniff",
};

const PUBLIC_PORTAL_PATHS = ["/portal/login", "/portal/verify"];

function withHeaders(res: NextResponse) {
  for (const [k, v] of Object.entries(PRIVATE_HEADERS)) res.headers.set(k, v);
  return res;
}

export async function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;

  // Stripe and the daily job authenticate themselves (signature / secret).
  if (pathname.startsWith("/api/stripe/") || pathname.startsWith("/api/cron/")) {
    return withHeaders(NextResponse.next());
  }

  if (PUBLIC_PORTAL_PATHS.some((p) => pathname === p)) {
    return withHeaders(NextResponse.next());
  }

  const session = await verifyToken(req.cookies.get(SESSION_COOKIE)?.value, "session");
  const needsAdmin = pathname.startsWith("/admin") || pathname.startsWith("/api/admin");

  if (!session || (needsAdmin && session.r !== "admin")) {
    if (pathname.startsWith("/api/")) {
      return withHeaders(NextResponse.json({ error: "Not found" }, { status: 404 }));
    }
    const url = req.nextUrl.clone();
    url.pathname = "/portal/login";
    url.search = `?next=${encodeURIComponent(pathname + search)}`;
    return withHeaders(NextResponse.redirect(url));
  }

  return withHeaders(NextResponse.next());
}

export const config = {
  matcher: ["/portal/:path*", "/portal", "/admin/:path*", "/admin", "/api/portal/:path*", "/api/admin/:path*", "/api/stripe/:path*", "/api/cron/:path*"],
};
