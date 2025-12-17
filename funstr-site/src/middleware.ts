import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const host = (req.headers.get("host") ?? "").toLowerCase();

  // Set in Vercel env vars: e.g. "funstrategy.com" (no protocol)
  const primaryHost = (process.env.FUNSTR_PRIMARY_HOST ?? "").toLowerCase();

  // Local dev should behave as the primary site by default.
  const isLocal = host.startsWith("localhost") || host.startsWith("127.0.0.1");

  const isPrimary =
    !primaryHost
      ? isLocal
      : host === primaryHost ||
        host === `www.${primaryHost}` ||
        host.startsWith(`${primaryHost}:`) ||
        host.startsWith(`www.${primaryHost}:`);

  if (isPrimary) return NextResponse.next();

  const url = req.nextUrl.clone();
  url.pathname = "/parked";
  url.search = "";
  return NextResponse.rewrite(url);
}

// Don’t run middleware for Next internals / APIs / assets needed by the parked page
export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|logo.png|logo.svg|bg.mp4).*)",
  ],
};


