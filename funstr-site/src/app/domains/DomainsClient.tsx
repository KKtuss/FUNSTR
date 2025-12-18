"use client";

import * as React from "react";
import { useVirtualizer } from "@tanstack/react-virtual";

import { Button } from "@/components/ui/Button";

type DomainRow = {
  domain: string;
  status?: string;
  createdAt?: string;
  expires?: string;
  privacy?: boolean;
  autoRenew?: boolean;
  locked?: boolean;
  priceUsd?: number;
};

type ApiResponse =
  | {
      domains: DomainRow[];
      fetchedAt: string;
    }
  | { error: string; status?: number };

function fmtDate(iso?: string) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return new Intl.DateTimeFormat(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
  }).format(d);
}

function fmtUsd(n?: number) {
  if (typeof n !== "number" || Number.isNaN(n)) return "—";
  return `$${n.toFixed(2)}`;
}

function cn(...parts: Array<string | undefined | false>) {
  return parts.filter(Boolean).join(" ");
}

export function DomainsClient() {
  const [data, setData] = React.useState<ApiResponse | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [query, setQuery] = React.useState("");
  const [onlyAutoRenew, setOnlyAutoRenew] = React.useState(false);
  const [onlyPrivacy, setOnlyPrivacy] = React.useState(false);

  const parentRef = React.useRef<HTMLDivElement | null>(null);

  async function load(refresh = false) {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/godaddy/domains${refresh ? "?refresh=1" : ""}`,
        { cache: "no-store" }
      );
      const json = (await res.json()) as ApiResponse;
      setData(json);
    } catch {
      setData({ error: "Failed to load domains." });
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    void load(false);
  }, []);

  const rows = React.useMemo(() => {
    if (!data || "error" in data) return [];
    const q = query.trim().toLowerCase();
    return data.domains
      .filter((d) => (q ? d.domain.toLowerCase().includes(q) : true))
      .filter((d) => (onlyAutoRenew ? d.autoRenew === true : true))
      .filter((d) => (onlyPrivacy ? d.privacy === true : true))
      .sort((a, b) => a.domain.localeCompare(b.domain));
  }, [data, query, onlyAutoRenew, onlyPrivacy]);

  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 56,
    overscan: 14,
  });

  return (
    <div className="rounded-3xl bg-black/35 ring-1 ring-white/10">
      <div className="flex flex-col gap-3 border-b border-white/10 p-4 sm:p-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="text-sm font-extrabold text-white sm:text-base">Domains</div>
          <div className="mt-1 text-sm text-white/60 sm:text-base">
            {loading
              ? "Loading…"
              : data && "error" in data
                ? "Unable to load domains"
                : `${rows.length.toLocaleString()} domains`}
            {data && !("error" in data) && data.fetchedAt ? (
              <span className="text-white/35">
                {" "}
                • fetched {fmtDate(data.fetchedAt)}
              </span>
            ) : null}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button variant="secondary" onClick={() => void load(true)}>
            Refresh
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-3 border-b border-white/10 p-4 sm:gap-4 sm:p-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center">
          <div className="w-full sm:max-w-md">
            <div className="text-xs font-semibold tracking-wide text-white/50 sm:text-sm">
              Search
            </div>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Type a domain (e.g. funstrategy.fun)"
              className="mt-2 w-full rounded-2xl bg-black/30 px-4 py-3 text-sm text-white placeholder:text-white/30 ring-1 ring-white/10 focus:outline-none focus:ring-2 focus:ring-white/25 sm:px-5 sm:py-4 sm:text-base"
            />
          </div>

          <label className="mt-1 inline-flex items-center gap-2 rounded-2xl bg-black/30 px-4 py-3 text-sm font-semibold text-white/75 ring-1 ring-white/10 hover:bg-black/25 sm:mt-7 sm:px-5 sm:py-4 sm:text-base">
            <input
              type="checkbox"
              checked={onlyAutoRenew}
              onChange={(e) => setOnlyAutoRenew(e.target.checked)}
              className="h-4 w-4 accent-white"
            />
            Auto-renew only
          </label>

          <label className="mt-1 inline-flex items-center gap-2 rounded-2xl bg-black/30 px-4 py-3 text-sm font-semibold text-white/75 ring-1 ring-white/10 hover:bg-black/25 sm:mt-7 sm:px-5 sm:py-4 sm:text-base">
            <input
              type="checkbox"
              checked={onlyPrivacy}
              onChange={(e) => setOnlyPrivacy(e.target.checked)}
              className="h-4 w-4 accent-white"
            />
            Privacy only
          </label>
        </div>
      </div>

      <div className="grid grid-cols-6 gap-0 border-b border-white/10 px-4 py-3 text-xs font-semibold tracking-wide text-white/50 sm:px-6 sm:py-4 sm:text-sm sm:grid-cols-12">
        <div className="col-span-5 sm:col-span-4">Domain</div>
        <div className="hidden sm:col-span-2 sm:block">Status</div>
        <div className="hidden sm:col-span-2 sm:block">Created</div>
        <div className="hidden sm:col-span-2 sm:block">Expires</div>
        <div className="hidden sm:col-span-1 sm:block text-right">Price</div>
        <div className="col-span-1 text-right sm:col-span-1">Flags</div>
      </div>

      <div
        ref={parentRef}
        className="relative h-[60vh] overflow-auto sm:h-[70vh]"
        role="region"
        aria-label="Domains list"
      >
        {loading ? (
          <div className="p-4 text-sm text-white/60 sm:p-6 sm:text-base">
            Loading…
          </div>
        ) : data && "error" in data ? (
          <div className="p-4 text-sm text-white/70 sm:p-6 sm:text-base">
            <div className="font-semibold text-white">Unable to load domains.</div>
            <div className="mt-2 text-white/60">
              Please try again later.
              {typeof data.status === "number" ? (
                <span className="text-white/45"> (HTTP {data.status})</span>
              ) : null}
            </div>
          </div>
        ) : rows.length === 0 ? (
          <div className="p-4 text-sm text-white/60 sm:p-6 sm:text-base">
            No matches.
          </div>
        ) : (
          <div style={{ height: `${rowVirtualizer.getTotalSize()}px` }} className="relative">
            {rowVirtualizer.getVirtualItems().map((v) => {
              const d = rows[v.index];
              const flags = [d.locked ? "L" : "", d.autoRenew ? "R" : "", d.privacy ? "P" : ""]
                .filter(Boolean)
                .join("");

              return (
                <div
                  key={v.key}
                  className={cn(
                    "absolute left-0 right-0 grid grid-cols-6 items-center gap-0 border-b border-white/5 px-4 text-sm sm:px-6 sm:text-base sm:grid-cols-12",
                    v.index % 2 === 0 ? "bg-white/[0.02]" : "bg-transparent"
                  )}
                  style={{
                    transform: `translateY(${v.start}px)`,
                    height: `${v.size}px`,
                  }}
                >
                  <a
                    className="col-span-5 truncate font-semibold text-white/90 hover:underline sm:col-span-4"
                    href={`https://${d.domain}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={d.domain}
                  >
                    {d.domain || "—"}
                  </a>
                  <div className="hidden sm:col-span-2 sm:block text-white/70">
                    {d.status ?? "—"}
                  </div>
                  <div className="hidden sm:col-span-2 sm:block text-white/70">
                    {fmtDate(d.createdAt)}
                  </div>
                  <div className="hidden sm:col-span-2 sm:block text-white/70">
                    {fmtDate(d.expires)}
                  </div>
                  <div className="hidden sm:col-span-1 sm:block text-right font-mono text-[12px] text-white/60">
                    {fmtUsd(d.priceUsd)}
                  </div>
                  <div className="col-span-1 text-right font-mono text-[12px] text-white/55 sm:col-span-1">
                    {flags || "—"}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="border-t border-white/10 p-4 text-xs text-white/45 sm:p-6 sm:text-sm">
        Flags: <span className="font-mono">L</span>=locked, <span className="font-mono">R</span>
        =auto-renew, <span className="font-mono">P</span>=privacy.
      </div>
    </div>
  );
}
