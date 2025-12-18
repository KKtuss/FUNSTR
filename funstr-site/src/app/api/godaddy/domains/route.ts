import { NextResponse } from "next/server";

import type { GoDaddyDomain } from "@/lib/godaddy";
import { getGoDaddyBaseUrl } from "@/lib/godaddy";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type CacheEntry = { at: number; data: unknown };

// Simple in-memory cache (best-effort; may be reset in serverless environments).
let cache: CacheEntry | null = null;

const CACHE_MS = 60_000;

function jsonError(status: number, message: string) {
  return NextResponse.json({ error: message }, { status });
}

function buildMockDomains(): GoDaddyDomain[] {
  const now = Date.now();
  return Array.from({ length: 10 }).map((_, i) => {
    const createdAt = new Date(now - i * 60_000).toISOString();
    const expires = new Date(now + 1000 * 60 * 60 * 24 * 365).toISOString();
    return {
      domain: `funstr-${(1000 + i).toString().slice(-4)}.fun`,
      status: "ACTIVE",
      createdAt,
      expires,
      renewalPeriod: 1,
      privacy: i % 3 === 0,
      autoRenew: i % 2 === 0,
      locked: true,
      nameServers: ["ns1.vercel-dns.com", "ns2.vercel-dns.com"],
    };
  });
}

function pickSearchParams(src: URLSearchParams, keys: string[]) {
  const out = new URLSearchParams();
  for (const key of keys) {
    const v = src.get(key);
    if (v) out.set(key, v);
  }
  return out;
}

function asRecord(v: unknown): Record<string, unknown> | null {
  if (typeof v !== "object" || v === null) return null;
  if (Array.isArray(v)) return null;
  return v as Record<string, unknown>;
}

function getString(rec: Record<string, unknown>, key: string) {
  const v = rec[key];
  return typeof v === "string" ? v : undefined;
}

function getNumber(rec: Record<string, unknown>, key: string) {
  const v = rec[key];
  return typeof v === "number" ? v : undefined;
}

function getBoolean(rec: Record<string, unknown>, key: string) {
  const v = rec[key];
  return typeof v === "boolean" ? v : undefined;
}

function getStringArray(rec: Record<string, unknown>, key: string) {
  const v = rec[key];
  if (!Array.isArray(v)) return undefined;
  return v.every((x) => typeof x === "string") ? (v as string[]) : undefined;
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const refresh = url.searchParams.get("refresh") === "1";

  if (!refresh && cache && Date.now() - cache.at < CACHE_MS) {
    return NextResponse.json(cache.data, {
      headers: { "Cache-Control": "private, max-age=60" },
    });
  }

  const key = process.env.GODADDY_API_KEY;
  const secret = process.env.GODADDY_API_SECRET;

  const forceMock = process.env.FUNSTR_MOCK_DOMAINS === "1";
  const disableMock = process.env.FUNSTR_DISABLE_MOCK_DOMAINS === "1";

  // If creds aren't set (or mock is forced), return a mock list so the site
  // still works in production before GoDaddy is configured.
  if (forceMock || (!key || !secret)) {
    if (!disableMock) {
      const domains = buildMockDomains();
      cache = {
        at: Date.now(),
        data: { domains, fetchedAt: new Date().toISOString(), mock: true },
      };
      return NextResponse.json(cache.data, {
        headers: { "Cache-Control": "private, max-age=60" },
      });
    }

    return jsonError(
      501,
      "GoDaddy API credentials are not configured. Set GODADDY_API_KEY and GODADDY_API_SECRET in .env.local."
    );
  }

  const baseUrl = getGoDaddyBaseUrl();
  const endpoint = new URL("/v1/domains", baseUrl);
  const passthrough = pickSearchParams(url.searchParams, [
    "statuses",
    "statusGroups",
    "includes",
  ]);
  endpoint.search = passthrough.toString();

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
        details: typeof parsed === "string" ? parsed : parsed,
      },
      { status }
    );
  }

  if (!Array.isArray(parsed)) {
    return NextResponse.json(
      {
        error: "Unexpected GoDaddy API response shape (expected an array).",
        details: parsed,
      },
      { status: 502 }
    );
  }

  // Best-effort normalization: keep only safe fields we want to display.
  const domains = parsed.map((row): GoDaddyDomain => {
    const rec = asRecord(row) ?? {};
    return {
      domain: getString(rec, "domain") ?? "",
      status: getString(rec, "status"),
      createdAt: getString(rec, "createdAt"),
      expires: getString(rec, "expires"),
      renewalPeriod: getNumber(rec, "renewalPeriod"),
      privacy: getBoolean(rec, "privacy"),
      autoRenew: getBoolean(rec, "renewAuto"),
      locked: getBoolean(rec, "locked"),
      nameServers: getStringArray(rec, "nameServers"),
    };
  });

  cache = { at: Date.now(), data: { domains, fetchedAt: new Date().toISOString() } };

  return NextResponse.json(cache.data, {
    headers: { "Cache-Control": "private, max-age=60" },
  });
}


