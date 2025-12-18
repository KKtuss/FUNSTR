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
  // “Prop” reserve: realistic-ish .fun names + timestamps spread across days.
  // Deterministic per UTC day so it feels random but doesn’t change every refresh.
  const now = Date.now();
  const day = new Date(now).toISOString().slice(0, 10);

  function hash32(input: string) {
    let h = 2166136261;
    for (let i = 0; i < input.length; i++) {
      h ^= input.charCodeAt(i);
      h = Math.imul(h, 16777619) >>> 0;
    }
    return h >>> 0;
  }

  function mulberry32(seed: number) {
    let a = seed >>> 0;
    return () => {
      a |= 0;
      a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  const rand = mulberry32(hash32(`funstr:mock:${day}`));

  const a = [
    "meme",
    "fun",
    "vibe",
    "lol",
    "hype",
    "party",
    "arcade",
    "pixel",
    "toon",
    "clip",
    "beat",
    "dance",
    "spin",
    "quiz",
    "crew",
    "club",
    "chat",
    "stream",
    "creator",
    "viral",
    "random",
    "luck",
    "play",
  ];
  const b = [
    "lab",
    "labs",
    "studio",
    "vault",
    "arena",
    "zone",
    "hub",
    "room",
    "loop",
    "stash",
    "mint",
    "drop",
    "show",
    "wave",
    "party",
    "games",
    "bot",
  ];

  function pick<T>(arr: T[]) {
    return arr[Math.floor(rand() * arr.length)]!;
  }

  function makeLabel(i: number) {
    const w1 = pick(a);
    const w2 = pick(b);
    const w3 = pick(a);

    // 55% single word, 40% hyphenated two-word, 5% three-part.
    let label =
      rand() < 0.55 ? w1 : rand() < 0.95 ? `${w1}-${w2}` : `${w1}-${w2}-${w3}`;

    // Rare numeric flair (kept low for realism).
    if (rand() < 0.08) label = `${label}${String(10 + Math.floor(rand() * 90))}`;

    // Ensure uniqueness if collisions happen.
    if (i > 0 && rand() < 0.1) label = `${label}-${String(1 + Math.floor(rand() * 9))}`;

    // Keep labels reasonable length.
    return label.slice(0, 20);
  }

  const N = 24;
  const newestAgeMs =
    (2 * 60 * 60 * 1000) + Math.floor(rand() * 6 * 60 * 60 * 1000); // 2h..8h

  const out: GoDaddyDomain[] = [];
  for (let i = 0; i < N; i++) {
    // Spread across ~7 days, newest not “seconds ago”.
    const spacingMs =
      (4 * 60 * 60 * 1000) + Math.floor(rand() * 6 * 60 * 60 * 1000); // 4h..10h
    const jitterMs = Math.floor(rand() * 20 * 60 * 1000); // up to 20m
    const createdAt = new Date(now - newestAgeMs - i * spacingMs - jitterMs).toISOString();
    const expires = new Date(now + 1000 * 60 * 60 * 24 * (320 + Math.floor(rand() * 120))).toISOString();
    out.push({
      domain: `${makeLabel(i)}.fun`,
      status: "ACTIVE",
      createdAt,
      expires,
      renewalPeriod: 1,
      privacy: rand() < 0.35,
      autoRenew: rand() < 0.55,
      locked: true,
      nameServers: ["ns1.vercel-dns.com", "ns2.vercel-dns.com"],
    });
  }

  // Sort newest first for nicer UIs
  out.sort((x, y) => {
    const tx = x.createdAt ? new Date(x.createdAt).getTime() : 0;
    const ty = y.createdAt ? new Date(y.createdAt).getTime() : 0;
    return ty - tx;
  });

  return out;
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
    const domains = (await readManualDomains()) ?? [];
    cache = {
      at: Date.now(),
      data: { domains, fetchedAt: new Date().toISOString(), source: "manual" },
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
      cache = {
        at: Date.now(),
        data: { domains: manual, fetchedAt: new Date().toISOString(), source: "manual" },
      };
      return NextResponse.json(cache.data, {
        headers: { "Cache-Control": "private, max-age=60" },
      });
    }

    if (!disableMock) {
      const domains = buildMockDomains();
      cache = {
        at: Date.now(),
        data: { domains, fetchedAt: new Date().toISOString(), mock: true, source: "mock" },
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

  cache = { at: Date.now(), data: { domains, fetchedAt: new Date().toISOString(), source: "godaddy" } };

  return NextResponse.json(cache.data, {
    headers: { "Cache-Control": "private, max-age=60" },
  });
}


