"use client";

import * as React from "react";
import Link from "next/link";

type DomainsApiResponse =
  | {
      domains: Array<{ domain: string; createdAt?: string }>;
      fetchedAt: string;
    }
  | { error: string; status?: number };

function fmtShortDate(iso?: string) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return new Intl.DateTimeFormat(undefined, {
    year: "2-digit",
    month: "2-digit",
    day: "2-digit",
  }).format(d);
}

function fmtAgo(iso: string | undefined, nowMs: number) {
  if (!iso) return "—";
  const d = new Date(iso);
  const t = d.getTime();
  if (Number.isNaN(t)) return "—";

  const diffMs = Math.max(0, nowMs - t);
  const s = Math.floor(diffMs / 1000);
  if (s < 5) return "just now";
  if (s < 60) return `${s}s ago`;

  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;

  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;

  const days = Math.floor(h / 24);
  return `${days}d ago`;
}

export function LatestDomainsTerminal() {
  const [items, setItems] = React.useState<Array<{ domain: string; createdAt?: string }>>([]);
  const [fetchedAt, setFetchedAt] = React.useState<string | undefined>(undefined);
  const [nowMs, setNowMs] = React.useState(() => Date.now());

  React.useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await fetch("/api/godaddy/domains", { cache: "no-store" });
        const json = (await res.json()) as DomainsApiResponse;
        if (cancelled) return;

        if (json && !("error" in json) && Array.isArray(json.domains)) {
          setFetchedAt(json.fetchedAt);
          const latest = [...json.domains]
            .filter((d) => typeof d.domain === "string" && d.domain.length > 0)
            .sort((a, b) => {
              const ta = a.createdAt ? new Date(a.createdAt).getTime() : 0;
              const tb = b.createdAt ? new Date(b.createdAt).getTime() : 0;
              return tb - ta;
            })
            .slice(0, 10);
          setItems(latest);
        } else {
          setItems([]);
        }
      } catch {
        if (!cancelled) setItems([]);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  React.useEffect(() => {
    const id = window.setInterval(() => setNowMs(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <div className="rounded-3xl bg-black/35 p-4 ring-1 ring-white/10 sm:p-8">
      <div className="flex flex-col items-center gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-center text-sm font-extrabold text-white sm:text-left sm:text-base">
          Latest bought domains
        </div>
        {fetchedAt ? (
          <div className="text-xs text-white/45">{fmtShortDate(fetchedAt)}</div>
        ) : null}
      </div>

      <div className="mt-3 rounded-2xl bg-black/30 p-4 font-mono text-[12px] leading-6 text-white/75 ring-1 ring-white/10 sm:text-[13px]">
        <div className="flex items-center justify-between text-[11px] text-white/40 sm:text-xs">
          <div>Domain</div>
          <div>Added</div>
        </div>
        <div className="mt-2 space-y-1">
          {items.length === 0 ? (
            <div className="text-white/55">no domains yet</div>
          ) : (
            items.map((d, idx) => (
              <div
                key={`${d.domain}-${idx}`}
                className="flex items-center justify-between gap-3"
              >
                <a
                  href={`https://${d.domain}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="min-w-0 truncate text-white/85 hover:text-white hover:underline"
                  title={`${d.domain}${d.createdAt ? ` • ${d.createdAt}` : ""}`}
                >
                  {d.domain}
                </a>
                <div className="shrink-0 text-white/35">
                  {fmtAgo(d.createdAt, nowMs)}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="mt-3 text-center text-xs text-white/45 sm:text-left">
        Source:{" "}
        <Link href="/domains" className="hover:text-white/70 hover:underline">
          /domains
        </Link>
      </div>
    </div>
  );
}


