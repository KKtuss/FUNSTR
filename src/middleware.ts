import { NextRequest, NextResponse } from "next/server";

export const config = {
  matcher: [
    /*
     * Match all paths except for:
     * 1. /api routes
     * 2. /_next (Next.js internals)
     * 3. /_static (inside /public)
     * 4. all root files inside /public (e.g. /favicon.ico)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|logo.png|logoo.png|logo.svg|bg.mp4|site.webmanifest).*)",
  ],
};

export function middleware(req: NextRequest) {
  const url = req.nextUrl;
  
  // Get hostname (e.g. 'funstrategy.com' or 'funstr.vercel.app')
  const hostname = req.headers.get("host")?.toLowerCase() ?? "";

  // 1. If we are on Vercel preview/production URL, always show main site.
  if (hostname.endsWith(".vercel.app")) {
    return NextResponse.next();
  }

  // 2. If no primary host is configured in env, allow everything (Safety Mode)
  // This prevents 404s on initial deploy if user hasn't set vars yet.
  const primaryHost = process.env.FUNSTR_PRIMARY_HOST;
  if (!primaryHost) {
    return NextResponse.next();
  }

  // 3. Check if current hostname is the Primary Host (e.g. funstrategy.com)
  const isPrimary = hostname === primaryHost || hostname === `www.${primaryHost}`;

  // 4. If it IS the primary host, allow normal routing
  if (isPrimary) {
    return NextResponse.next();
  }

  // 5. If it is NOT the primary host (and not vercel.app), it must be a Parked Domain.
  // Rewrite the request to show the /parked page content, but keep the URL as is.
  // e.g. 'random-meme.fun' -> shows content of 'funstrategy.com/parked'
  
  // Prevent infinite rewrite loop if we are already rewriting to /parked
  if (url.pathname === "/parked") {
    return NextResponse.next();
  }

  url.pathname = "/parked";
  return NextResponse.rewrite(url);
}
