import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

import type { GoDaddyDomain } from "@/lib/godaddy";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

console.log("Oracle Route Init: Key present?", !!process.env.ANTHROPIC_API_KEY);

// Initialize client only if key is present
const anthropic = process.env.ANTHROPIC_API_KEY
  ? new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  : null;

type DomainsApiResponse =
  | {
      domains: GoDaddyDomain[];
      fetchedAt: string;
      source?: "mock" | "manual" | "godaddy";
      stats?: { domainsBought?: number; totalSpentUsd?: number };
    }
  | { error: string; status?: number };

type OracleDomainExplanation = {
  kind: "domain";
  domain: string;
  score: number; // 0..100
  verdict: "strong" | "okay" | "weak";
  reasons: string[];
  cautions: string[];
  features: {
    label: string;
    labelLen: number;
    tokens: string[];
    hasHyphen: boolean;
    hasDigits: boolean;
    vowelPct: number;
  };
  generatedAt: string;
};

type OraclePipelineAnalysis = {
  kind: "pipeline";
  summary: string;
  issues: Array<{
    severity: "low" | "med" | "high";
    title: string;
    detail: string;
  }>;
  recommendations: string[];
  targetCriteria: string[]; // 3 bullets
  suggestedDomains: string[];
  basedOn: {
    domainsBought: number;
    fetchedAt?: string;
    source?: string;
  };
  generatedAt: string;
};

async function askClaude(domain: string): Promise<OracleDomainExplanation> {
  if (!anthropic) throw new Error("No API key");

  const prompt = `
    You are a domain name appraiser for the .fun TLD.
    Analyze the domain "${domain}".
    
    Context:
    - .fun domains are popular for memes, creators, AI agents, and games.
    - Short, punchy, and culturally relevant names are best.
    
    Return a JSON object strictly matching this schema:
    {
      "score": number (0-100),
      "verdict": "strong" | "okay" | "weak",
      "reasons": ["string", "string", "string"], (3-4 bullet points explaining why),
      "cautions": ["string", "string"], (1-2 downsides),
      "features": {
        "label": "${domain}",
        "labelLen": ${domain.length},
        "tokens": ["word1", "word2"],
        "hasHyphen": boolean,
        "hasDigits": boolean,
        "vowelPct": number
      }
    }
    Response must be valid JSON only.
  `;

  const msg = await anthropic.messages.create({
    model: "claude-3-5-haiku-latest",
    max_tokens: 1000,
    messages: [{ role: "user", content: prompt }],
  });

  // Parse JSON from msg.content
  const text = (msg.content[0] as any).text;
  const jsonStr = text.substring(text.indexOf("{"), text.lastIndexOf("}") + 1);
  return JSON.parse(jsonStr);
}

function jsonError(status: number, message: string) {
  return NextResponse.json({ error: message }, { status });
}

function labelOf(domain: string) {
  const d = domain.trim().toLowerCase();
  const base = d.endsWith(".fun") ? d.slice(0, -4) : d;
  return base.replace(/^\.+|\.+$/g, "");
}

function tokensOf(label: string) {
  return label
    .split("-")
    .flatMap((s) => s.split(/[^a-z0-9]+/g))
    .map((t) => t.trim().toLowerCase())
    .filter(Boolean)
    .filter((t) => t !== "fun");
}

function pct(n: number, d: number) {
  if (!d) return 0;
  return Math.round((n / d) * 100);
}

function clamp(n: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, n));
}

function vowelPctOf(label: string) {
  const letters = label.replace(/[^a-z]/g, "");
  if (!letters) return 0;
  let v = 0;
  for (const ch of letters) if ("aeiouy".includes(ch)) v++;
  return Math.round((v / letters.length) * 100);
}

function topN(items: string[], n: number) {
  const m = new Map<string, number>();
  for (const s of items) m.set(s, (m.get(s) ?? 0) + 1);
  return [...m.entries()].sort((a, b) => b[1] - a[1]).slice(0, n);
}

function stableHash32(input: string) {
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

const GLOBAL_FUN_HINTS = {
  // These are broad "market-aligned" buckets used for explanations + recommendations.
  // Based on real .fun market data: AI terms, novelty/lifestyle terms, and culture-centric keywords.
  keywordTokens: new Set([
    // AI-related (highest reported sales)
    "ai",
    // Novelty & lifestyle (premium registrations)
    "strawberry",
    "loop",
    "instant",
    "idols",
    // Original .fun-native terms
    "meme",
    "creator",
    "clip",
    "beat",
    "dance",
    "quiz",
    "crew",
    "club",
    "chat",
    "stream",
    "viral",
    "random",
    "luck",
    "play",
    "pixel",
    "arcade",
    "party",
    "vibe",
    "toon",
    "games",
  ]),
  // Common naming suffixes on .fun (more "format" than "keyword").
  suffixTokens: new Set([
    "studio",
    "lab",
    "labs",
    "hub",
    "zone",
    "vault",
    "arena",
    "bot",
  ]),
  // Culture-centric numeric terms (meme-friendly, should be recognized despite being numeric)
  cultureNumerics: new Set(["404", "69", "420", "1337"]),
  baseline: {
    avgLabelLen: 6.9,
    brandablePct: 33,
    shortPct: 25,
    hyphenPct: 36,
    digitsPct: 13,
  },
};

function scoreDomain(domain: string) {
  const label = labelOf(domain);
  const hasHyphen = label.includes("-");
  const hasDigits = /\d/.test(label);
  const tokens = tokensOf(label).filter((t) => /^[a-z0-9]+$/.test(t));
  const vowelPct = vowelPctOf(label);
  const labelLen = label.length;
  const lettersOnly = label.replace(/[^a-z]/g, "");

  // Heuristic scoring: 0..100.
  // We bias toward short, clean, pronounceable, market-aligned tokens.
  let score = 50;

  // Length preference: 4..8 sweet spot.
  if (labelLen <= 3) score -= 12;
  else if (labelLen <= 5) score += 10;
  else if (labelLen <= 8) score += 14;
  else if (labelLen <= 12) score += 2;
  else score -= 14 + Math.min(16, labelLen - 12);

  // Structure penalties.
  if (hasHyphen) score -= 8;
  // Check for culture-centric numerics (e.g., "404") that are meme-friendly and market-validated
  const hasCultureNumeric = tokens.some((t) => GLOBAL_FUN_HINTS.cultureNumerics.has(t));
  if (hasDigits) {
    if (hasCultureNumeric) {
      // Culture-centric numerics are acceptable (e.g., "404.fun")
      score -= 3;
    } else {
      score -= 10;
    }
  }

  // “Brandable-ish”: letters-only, medium length.
  const lettersOnlyOk = lettersOnly.length === labelLen;
  if (lettersOnlyOk && labelLen >= 4 && labelLen <= 7) score += 10;

  // Pronounceability proxy: vowel ratio 30–60%.
  if (vowelPct >= 30 && vowelPct <= 60) score += 6;
  else if (vowelPct < 20 || vowelPct > 70) score -= 6;

  // Token alignment.
  const keywordHits = tokens.filter((t) => GLOBAL_FUN_HINTS.keywordTokens.has(t));
  const suffixHits = tokens.filter((t) => GLOBAL_FUN_HINTS.suffixTokens.has(t));
  const cultureNumericHits = tokens.filter((t) => GLOBAL_FUN_HINTS.cultureNumerics.has(t));
  const strongHits = [...new Set([...keywordHits, ...suffixHits, ...cultureNumericHits])];
  if (strongHits.length > 0) score += Math.min(14, 6 + 4 * strongHits.length);

  score = clamp(Math.round(score), 0, 100);

  const reasons: string[] = [];
  const cautions: string[] = [];

  if (labelLen <= 8) reasons.push(`Short label (${labelLen} chars) tends to be easier to recall`);
  else cautions.push(`Long label (${labelLen} chars) can reduce type-in + resale liquidity`);

  if (!hasHyphen) reasons.push("No hyphen (cleaner naming structure)");
  else cautions.push("Hyphenated labels often trade thinner than single-token names");

  if (!hasDigits) reasons.push('No digits (less "generated" vibe)');
  else {
    if (hasCultureNumeric) {
      const cultureNumeric = tokens.find((t) => GLOBAL_FUN_HINTS.cultureNumerics.has(t));
      reasons.push(`Culture-centric numeric (${cultureNumeric}) can resonate in meme-friendly markets`);
    } else {
      cautions.push("Digits can lower trust/brandability for many buyers");
    }
  }

  if (vowelPct >= 30 && vowelPct <= 60) reasons.push(`Pronounceability looks decent (vowels ~${vowelPct}%)`);
  else cautions.push(`Pronounceability may be weaker (vowels ~${vowelPct}%)`);

  if (keywordHits.length || suffixHits.length || cultureNumericHits.length) {
    // Prefer a "pattern" phrasing if we have both a keyword and a suffix (e.g., creator + zone).
    if (keywordHits.length && suffixHits.length) {
      reasons.push(`Market pattern: ${keywordHits[0]} + ${suffixHits[0]}`);
    } else if (cultureNumericHits.length && keywordHits.length) {
      reasons.push(`Market pattern: ${cultureNumericHits[0]} + ${keywordHits[0]}`);
    } else if (keywordHits.length) {
      reasons.push(`Common .fun market keyword(s): ${keywordHits.slice(0, 3).join(", ")}`);
    } else if (cultureNumericHits.length) {
      reasons.push(`Culture-centric numeric: ${cultureNumericHits[0]} (meme-friendly, market-validated)`);
    } else {
      reasons.push(`Common .fun naming suffix: ${suffixHits.slice(0, 2).join(", ")}`);
    }
  } else if (tokens.length) {
    reasons.push(`Readable token(s): ${tokens.slice(0, 3).join(", ")}`);
  }

  let verdict: OracleDomainExplanation["verdict"] = "okay";
  if (score >= 75) verdict = "strong";
  else if (score <= 45) verdict = "weak";

  return {
    score,
    verdict,
    reasons: [...new Set(reasons)].slice(0, 6),
    cautions: [...new Set(cautions)].slice(0, 5),
    features: {
      label,
      labelLen,
      tokens: tokens.slice(0, 6),
      hasHyphen,
      hasDigits,
      vowelPct,
    },
  };
}

function portfolioAnalysis(domains: GoDaddyDomain[], fetchedAt?: string, source?: string): OraclePipelineAnalysis {
  const labels = domains.map((d) => labelOf(d.domain)).filter(Boolean);
  const count = labels.length;
  const hasHyphen = labels.filter((s) => s.includes("-")).length;
  const hasDigits = labels.filter((s) => /\d/.test(s)).length;
  const lettersOnly = labels.map((s) => s.replace(/[^a-z]/g, "")).filter(Boolean);

  const avgLabelLen = count
    ? Math.round((labels.reduce((a, s) => a + s.length, 0) / count) * 10) / 10
    : 0;

  const shortPct = pct(labels.filter((s) => s.length <= 5).length, count);
  const hyphenPct = pct(hasHyphen, count);
  const digitsPct = pct(hasDigits, count);
  const brandablePct = pct(
    labels.filter((s) => /^[a-z]+$/.test(s) && s.length >= 4 && s.length <= 7).length,
    count
  );

  const tokens = labels
    .flatMap((s) => s.split("-"))
    .map((t) => t.replace(/[^a-z]/g, ""))
    .filter((t) => t.length >= 3);

  const topTokens = topN(tokens, 3).map(([t]) => t);

  const issues: OraclePipelineAnalysis["issues"] = [];
  const recs: string[] = [];

  const base = GLOBAL_FUN_HINTS.baseline;
  const deltaHyphen = hyphenPct - base.hyphenPct;
  const deltaDigits = digitsPct - base.digitsPct;
  const deltaLen = avgLabelLen - base.avgLabelLen;

  if (count === 0) {
    issues.push({
      severity: "high",
      title: "No reserve data available",
      detail: "Oracle needs the domain list to produce portfolio-level guidance.",
    });
    return {
      kind: "pipeline",
      summary: "No domains found yet — add domains to unlock oracle guidance.",
      issues,
      recommendations: [],
      targetCriteria: [
        "Prioritize single-token .fun names (4–7 letters)",
        "Avoid digits unless there’s a strong meme/format reason",
        "Keep hyphenation low for better resale liquidity",
      ],
      suggestedDomains: [],
      basedOn: { domainsBought: 0, fetchedAt, source },
      generatedAt: new Date().toISOString(),
    };
  }

  if (deltaHyphen >= 12) {
    issues.push({
      severity: "med",
      title: "Hyphen rate is high vs baseline",
      detail: `Portfolio hyphen rate is ${hyphenPct}% (baseline ~${base.hyphenPct}%). This can reduce aftermarket liquidity.`,
    });
    recs.push("Shift next buys toward single-token names (no hyphen) for better liquidity.");
  }

  if (deltaDigits >= 8) {
    issues.push({
      severity: "med",
      title: "Digit rate is high vs baseline",
      detail: `Portfolio digits rate is ${digitsPct}% (baseline ~${base.digitsPct}%). Digits often score worse on trust/brandability.`,
    });
    recs.push("Reduce digit-heavy picks; if using digits, keep them meaningful (e.g., '24', '69') and avoid random suffixes.");
  }

  if (deltaLen >= 2) {
    issues.push({
      severity: "low",
      title: "Average label length is above baseline",
      detail: `Avg label length is ${avgLabelLen} (baseline ~${base.avgLabelLen}). Shorter names tend to be more liquid.`,
    });
    recs.push("Target 4–8 character labels for the next wave to rebalance average length.");
  }

  if (brandablePct < 25) {
    issues.push({
      severity: "low",
      title: "Low brandable share",
      detail: `Only ${brandablePct}% of names are 4–7 letters (letters-only). These often have the best brandability.`,
    });
    recs.push("Increase the share of 4–7 letter letters-only labels (brandable core).");
  }

  // Always include a "what to look for next" block.
  const targetCriteria = [
    "4–7 letters, letters-only (brandable core)",
    "AI-related terms or novelty/lifestyle keywords (strawberry/loop/instant/idols)",
    "Culture-centric numerics (404) or .fun-native tokens (creator/clip/beat/quiz/party)",
  ];

  // Suggest domains deterministically from the current day + top tokens so it feels “agent-like”.
  const day = new Date().toISOString().slice(0, 10);
  const seed = stableHash32(`oracle:suggest:${day}:${topTokens.join(",")}:${avgLabelLen}`);
  const rand = mulberry32(seed);
  const pick = <T,>(arr: T[]) => arr[Math.floor(rand() * arr.length)]!;
  const tokenPool = [
    ...GLOBAL_FUN_HINTS.keywordTokens,
    ...GLOBAL_FUN_HINTS.suffixTokens,
  ];
  const suffixPool = ["lab", "hub", "zone", "club", "studio", "vault", "room", "loop", "arena"];
  const suggestedDomains: string[] = [];
  while (suggestedDomains.length < 6) {
    const left = pick(tokenPool);
    const right = rand() < 0.55 ? "" : pick(suffixPool);
    const label = (right ? `${left}${right}` : left).slice(0, 14);
    const dom = `${label}.fun`;
    if (!suggestedDomains.includes(dom)) suggestedDomains.push(dom);
  }

  const summary = [
    `Portfolio snapshot: ${count} domains • avg label ${avgLabelLen} • brandable ${brandablePct}% • short ${shortPct}% • hyphen ${hyphenPct}% • digits ${digitsPct}%`,
    topTokens.length ? `Top tokens: ${topTokens.join(", ")}` : "",
  ]
    .filter(Boolean)
    .join(" • ");

  if (!recs.length) {
    recs.push("Keep the mix balanced: stay close to baseline on hyphens/digits while increasing brandable 4–7 letter names.");
  }

  return {
    kind: "pipeline",
    summary,
    issues,
    recommendations: recs.slice(0, 6),
    targetCriteria,
    suggestedDomains,
    basedOn: { domainsBought: count, fetchedAt, source },
    generatedAt: new Date().toISOString(),
  };
}

async function fetchDomainsSnapshot(reqUrl: URL): Promise<DomainsApiResponse> {
  const endpoint = new URL("/api/godaddy/domains?refresh=1", reqUrl.origin);
  const res = await fetch(endpoint, { cache: "no-store" });
  const json = (await res.json()) as DomainsApiResponse;
  return json;
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const mode = (url.searchParams.get("mode") || "pipeline").toLowerCase();
  const requestedDomain = url.searchParams.get("domain") || "";

  const snapshot = await fetchDomainsSnapshot(url);
  if (!snapshot || "error" in snapshot) {
    return jsonError(502, "Oracle could not load domains data.");
  }

  const domains = Array.isArray(snapshot.domains) ? snapshot.domains : [];

  if (mode === "domain") {
    if (!requestedDomain.trim()) {
      return jsonError(400, "Missing domain parameter.");
    }
    const domain = requestedDomain.trim().toLowerCase();

    // Try Claude first if available
    if (anthropic) {
      try {
        const analysis = await askClaude(domain);
        return NextResponse.json(
          { ...analysis, kind: "domain" },
          {
            headers: { "Cache-Control": "private, max-age=30" },
          }
        );
      } catch (e) {
        console.error("Claude failed, falling back to local:", e);
      }
    }

    const analysis = scoreDomain(domain);

    const out: OracleDomainExplanation = {
      kind: "domain",
      domain,
      score: analysis.score,
      verdict: analysis.verdict,
      reasons: analysis.reasons,
      cautions: analysis.cautions,
      features: analysis.features,
      generatedAt: new Date().toISOString(),
    };

    return NextResponse.json(out, {
      headers: { "Cache-Control": "private, max-age=30" },
    });
  }

  const out = portfolioAnalysis(domains, snapshot.fetchedAt, snapshot.source);
  return NextResponse.json(out, {
    headers: { "Cache-Control": "private, max-age=60" },
  });
}
