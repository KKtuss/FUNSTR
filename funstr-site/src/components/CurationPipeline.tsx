"use client";

import * as React from "react";
import Link from "next/link";

type DomainsApiResponse =
  | {
      domains: Array<{ domain: string; createdAt?: string }>;
      fetchedAt: string;
      mock?: boolean;
    }
  | { error: string; status?: number };

function fmtAgo(iso: string | undefined, nowMs: number) {
  if (!iso) return "—";
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return "—";
  const s = Math.floor(Math.max(0, nowMs - t) / 1000);
  if (s < 5) return "just now";
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function fmtDur(ms: number) {
  const s = Math.floor(Math.max(0, ms) / 1000);
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  const d = Math.floor(h / 24);
  return `${d}d`;
}

function fmtCountdown(ms: number) {
  const s = Math.floor(Math.max(0, ms) / 1000);
  const days = Math.floor(s / 86400);
  const hrs = Math.floor((s % 86400) / 3600);
  const mins = Math.floor((s % 3600) / 60);
  const secs = s % 60;
  const core = `${String(hrs).padStart(2, "0")}:${String(mins).padStart(
    2,
    "0"
  )}:${String(secs).padStart(2, "0")}`;
  return days > 0 ? `${days}d ${core}` : core;
}

function labelOf(domain: string) {
  return (domain.split(".")[0] ?? "").toLowerCase();
}

function pct(n: number, d: number) {
  if (!d) return 0;
  return Math.round((n / d) * 100);
}

function topN(items: string[], n: number) {
  const m = new Map<string, number>();
  for (const s of items) m.set(s, (m.get(s) ?? 0) + 1);
  return [...m.entries()].sort((a, b) => b[1] - a[1]).slice(0, n);
}

function dayKeyUTC(ms: number) {
  return new Date(ms).toISOString().slice(0, 10); // YYYY-MM-DD
}

function hash32(input: string) {
  // Simple stable hash for deterministic “prop” signals.
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return h >>> 0;
}

function clamp(n: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, n));
}

function rand01(seed: string) {
  // Stable 0..1 pseudo-random from a string seed.
  return (hash32(seed) % 10_000) / 10_000;
}

function vowelRatioOf(word: string) {
  const letters = word.replace(/[^a-z]/g, "");
  if (!letters) return 0;
  let v = 0;
  for (const ch of letters) if ("aeiouy".includes(ch)) v++;
  return v / letters.length;
}

type MarketKey =
  | { kind: "token"; value: string }
  | { kind: "shape"; value: string }
  | { kind: "start"; value: string };

function parseMarketKey(key: string): MarketKey {
  if (key.startsWith("token:")) return { kind: "token", value: key.slice(6) };
  if (key.startsWith("shape:")) return { kind: "shape", value: key.slice(6) };
  if (key.startsWith("start:")) return { kind: "start", value: key.slice(6) };
  return { kind: "token", value: key };
}

function weightedShapeBaseline(weights: Map<string, number>) {
  // Computes “average market” stats from a shape distribution (strictly naming-structure).
  const re = /([a#\-?])(\d+)/g;
  let totalW = 0;
  let sumLen = 0;
  let wHasHyphen = 0;
  let wHasDigit = 0;
  let wShort = 0; // <=5 chars
  let wBrandable = 0; // 4..7 chars, letters-only

  for (const [shape, w] of weights.entries()) {
    if (!w) continue;
    totalW += w;
    let m: RegExpExecArray | null = null;
    let letters = 0;
    let digits = 0;
    let hyphens = 0;
    let other = 0;
    let total = 0;
    re.lastIndex = 0;
    while ((m = re.exec(shape))) {
      const ch = m[1]!;
      const run = Number(m[2] ?? 0);
      total += run;
      if (ch === "a") letters += run;
      else if (ch === "#") digits += run;
      else if (ch === "-") hyphens += run;
      else other += run;
    }
    sumLen += total * w;
    if (hyphens > 0) wHasHyphen += w;
    if (digits > 0) wHasDigit += w;
    if (total > 0 && total <= 5) wShort += w;
    if (total >= 4 && total <= 7 && digits === 0 && hyphens === 0 && other === 0)
      wBrandable += w;
    void letters; // keep for readability; may be used later for more stats
  }

  const avgLen = totalW ? sumLen / totalW : 0;
  const hyphenRate = totalW ? (wHasHyphen / totalW) * 100 : 0;
  const digitRate = totalW ? (wHasDigit / totalW) * 100 : 0;
  const shortShare = totalW ? (wShort / totalW) * 100 : 0;
  const brandableShare = totalW ? (wBrandable / totalW) * 100 : 0;

  return {
    avgLen: Math.round(avgLen * 10) / 10,
    hyphenRate: Math.round(hyphenRate),
    digitRate: Math.round(digitRate),
    shortShare: Math.round(shortShare),
    brandableShare: Math.round(brandableShare),
  };
}

function scoreToken(value: string, tokenCount: number, today: string) {
  const t = value.toLowerCase();
  const len = t.length;
  const vr = vowelRatioOf(t);
  const syll = syllableGroups(t);

  // Typical aftermarket-ish heuristics:
  // - Short brandables do better
  // - Some vowel presence helps pronounceability
  // - 1–3 vowel-groups is a decent “sayability” proxy
  const lenScore =
    len <= 3 ? 34 : len <= 4 ? 38 : len <= 5 ? 32 : len <= 6 ? 26 : len <= 8 ? 16 : len <= 10 ? 9 : 4;
  const vowelScore =
    vr === 0 ? 0 : vr >= 0.25 && vr <= 0.6 ? 22 : vr >= 0.15 && vr <= 0.72 ? 14 : 7;
  const syllScore = syll >= 1 && syll <= 3 ? 16 : syll === 0 ? 0 : 9;
  const momentum = clamp(Math.round(Math.log2(1 + tokenCount) * 9), 0, 24); // portfolio momentum

  // Light “market regime” wobble so the board changes daily.
  const regime = 0.85 + 0.35 * rand01(`${today}:regime:token:${t}`);

  // Small category bump for common domain keywords (kept generic).
  const keywordBump =
    ["ai", "rooms", "creator", "strawberry", "loop", "instant", "idols", "labs", "studio", "market", "trade", "coin", "dex", "swap", "memes", "meme", "fun", "play", "vault", "reserve"].includes(
      t
    )
      ? 12
      : 0;

  // Penalty for overused keywords we want to deprioritize
  const penalty = ["party", "clip", "quiz", "game", "games"].includes(t) ? -25 : 0;

  const base = (lenScore + vowelScore + syllScore + momentum + keywordBump + penalty) * regime;
  return clamp(base, 0, 100);
}

function scoreShape(value: string, shapeCount: number, today: string) {
  // Shape encoding: letters=a, digits=#, hyphen=-, other=? with run counts (e.g. a5-1#4)
  const re = /([a#\-?])(\d+)/g;
  let m: RegExpExecArray | null = null;
  let letters = 0;
  let digits = 0;
  let hyphens = 0;
  let other = 0;
  let total = 0;
  while ((m = re.exec(value))) {
    const ch = m[1]!;
    const run = Number(m[2] ?? 0);
    total += run;
    if (ch === "a") letters += run;
    else if (ch === "#") digits += run;
    else if (ch === "-") hyphens += run;
    else other += run;
  }

  const letterPct = total ? letters / total : 0;
  const digitPct = total ? digits / total : 0;
  const hyphenPct = total ? hyphens / total : 0;

  const lengthScore =
    total <= 3 ? 36 : total <= 4 ? 40 : total <= 6 ? 34 : total <= 8 ? 24 : total <= 10 ? 14 : 6;
  const purityScore = Math.round(letterPct * 35);
  const penalties = Math.round(digitPct * 26 + hyphenPct * 22 + (other ? 14 : 0));

  const momentum = clamp(Math.round(Math.log2(1 + shapeCount) * 8), 0, 20);
  const regime = 0.88 + 0.32 * rand01(`${today}:regime:shape:${value}`);

  const base = (lengthScore + purityScore + momentum - penalties) * regime;
  return clamp(base, 0, 100);
}

function scoreStart(value: string, startCount: number, today: string) {
  const c = (value[0] ?? "").toLowerCase();
  // Rough “brandable start letter” preference (common in English + domain brandability).
  const weights: Record<string, number> = {
    a: 10,
    b: 12,
    c: 13,
    d: 10,
    e: 9,
    f: 12,
    g: 11,
    h: 9,
    i: 9,
    j: 12,
    k: 12,
    l: 12,
    m: 14,
    n: 11,
    o: 9,
    p: 12,
    q: 7,
    r: 11,
    s: 15,
    t: 13,
    u: 8,
    v: 11,
    w: 10,
    x: 9,
    y: 8,
    z: 9,
  };
  const baseLetter = weights[c] ?? 8;
  const momentum = clamp(Math.round(Math.log2(1 + startCount) * 10), 0, 24);
  const regime = 0.9 + 0.3 * rand01(`${today}:regime:start:${c}`);
  return clamp((baseLetter + momentum) * 2.4 * regime, 0, 100);
}

function signalFor(
  key: string,
  day: string,
  ctx: {
    tokenCounts: Map<string, number>;
    shapeCounts: Map<string, number>;
    startCounts: Map<string, number>;
  }
) {
  const mk = parseMarketKey(key);
  const baseScore =
    mk.kind === "token"
      ? scoreToken(mk.value, ctx.tokenCounts.get(mk.value) ?? 0, day)
      : mk.kind === "shape"
        ? scoreShape(mk.value, ctx.shapeCounts.get(mk.value) ?? 0, day)
        : scoreStart(mk.value, ctx.startCounts.get(mk.value) ?? 0, day);

  // Convert “attractiveness” (0..100) into synthetic market telemetry.
  // Keep it stable within the day, but different day-to-day.
  const jitter = (rand01(`${day}:jitter:${key}`) - 0.5) * 2; // -1..1
  const heat = clamp(baseScore / 100, 0, 1);

  const bids = Math.round(
    clamp(2 + heat * 220 + jitter * (18 + heat * 12), 0, 360)
  );
  const offers = Math.round(
    clamp(0 + heat * 22 + jitter * (2 + heat * 3), 0, 60)
  );
  const watch = Math.round(
    clamp(12 + heat * 640 + jitter * (40 + heat * 80), 0, 1400)
  );

  // Score used purely for ranking patterns on the board.
  const score = bids * 2.6 + offers * 11 + watch * 0.55;
  return { bids, offers, watch, score, baseScore: Math.round(baseScore) };
}

function createdAtMs(iso?: string) {
  if (!iso) return undefined;
  const t = new Date(iso).getTime();
  return Number.isNaN(t) ? undefined : t;
}

function syllableGroups(word: string) {
  // Heuristic: vowel-group count (matches your “syllable count” idea without pretending to be perfect).
  const m = word.match(/[aeiouy]+/g);
  return m ? m.length : 0;
}

function shapeOfLabel(label: string) {
  // letters -> a, digits -> #, hyphen -> -, other -> ?
  const raw = label
    .toLowerCase()
    .replace(/[a-z]/g, "a")
    .replace(/[0-9]/g, "#")
    .replace(/-/g, "-")
    .replace(/[^a#-]/g, "?");

  // Compress runs: aaaa-### -> a4-#3
  let out = "";
  for (let i = 0; i < raw.length; ) {
    const ch = raw[i]!;
    let j = i + 1;
    while (j < raw.length && raw[j] === ch) j++;
    const run = j - i;
    out += `${ch}${run}`;
    i = j;
  }
  return out;
}

type PeriodStats = {
  count: number;
  avgLen: number;
  pDigits: number;
  pHyphen: number;
  vowelPct: number;
  avgSyllables: number;
  topToken?: { token: string; count: number };
};

function computePeriodStats(
  domains: Array<{ domain: string; createdAt?: string }>,
  startMs: number,
  endMs: number
): PeriodStats {
  const picked = domains
    .map((d) => {
      const t = createdAtMs(d.createdAt);
      return t && t >= startMs && t < endMs ? d.domain : undefined;
    })
    .filter((d): d is string => typeof d === "string");

  const labels = picked.map((d) => labelOf(d)).filter(Boolean);
  const count = labels.length;
  const avgLen = count
    ? Math.round((labels.reduce((a, s) => a + s.length, 0) / count) * 10) / 10
    : 0;

  const hyphenCount = labels.filter((s) => s.includes("-")).length;
  const digitCount = labels.filter((s) => /\d/.test(s)).length;
  const pHyphen = pct(hyphenCount, count);
  const pDigits = pct(digitCount, count);

  const lettersOnly = labels.map((s) => s.replace(/[^a-z]/g, "")).filter(Boolean);
  const vowelPct = lettersOnly.length
    ? Math.round(vowelRatioOf(lettersOnly.join("")) * 100)
    : 0;

  const syllables = lettersOnly.map((s) => syllableGroups(s));
  const avgSyllables = syllables.length
    ? Math.round((syllables.reduce((a, n) => a + n, 0) / syllables.length) * 10) /
      10
    : 0;

  const tokens = labels
    .flatMap((s) => s.split("-"))
    .map((t) => t.replace(/[^a-z]/g, ""))
    .filter((t) => t.length >= 3);
  const top = topN(tokens, 1)[0];

  return {
    count,
    avgLen,
    pDigits,
    pHyphen,
    vowelPct,
    avgSyllables,
    topToken: top ? { token: top[0], count: top[1] } : undefined,
  };
}

export function CurationPipeline() {
  const [domains, setDomains] = React.useState<
    Array<{ domain: string; createdAt?: string }>
  >([]);
  const [fetchedAt, setFetchedAt] = React.useState<string | undefined>();
  const skewRef = React.useRef(0);
  const [hydrated, setHydrated] = React.useState(false);
  const [nowMs, setNowMs] = React.useState(() => Date.now());

  // Daily checkup cadence (display-only; the website shows the intended schedule).
  const EVAL_MS = 24 * 60 * 60 * 1000;
  const CURATION_UTC_HOUR = 0;
  const CURATION_UTC_MINUTE = 0;
  const STAGE_MS = 2600;
  const RUN_WINDOW_MS = STAGE_MS * 4;

  React.useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await fetch("/api/godaddy/domains", { cache: "no-store" });
        const json = (await res.json()) as DomainsApiResponse;
        if (cancelled) return;

        if (json && !("error" in json) && Array.isArray(json.domains)) {
          setDomains(json.domains);
          setFetchedAt(json.fetchedAt);
          const serverMs = new Date(json.fetchedAt).getTime();
          if (!Number.isNaN(serverMs)) {
            skewRef.current = serverMs - Date.now();
            setNowMs(Date.now() + skewRef.current);
          }
        } else {
          setDomains([]);
          setFetchedAt(undefined);
        }
      } catch {
        if (!cancelled) {
          setDomains([]);
          setFetchedAt(undefined);
        }
      }
    }

    void load();
    const id = window.setInterval(load, 30_000);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, []);

  React.useEffect(() => {
    setHydrated(true);
    const id = window.setInterval(
      () => setNowMs(Date.now() + skewRef.current),
      1000
    );
    return () => window.clearInterval(id);
  }, []);

  const labels = domains.map((d) => labelOf(d.domain)).filter(Boolean);
  const count = labels.length;

  const createdTimes = domains
    .map((d) => createdAtMs(d.createdAt))
    .filter((t): t is number => typeof t === "number");
  const createdCoverage = pct(createdTimes.length, domains.length);

  const newestCreatedAt =
    createdTimes.length > 0 ? Math.max(...createdTimes) : undefined;
  const oldestCreatedAt =
    createdTimes.length > 0 ? Math.min(...createdTimes) : undefined;

  const acquired24h = createdTimes.filter((t) => nowMs - t <= 24 * 60 * 60 * 1000)
    .length;
  const acquired7d = createdTimes.filter((t) => nowMs - t <= 7 * 24 * 60 * 60 * 1000)
    .length;
  const acquiredPrev24h = createdTimes.filter((t) => {
    const age = nowMs - t;
    return age > 24 * 60 * 60 * 1000 && age <= 48 * 60 * 60 * 1000;
  }).length;

  const avgLen = count
    ? Math.round((labels.reduce((a, s) => a + s.length, 0) / count) * 10) / 10
    : 0;

  const hyphenCount = labels.filter((s) => s.includes("-")).length;
  const digitCount = labels.filter((s) => /\d/.test(s)).length;

  const vowels = new Set(["a", "e", "i", "o", "u", "y"]);
  const lettersOnly = labels.map((s) => s.replace(/[^a-z]/g, "")).filter(Boolean);
  const vowelRatio = lettersOnly.length
    ? (() => {
        let v = 0;
        let t = 0;
        for (const s of lettersOnly) {
          for (const ch of s) {
            t++;
            if (vowels.has(ch)) v++;
          }
        }
        return t ? v / t : 0;
      })()
    : 0;

  const pHyphen = pct(hyphenCount, count);
  const pDigits = pct(digitCount, count);

  const syllables = lettersOnly.map((s) => syllableGroups(s));
  const avgSyllables = syllables.length
    ? Math.round((syllables.reduce((a, n) => a + n, 0) / syllables.length) * 10) /
      10
    : 0;

  // “keyword trends”: split on hyphen, keep alpha tokens >=3 chars
  const tokens = labels
    .flatMap((s) => s.split("-"))
    .map((t) => t.replace(/[^a-z]/g, ""))
    .filter((t) => t.length >= 3);
  const topTokens = topN(tokens, 4);

  // “character composition”: top 3 starting letters
  const starts = labels.map((s) => s[0]).filter((c) => !!c && /[a-z]/.test(c));
  const topStarts = topN(starts, 3);

  const shapes = labels.map((s) => shapeOfLabel(s));
  const topShapes = topN(shapes, 3);

  const today = dayKeyUTC(nowMs);
  const yesterday = dayKeyUTC(nowMs - 24 * 60 * 60 * 1000);

  // Global market baseline (NOT derived from owned domains).
  // We keep this deterministic by seeding only with the UTC day, so all users see the same results.
  // Global .fun market baseline: playful/creator/meme-native keywords + a few “meta” tech terms
  // that commonly show up in .fun naming (still synthetic).
  const globalTokenWeights = new Map<string, number>([
    // Core .fun / entertainment
    ["fun", 96],
    ["play", 88],
    ["game", 30], // Reduced from 86
    ["games", 28], // Reduced from 84
    ["party", 38], // Reduced from 78
    ["vibe", 80],
    ["laugh", 74],
    ["lol", 76],
    ["meme", 92],
    ["memes", 88],
    ["viral", 70],
    ["trend", 68],
    ["hype", 66],
    ["mix", 62],
    ["dance", 60],
    ["music", 58],
    ["beat", 56],
    ["clip", 42], // Reduced from 64
    ["gif", 60],
    ["mash", 54],
    ["quiz", 36], // Reduced from 58
    ["spin", 56],
    ["wheel", 52],
    ["luck", 54],
    ["random", 52],
    ["story", 50],
    ["toon", 48],
    ["pixel", 50],
    ["arcade", 62],
    ["arena", 48],

    // Creator / community / social
    ["creator", 82], // Increased from 72 (market-validated)
    ["crew", 52],
    ["club", 56],
    ["chat", 64],
    ["stream", 62],
    ["live", 58],
    ["social", 54],
    ["fans", 52],
    ["studio", 54],
    ["labs", 52],

    // Market-validated keywords (real .fun sales data)
    ["ai", 88], // Increased from 60 (highest reported sales)
    ["rooms", 85], // Top keyword (2nd position)
    ["creator", 82], // Market-validated (3rd position)
    ["strawberry", 76], // Novelty/lifestyle (premium registrations)
    ["loop", 74], // Novelty/lifestyle (premium registrations)
    ["instant", 72], // Novelty/lifestyle (premium registrations)
    ["idols", 70], // Novelty/lifestyle (premium registrations)

    // Tech-ish but common in .fun ecosystems
    ["bot", 54],
    ["agent", 50],
  ]);

  const globalShapeWeights = new Map<string, number>([
    // Single-word brandables
    ["a3", 72],
    ["a4", 92],
    ["a5", 90],
    ["a6", 84],
    ["a7", 70],
    ["a8", 58],
    ["a9", 48],

    // Two-word hyphenated (very common in fun naming)
    ["a3-1a3", 66],
    ["a4-1a3", 62],
    ["a3-1a4", 64],
    ["a4-1a4", 60],
    ["a5-1a4", 54],
    ["a4-1a5", 52],

    // Light numeric stylings (less preferred, but exists)
    ["a4#2", 40],
    ["a5#2", 36],
    ["a5#3", 30],
    ["a6#2", 28],
  ]);

  const globalStartWeights = new Map<string, number>([
    ["s", 90],
    ["m", 84],
    ["c", 82],
    ["a", 80],
    ["t", 76],
    ["p", 74],
    ["b", 72],
    ["f", 70],
    ["g", 66],
    ["n", 64],
    ["l", 62],
    ["h", 58],
    ["v", 56],
    ["d", 54],
    ["k", 52],
    ["w", 50],
    ["z", 44],
  ]);

  const globalCandidates = [
    ...[...globalTokenWeights.keys()].map((t) => `token:${t}`),
    ...[...globalShapeWeights.keys()].map((s) => `shape:${s}`),
    ...[...globalStartWeights.keys()].map((c) => `start:${c}`),
  ];

  const globalCtx = {
    tokenCounts: globalTokenWeights,
    shapeCounts: globalShapeWeights,
    startCounts: globalStartWeights,
  };

  const todaySignals = globalCandidates.map((k) => ({
    key: k,
    ...signalFor(k, today, globalCtx),
  }));
  const yesterdaySignals = globalCandidates.map((k) => ({
    key: k,
    ...signalFor(k, yesterday, globalCtx),
  }));

  const sumToday = todaySignals.reduce((a, s) => a + s.score, 0);
  const sumYesterday = yesterdaySignals.reduce((a, s) => a + s.score, 0);
  const yByKey = new Map(yesterdaySignals.map((s) => [s.key, s] as const));

  const marketSignalsAll = todaySignals.map((t) => {
    const y = yByKey.get(t.key);
    const dom = sumToday ? (t.score / sumToday) * 100 : 0;
    const domPrev = y && sumYesterday ? (y.score / sumYesterday) * 100 : 0;
    const domDelta = dom - domPrev;
    return {
      key: t.key,
      dominance: Math.round(dom * 10) / 10,
      dominanceDelta: Math.round(domDelta * 10) / 10,
      baseScore: t.baseScore,
    };
  });

  // Top keywords: hardcoded to ai, rooms, creator (in that order)
  const topKeywordsRaw = ["token:ai", "token:rooms", "token:creator"]
    .map((key) => marketSignalsAll.find((s) => s.key === key))
    .filter((s): s is typeof marketSignalsAll[0] => s !== undefined);
  
  // Override dominance values: AI (highest), Rooms (second), Creator (third)
  const topKeywords = topKeywordsRaw.map((s, idx) => {
    const dominanceValues = [1.8, 1.5, 1.2]; // AI, Rooms, Creator (in descending order)
    return {
      ...s,
      dominance: dominanceValues[idx] ?? s.dominance,
    };
  });

  const marketShapeBaseline = weightedShapeBaseline(globalShapeWeights);

  const startUtcMs = Date.UTC(
    new Date(nowMs).getUTCFullYear(),
    new Date(nowMs).getUTCMonth(),
    new Date(nowMs).getUTCDate(),
    CURATION_UTC_HOUR,
    CURATION_UTC_MINUTE,
    0,
    0
  );
  const runStartMs = startUtcMs;
  const runEndMs = runStartMs + RUN_WINDOW_MS;
  const inRun = nowMs >= runStartMs && nowMs < runEndMs;

  const STAGES = ["INGEST", "EXTRACT", "SCORE", "ADAPT"] as const;
  const stageIndex = inRun
    ? Math.min(STAGES.length - 1, Math.floor((nowMs - runStartMs) / STAGE_MS))
    : -1;

  const nextRunMs = nowMs < runStartMs ? runStartMs : runStartMs + EVAL_MS;
  const nextIn = Math.max(0, nextRunMs - nowMs);
  const nextInHrs = Math.ceil(nextIn / 3_600_000);

  const stageTitle =
    stageIndex >= 0 ? STAGES[stageIndex] : "WAITING FOR NEXT CURATION";

  const prevStartMs = runStartMs - EVAL_MS;
  const prevEndMs = runStartMs;
  const curStartMs = runStartMs;
  const curEndMs = nowMs;

  const curStats = computePeriodStats(domains, curStartMs, curEndMs);
  const prevStats = computePeriodStats(domains, prevStartMs, prevEndMs);

  const deltaAvgLen = Math.round((curStats.avgLen - prevStats.avgLen) * 10) / 10;
  const deltaDigits = curStats.pDigits - prevStats.pDigits;
  const deltaHyphen = curStats.pHyphen - prevStats.pHyphen;

  return (
    <div className="rounded-3xl bg-black/35 p-4 ring-1 ring-white/10 sm:p-8">
      <div className="flex flex-col items-center justify-between gap-2 sm:flex-row sm:items-center sm:gap-4">
        <div className="text-center text-sm font-extrabold text-white sm:text-left sm:text-base">
          Curation pipeline snapshot
        </div>

        <div className="flex items-center gap-2 text-xs text-white/45">
          <span className="relative flex h-2.5 w-2.5">
            <span
              className={[
                "absolute inline-flex h-full w-full rounded-full bg-cyan-300/35",
                inRun ? "motion-safe:animate-ping" : "",
              ].join(" ")}
            />
            <span
              className={[
                "relative inline-flex h-2.5 w-2.5 rounded-full",
                inRun ? "bg-cyan-300" : "bg-white/35",
              ].join(" ")}
            />
          </span>
          <span
            title={`Next daily curation at ${String(CURATION_UTC_HOUR).padStart(2, "0")}:${String(CURATION_UTC_MINUTE).padStart(2, "0")} UTC`}
          >
            {hydrated
              ? `${stageTitle} • next curation ${fmtCountdown(nextIn)}`
              : "WAITING FOR NEXT CURATION • next curation --:--:--"}
          </span>
        </div>
      </div>

      <div className="mt-3 rounded-2xl bg-black/30 p-4 ring-1 ring-white/10 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs text-white/45">
            Daily window:{" "}
            <span className="text-white/70">
              {String(CURATION_UTC_HOUR).padStart(2, "0")}:
              {String(CURATION_UTC_MINUTE).padStart(2, "0")} UTC
            </span>
          </div>
          <div className="text-xs text-white/45">
            Reserve{" "}
            <span className="font-semibold text-white/80">{count}</span> • last
            scan {fmtAgo(fetchedAt, nowMs)}
          </div>
        </div>

        <div className="mt-4 grid gap-3 lg:grid-cols-3 lg:gap-4">
          <div className="rounded-2xl bg-black/30 p-4 ring-1 ring-white/10">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-white/45">
              What changed (vs previous day)
            </div>
            <div className="mt-3 space-y-2 text-sm">
              <div className="flex items-center justify-between gap-3">
                <div className="text-white/70">Acquired (24h)</div>
                <div className="font-extrabold text-white/85">
                  {acquired24h}
                </div>
              </div>

              <div className="flex items-center justify-between gap-3 text-xs text-white/55">
                <div>avg label len</div>
                <div className="text-white/75">
                  {curStats.avgLen}{" "}
                  <span className="text-white/45">
                    ({deltaAvgLen >= 0 ? "+" : ""}
                    {deltaAvgLen})
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between gap-3 text-xs text-white/55">
                <div>digits rate</div>
                <div className="text-white/75">
                  {curStats.pDigits}%{" "}
                  <span className="text-white/45">
                    ({deltaDigits >= 0 ? "+" : ""}
                    {deltaDigits}pp)
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between gap-3 text-xs text-white/55">
                <div>hyphen rate</div>
                <div className="text-white/75">
                  {curStats.pHyphen}%{" "}
                  <span className="text-white/45">
                    ({deltaHyphen >= 0 ? "+" : ""}
                    {deltaHyphen}pp)
                  </span>
                </div>
              </div>

              <div className="pt-2 text-xs text-white/55">
                <div className="flex items-center justify-between gap-3">
                  <div>top token</div>
                  <div className="text-white/75">
                    {curStats.topToken ? (
                      <>
                        {curStats.topToken.token}{" "}
                        <span className="text-white/40">
                          ({curStats.topToken.count})
                        </span>
                      </>
                    ) : (
                      "—"
                    )}
                  </div>
                </div>
                <div className="mt-1 flex items-center justify-between gap-3 text-[11px] text-white/40">
                  <div>previous</div>
                  <div>
                    {prevStats.topToken ? (
                      <>
                        {prevStats.topToken.token}{" "}
                        <span className="text-white/30">
                          ({prevStats.topToken.count})
                        </span>
                      </>
                    ) : (
                      "—"
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-black/30 p-4 ring-1 ring-white/10">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-white/45">
              Window diff
            </div>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-black/25 p-3 ring-1 ring-white/10">
                <div className="text-[11px] font-semibold text-white/50">
                  current
                </div>
                <div className="mt-1 text-lg font-black text-white/85">
                  {curStats.count}
                </div>
                <div className="mt-1 text-[11px] text-white/45">
                  vowel {curStats.vowelPct}% • syll {curStats.avgSyllables}
                </div>
              </div>
              <div className="rounded-xl bg-black/25 p-3 ring-1 ring-white/10">
                <div className="text-[11px] font-semibold text-white/50">
                  previous
                </div>
                <div className="mt-1 text-lg font-black text-white/85">
                  {prevStats.count}
                </div>
                <div className="mt-1 text-[11px] text-white/45">
                  vowel {prevStats.vowelPct}% • syll {prevStats.avgSyllables}
                </div>
              </div>
            </div>

            <div className="mt-3 text-xs text-white/45">
              acquired: {acquired24h}/24h • {acquired7d}/7d • newest{" "}
              {newestCreatedAt ? fmtDur(nowMs - newestCreatedAt) : "—"} ago
            </div>
          </div>

          <div className="rounded-2xl bg-black/30 p-4 ring-1 ring-white/10">
            <div className="flex items-center justify-between gap-3">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-white/45">
                Top keywords
              </div>
              <div className="text-[11px] text-white/35">global .fun (daily)</div>
            </div>
            <div className="mt-2 text-[11px] text-white/45">
              avg .fun label{" "}
              <span className="text-white/70">{marketShapeBaseline.avgLen}</span>{" "}
              • brandable{" "}
              <span className="text-white/70">
                {marketShapeBaseline.brandableShare}%
              </span>{" "}
              • short{" "}
              <span className="text-white/70">{marketShapeBaseline.shortShare}%</span>{" "}
              • hyphen{" "}
              <span className="text-white/70">
                {marketShapeBaseline.hyphenRate}%
              </span>{" "}
              • digits{" "}
              <span className="text-white/70">{marketShapeBaseline.digitRate}%</span>
            </div>
            <div className="mt-3 space-y-2">
              {(topKeywords ?? []).map((s) => {
                const label = s.key.replace("token:", "");
                const trend =
                  s.dominanceDelta > 0 ? "↑" : s.dominanceDelta < 0 ? "↓" : "→";
                const dominance = clamp(s.dominance, 0, 100);
                return (
                  <div
                    key={s.key}
                    className="flex items-center justify-between gap-3 rounded-xl bg-black/25 px-3 py-2 ring-1 ring-white/10"
                    title="Dominance = share of synthetic market attention across a global baseline set (derived from common domain heuristics)."
                  >
                    <div className="min-w-0 truncate text-sm font-semibold text-white/85">
                      <span className="mr-2 text-white/40">{trend}</span>
                      {label}
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-white/45">
                      <span className="text-white/40">dominance</span>
                      <div className="hidden w-20 overflow-hidden rounded-full bg-white/10 sm:block">
                        <div
                          className="h-1.5 rounded-full bg-gradient-to-r from-cyan-300/70 via-indigo-400/45 to-transparent"
                          style={{ width: `${dominance}%` }}
                        />
                      </div>
                      <span className="text-white/80">{dominance}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/10">
          <div
            className={[
              "h-full w-1/2 bg-gradient-to-r from-cyan-300/70 via-indigo-400/35 to-transparent",
              inRun ? "motion-safe:animate-pulse" : "opacity-40",
            ].join(" ")}
          />
        </div>
      </div>

      <div className="mt-3 text-xs text-white/45">
        Source:{" "}
        <Link href="/domains" className="hover:text-white/70 hover:underline">
          /domains
        </Link>
      </div>
    </div>
  );
}


