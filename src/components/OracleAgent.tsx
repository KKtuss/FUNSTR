"use client";

import * as React from "react";

type OracleDomainExplanation = {
  kind: "domain";
  domain: string;
  score: number;
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

type DomainsApiResponse =
  | { domains: Array<{ domain: string; createdAt?: string }>; fetchedAt: string }
  | { error: string; status?: number };

function badgeForVerdict(v: OracleDomainExplanation["verdict"]) {
  if (v === "strong") return { label: "STRONG", cls: "bg-cyan-300/15 text-cyan-200 ring-cyan-300/30" };
  if (v === "weak") return { label: "WEAK", cls: "bg-rose-300/10 text-rose-200 ring-rose-300/25" };
  return { label: "OKAY", cls: "bg-white/10 text-white/70 ring-white/15" };
}

export function OracleAgent() {
  const [domains, setDomains] = React.useState<string[]>([]);
  const [domain, setDomain] = React.useState("");
  const [domainResult, setDomainResult] = React.useState<OracleDomainExplanation | null>(null);
  const [hydrated, setHydrated] = React.useState(false);
  const [loadingDomain, setLoadingDomain] = React.useState(false);
  const [loadingLatest, setLoadingLatest] = React.useState(false);
  const [latestBreakdown, setLatestBreakdown] = React.useState<OracleDomainExplanation[]>([]);

  React.useEffect(() => {
    setHydrated(true);
  }, []);

  React.useEffect(() => {
    let cancelled = false;
    async function loadDomains() {
      try {
        const res = await fetch("/api/godaddy/domains", { cache: "no-store" });
        const json = (await res.json()) as DomainsApiResponse;
        if (cancelled) return;
        if (json && !("error" in json) && Array.isArray(json.domains)) {
          const list = json.domains.map((d) => d.domain).filter(Boolean).slice(0, 30);
          setDomains(list);
          setDomain((prev) => prev || list[0] || "");
        }
      } catch {
        // ignore
      }
    }
    void loadDomains();
    return () => {
      cancelled = true;
    };
  }, []);

  React.useEffect(() => {
    let cancelled = false;
    async function loadLatestBreakdown() {
      setLoadingLatest(true);
      try {
        const res = await fetch("/api/godaddy/domains?refresh=1", { cache: "no-store" });
        const json = (await res.json()) as DomainsApiResponse;
        if (cancelled) return;
        if (!json || "error" in json || !Array.isArray(json.domains)) {
          setLatestBreakdown([]);
          return;
        }

        const latest2 = [...json.domains]
          .filter((d) => typeof d.domain === "string" && d.domain.length > 0)
          .sort((a, b) => {
            const ta = a.createdAt ? new Date(a.createdAt).getTime() : 0;
            const tb = b.createdAt ? new Date(b.createdAt).getTime() : 0;
            return tb - ta;
          })
          .slice(0, 2);

        const results = await Promise.all(
          latest2.map(async (d) => {
            const r = await fetch(
              `/api/oracle?mode=domain&domain=${encodeURIComponent(d.domain)}`,
              { cache: "no-store" }
            );
            return (await r.json()) as OracleDomainExplanation;
          })
        );

        if (cancelled) return;
        setLatestBreakdown(results.filter((r) => r && r.kind === "domain"));
      } finally {
        if (!cancelled) setLoadingLatest(false);
      }
    }
    void loadLatestBreakdown();
    return () => {
      cancelled = true;
    };
  }, []);

  async function explain() {
    const d = domain.trim();
    if (!d) return;
    setLoadingDomain(true);
    try {
      const res = await fetch(`/api/oracle?mode=domain&domain=${encodeURIComponent(d)}`, {
        cache: "no-store",
      });
      const json = (await res.json()) as OracleDomainExplanation;
      if (json && json.kind === "domain") setDomainResult(json);
    } finally {
      setLoadingDomain(false);
    }
  }

  const verdictBadge = domainResult ? badgeForVerdict(domainResult.verdict) : null;

  return (
    <div className="rounded-3xl bg-black/35 p-4 ring-1 ring-white/10 sm:p-8">
      <div className="flex flex-col items-center justify-between gap-2 sm:flex-row sm:items-center sm:gap-4">
        <div className="text-center text-sm font-extrabold text-white sm:text-left sm:text-base">
          Claude Domain Agent
        </div>
        <div className="text-center text-xs text-white/45 sm:text-left">
          {hydrated ? "" : "Loading…"}
        </div>
      </div>

      <div className="mt-4 grid gap-3 lg:grid-cols-3 lg:gap-4">
        {/* Pipeline analysis */}
        <div className="rounded-2xl bg-black/30 p-4 ring-1 ring-white/10 sm:p-5 lg:col-span-2">
          <div className="flex flex-col items-center justify-between gap-2 sm:flex-row sm:items-center">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-white/45">
              Latest acquisitions (breakdown)
            </div>
            <div className="text-xs text-white/40">{loadingLatest ? "Refreshing…" : ""}</div>
          </div>

          {!latestBreakdown.length ? (
            <div className="mt-3 text-sm text-white/55">
              {loadingLatest ? "Analyzing latest buys…" : "No domains found yet."}
            </div>
          ) : (
            <>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                {latestBreakdown.slice(0, 2).map((r) => {
                  const b = badgeForVerdict(r.verdict);
                  return (
                    <div key={r.domain} className="rounded-xl bg-black/25 p-3 ring-1 ring-white/10">
                      <div className="flex flex-col items-center justify-between gap-2 sm:flex-row sm:items-center">
                        <div className="min-w-0 text-center font-mono text-[12px] text-white/80 sm:text-left">
                          <span className="break-all">{r.domain}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="text-xs font-extrabold text-cyan-200">{r.score}/100</div>
                          <div
                            className={[
                              "rounded-full px-2 py-1 text-[10px] font-extrabold tracking-wider ring-1",
                              b.cls,
                            ].join(" ")}
                          >
                            {b.label}
                          </div>
                        </div>
                      </div>

                      <div className="mt-3 space-y-2 text-sm text-white/70">
                        {r.reasons.slice(0, 4).map((reason) => (
                          <div key={reason} className="flex items-start gap-2">
                            <div className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-300/70" />
                            <div>{reason}</div>
                          </div>
                        ))}
                      </div>

                      {r.cautions.length ? (
                        <div className="mt-3 border-t border-white/10 pt-3 text-sm text-white/55">
                          {r.cautions.slice(0, 2).map((c) => (
                            <div key={c} className="flex items-start gap-2">
                              <div className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-white/30" />
                              <div>{c}</div>
                            </div>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* Explain */}
        <div className="rounded-2xl bg-black/30 p-4 ring-1 ring-white/10 sm:p-5">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-white/45">
            Why this domain?
          </div>

          <div className="mt-3 flex flex-col items-center gap-2 sm:flex-row sm:items-center">
            <select
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              className="w-full rounded-xl bg-black/40 px-3 py-2 text-sm text-white/85 ring-1 ring-white/10 focus:outline-none focus:ring-white/25 sm:flex-1"
            >
              {domains.length ? (
                domains.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))
              ) : (
                <option value="">No domains loaded</option>
              )}
            </select>

            <button
              type="button"
              onClick={explain}
              className="w-full rounded-xl bg-white/10 px-3 py-2 text-sm font-semibold text-white/85 ring-1 ring-white/15 hover:bg-white/12 hover:ring-white/25 sm:w-auto"
              disabled={loadingDomain}
            >
              {loadingDomain ? "Thinking…" : "Explain"}
            </button>
          </div>

          <div className="mt-3 rounded-xl bg-black/25 p-3 ring-1 ring-white/10">
            {!domainResult ? (
              <div className="text-sm text-white/55">
                Pick a domain and we’ll explain the signals it shows.
              </div>
            ) : (
              <>
                <div className="flex flex-col items-center justify-between gap-2 sm:flex-row sm:items-center">
                  <div className="min-w-0 text-center font-mono text-[12px] text-white/80 sm:text-left">
                    <span className="break-all">{domainResult.domain}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-xs font-extrabold text-cyan-200">
                      {domainResult.score}/100
                    </div>
                    {verdictBadge ? (
                      <div
                        className={[
                          "rounded-full px-2 py-1 text-[10px] font-extrabold tracking-wider ring-1",
                          verdictBadge.cls,
                        ].join(" ")}
                      >
                        {verdictBadge.label}
                      </div>
                    ) : null}
                  </div>
                </div>

                <div className="mt-3 space-y-2 text-sm text-white/70">
                  {domainResult.reasons.slice(0, 4).map((r) => (
                    <div key={r} className="flex items-start gap-2">
                      <div className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-300/70" />
                      <div>{r}</div>
                    </div>
                  ))}
                </div>

                {domainResult.cautions.length ? (
                  <div className="mt-3 border-t border-white/10 pt-3 text-sm text-white/55">
                    {domainResult.cautions.slice(0, 2).map((c) => (
                      <div key={c} className="flex items-start gap-2">
                        <div className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-white/30" />
                        <div>{c}</div>
                      </div>
                    ))}
                  </div>
                ) : null}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}


