import { NextResponse } from "next/server";
import { readFile } from "node:fs/promises";
import path from "node:path";

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
  // Return empty for now - will be populated with a provided list of 40 domains
  // that will be added 2 per minute over 20 minutes
  return [];
}

function priceForDomainUsd(domain: string) {
  // Deterministic price per domain so it feels random but doesn’t change on refresh.
  // Range: 2.00 .. 10.00 (inclusive-ish).
  let h = 2166136261;
  for (let i = 0; i < domain.length; i++) {
    h ^= domain.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  const r = (h % 1_000_000) / 1_000_000; // 0..1
  const price = 2 + r * 8;
  return Math.round(price * 100) / 100;
}

function attachPrices(domains: GoDaddyDomain[]) {
  return domains.map((d) => ({
    ...d,
    priceUsd: typeof d.domain === "string" && d.domain ? priceForDomainUsd(d.domain) : undefined,
  }));
}

function sumTotalSpentUsd(domains: Array<{ priceUsd?: number }>) {
  return (
    Math.round(
      domains.reduce((acc, d) => acc + (typeof d.priceUsd === "number" ? d.priceUsd : 0), 0) * 100
    ) / 100
  );
}

async function readManualDomains(): Promise<GoDaddyDomain[] | null> {
  const manualPath =
    process.env.FUNSTR_MANUAL_DOMAINS_PATH ||
    path.join(process.cwd(), "data", "domains.json");

  try {
    const raw = await readFile(manualPath, "utf8");
    const parsed: unknown = JSON.parse(raw);
    const list: unknown =
      Array.isArray(parsed) ? parsed : (parsed as { domains?: unknown }).domains;
    if (!Array.isArray(list)) return null;

    const out: GoDaddyDomain[] = [];
    for (const row of list) {
      if (typeof row !== "object" || row === null || Array.isArray(row)) continue;
      const rec = row as Record<string, unknown>;
      const domain = typeof rec.domain === "string" ? rec.domain : "";
      if (!domain) continue;
      const createdAt = typeof rec.createdAt === "string" ? rec.createdAt : undefined;
      out.push({
        domain,
        status: "ACTIVE",
        createdAt,
        renewalPeriod: 1,
        locked: true,
      });
    }

    return out.length ? out : null;
  } catch {
    return null;
  }
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
  const forceManual = process.env.FUNSTR_MANUAL_DOMAINS === "1";

  if (forceManual) {
    const domains = attachPrices((await readManualDomains()) ?? []);
    cache = {
      at: Date.now(),
      data: {
        domains,
        fetchedAt: new Date().toISOString(),
        source: "manual",
        stats: { domainsBought: domains.length, totalSpentUsd: sumTotalSpentUsd(domains) },
      },
    };
    return NextResponse.json(cache.data, {
      headers: { "Cache-Control": "private, max-age=60" },
    });
  }

  // If creds aren't set (or mock is forced), return a mock list so the site
  // still works in production before GoDaddy is configured.
  if (forceMock || (!key || !secret)) {
    const manual = await readManualDomains();
    if (manual && manual.length) {
      const domains = attachPrices(manual);
      cache = {
        at: Date.now(),
        data: {
          domains,
          fetchedAt: new Date().toISOString(),
          source: "manual",
          stats: { domainsBought: domains.length, totalSpentUsd: sumTotalSpentUsd(domains) },
        },
      };
      return NextResponse.json(cache.data, {
        headers: { "Cache-Control": "private, max-age=60" },
      });
    }

    if (!disableMock) {
      const domains = attachPrices(buildMockDomains());
      cache = {
        at: Date.now(),
        data: {
          domains,
          fetchedAt: new Date().toISOString(),
          mock: true,
          source: "mock",
          stats: { domainsBought: domains.length, totalSpentUsd: sumTotalSpentUsd(domains) },
        },
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

  const withPrices = attachPrices(domains);
  cache = {
    at: Date.now(),
    data: {
      domains: withPrices,
      fetchedAt: new Date().toISOString(),
      source: "godaddy",
      stats: { domainsBought: withPrices.length, totalSpentUsd: sumTotalSpentUsd(withPrices) },
    },
  };

  return NextResponse.json(cache.data, {
    headers: { "Cache-Control": "private, max-age=60" },
  });
}


