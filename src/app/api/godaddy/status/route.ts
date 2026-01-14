import { NextResponse } from "next/server";

import { getGoDaddyBaseUrl } from "@/lib/godaddy";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function jsonError(status: number, message: string) {
  return NextResponse.json({ error: message }, { status });
}

export async function GET(req: Request) {
  const key = process.env.GODADDY_API_KEY;
  const secret = process.env.GODADDY_API_SECRET;

  if (!key || !secret) {
    return jsonError(
      501,
      "GoDaddy API credentials are not configured. Set GODADDY_API_KEY and GODADDY_API_SECRET in .env.local."
    );
  }

  const baseUrl = getGoDaddyBaseUrl();
  const url = new URL(req.url);
  const domain = (url.searchParams.get("domain") || "funstr.fun").trim();

  // This endpoint works as a simple auth/proxy proof even when you own 0 domains.
  const endpoint = new URL("/v1/domains/available", baseUrl);
  endpoint.searchParams.set("domain", domain);
  endpoint.searchParams.set("checkType", "FAST");

  const res = await fetch(endpoint, {
    headers: {
      Accept: "application/json",
      Authorization: `sso-key ${key}:${secret}`,
    },
    cache: "no-store",
  });

  const raw = await res.text();
  let parsed: unknown = raw;
  try {
    parsed = raw ? JSON.parse(raw) : null;
  } catch {
    // leave as text
  }

  if (!res.ok) {
    const status = res.status >= 400 && res.status < 600 ? res.status : 502;
    return NextResponse.json(
      {
        error: "GoDaddy API request failed.",
        status: res.status,
        details: parsed,
        baseUrl,
        checkedDomain: domain,
      },
      { status }
    );
  }

  return NextResponse.json(
    {
      ok: true,
      baseUrl,
      checkedDomain: domain,
      availability: parsed,
    },
    { status: 200 }
  );
}


