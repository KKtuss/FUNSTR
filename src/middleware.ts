import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const hostHeader = (req.headers.get("host") ?? "").toLowerCase();
  const hostname = hostHeader.split(":")[0] ?? "";

  // Set in Vercel env vars: e.g. "funstrategy.com" (no protocol)
  const primaryHost = (process.env.FUNSTR_PRIMARY_HOST ?? "").toLowerCase();
  const primaryHostsCsv = (process.env.FUNSTR_PRIMARY_HOSTS ?? "").toLowerCase();

  // Vercel sets this to your deployment host (e.g. "myproj.vercel.app")
  const vercelUrl = (process.env.VERCEL_URL ?? "").toLowerCase();

  // Local dev should behave as the primary site by default.
  const isLocal =
    hostname.startsWith("localhost") || hostname.startsWith("127.0.0.1");

  // Always allow the default Vercel domain to show the main site.
  const isVercelDomain = hostname.endsWith(".vercel.app");

  const allowed = new Set<string>();
  for (const h of primaryHostsCsv.split(",").map((s) => s.trim()).filter(Boolean)) {
    allowed.add(h);
    allowed.add(`www.${h}`);
  }
  if (primaryHost) {
    allowed.add(primaryHost);
    allowed.add(`www.${primaryHost}`);
  }
  if (vercelUrl) {
    allowed.add(vercelUrl);
    allowed.add(`www.${vercelUrl}`);
  }

  const isPrimary =
    isLocal || isVercelDomain || (hostname ? allowed.has(hostname) : false);

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


