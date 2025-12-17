"use client";

import * as React from "react";
import { useVirtualizer } from "@tanstack/react-virtual";

import { Button } from "@/components/ui/Button";

type DomainRow = {
  domain: string;
  status?: string;
  createdAt?: string;
  expires?: string;
  renewalPeriod?: number;
  privacy?: boolean;
  autoRenew?: boolean;
  locked?: boolean;
};

type ApiResponse =
  | {
      domains: DomainRow[];
      fetchedAt: string;
    }
  | { error: string; status?: number; details?: unknown };

type StatusResponse =
  | {
      ok: true;
      baseUrl: string;
      checkedDomain: string;
      availability: unknown;
    }
  | { error: string; status?: number; details?: unknown; baseUrl?: string };

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

function cn(...parts: Array<string | undefined | false>) {
  return parts.filter(Boolean).join(" ");
}

export function DomainsClient() {
  const [data, setData] = React.useState<ApiResponse | null>(null);
  const [status, setStatus] = React.useState<StatusResponse | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [loadingStatus, setLoadingStatus] = React.useState(true);
  const [query, setQuery] = React.useState("");
  const [onlyAutoRenew, setOnlyAutoRenew] = React.useState(false);
  const [onlyPrivacy, setOnlyPrivacy] = React.useState(false);

  const parentRef = React.useRef<HTMLDivElement | null>(null);

  async function load(refresh = false) {
    setLoading(true);
    try {
      const res = await fetch(`/api/godaddy/domains${refresh ? "?refresh=1" : ""}`, {
        cache: "no-store",
      });
      const json = (await res.json()) as ApiResponse;
      setData(json);
    } catch {
      setData({ error: "Failed to load domains." });
    } finally {
      setLoading(false);
    }
  }

  async function loadStatus() {
    setLoadingStatus(true);
    try {
      const res = await fetch("/api/godaddy/status?domain=funstr.fun", {
        cache: "no-store",
      });
      const json = (await res.json()) as StatusResponse;
      setStatus(json);
    } catch {
      setStatus({ error: "Failed to check GoDaddy connection." });
    } finally {
      setLoadingStatus(false);
    }
  }

  React.useEffect(() => {
    void load(false);
    void loadStatus();
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
    <div className="rounded-3xl bg-white/5 ring-1 ring-white/10">
      <div className="flex flex-col gap-4 border-b border-white/10 p-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="text-sm font-extrabold text-white">GoDaddy Domains</div>
          <div className="mt-1 text-sm text-white/60">
            {loading
              ? "Loading…"
              : data && "error" in data
                ? data.error
                : `${rows.length.toLocaleString()} domains`}
            {data && !("error" in data) && data.fetchedAt ? (
              <span className="text-white/35">
                {" "}
                • fetched {fmtDate(data.fetchedAt)}
              </span>
            ) : null}
          </div>
          <div className="mt-2 text-xs text-white/50">
            {loadingStatus ? (
              "Checking GoDaddy connection…"
            ) : status && "ok" in status && status.ok ? (
              <span>
                Connection: <span className="text-white/75">OK</span> (availability
                check)
              </span>
            ) : (
              <span>
                Connection: <span className="text-white/75">Not verified</span>
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button variant="secondary" onClick={() => void load(true)}>
            Refresh
          </Button>
          <Button variant="secondary" onClick={() => void loadStatus()}>
            Test connection
          </Button>
          <a
            href="https://developer.godaddy.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full px-4 py-3 text-sm font-semibold text-white/70 hover:bg-white/10"
          >
            GoDaddy API docs
          </a>
        </div>
      </div>

      <div className="flex flex-col gap-3 border-b border-white/10 p-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center">
          <div className="w-full sm:max-w-md">
            <div className="text-xs font-semibold tracking-wide text-white/50">
              Search
            </div>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Type a domain (e.g. funstrategy.com)"
              className="mt-2 w-full rounded-2xl bg-black/30 px-4 py-3 text-sm text-white placeholder:text-white/30 ring-1 ring-white/10 focus:outline-none focus:ring-2 focus:ring-white/25"
            />
          </div>

          <label className="mt-1 inline-flex items-center gap-2 rounded-2xl bg-white/5 px-4 py-3 text-sm font-semibold text-white/75 ring-1 ring-white/10 hover:bg-white/10 sm:mt-6">
            <input
              type="checkbox"
              checked={onlyAutoRenew}
              onChange={(e) => setOnlyAutoRenew(e.target.checked)}
              className="h-4 w-4 accent-white"
            />
            Auto-renew only
          </label>
          <label className="mt-1 inline-flex items-center gap-2 rounded-2xl bg-white/5 px-4 py-3 text-sm font-semibold text-white/75 ring-1 ring-white/10 hover:bg-white/10 sm:mt-6">
            <input
              type="checkbox"
              checked={onlyPrivacy}
              onChange={(e) => setOnlyPrivacy(e.target.checked)}
              className="h-4 w-4 accent-white"
            />
            Privacy only
          </label>
        </div>

        <div className="text-xs text-white/45">
          Tip: keep GoDaddy credentials server-side in{" "}
          <span className="font-mono text-white/60">.env.local</span>.
        </div>
      </div>

      <div className="grid grid-cols-12 gap-0 border-b border-white/10 px-6 py-3 text-xs font-semibold tracking-wide text-white/50">
        <div className="col-span-5">Domain</div>
        <div className="col-span-2">Status</div>
        <div className="col-span-2">Created</div>
        <div className="col-span-2">Expires</div>
        <div className="col-span-1 text-right">Flags</div>
      </div>

      <div
        ref={parentRef}
        className="relative h-[70vh] overflow-auto"
        role="region"
        aria-label="Domains list"
      >
        {loading ? (
          <div className="p-6 text-sm text-white/60">Loading domains…</div>
        ) : data && "error" in data ? (
          <div className="p-6 text-sm text-white/70">
            <div className="font-semibold text-white">Couldn’t load domains.</div>
            <div className="mt-2 text-white/60">
              {data.error}
              {typeof data.status === "number" ? (
                <span className="text-white/45"> (HTTP {data.status})</span>
              ) : null}
            </div>

            <div className="mt-3 text-xs text-white/50">
              If you haven’t set your credentials yet, create{" "}
              <span className="font-mono">.env.local</span> from{" "}
              <span className="font-mono">env.local.example</span>.
            </div>

            {data.status === 403 ? (
              <div className="mt-3 text-xs text-white/50">
                Note: GoDaddy can restrict the “list my domains” API for small
                accounts (including 0 domains). Use “Test connection” above to
                verify your key via a public availability endpoint.
              </div>
            ) : null}

            {status && !("ok" in status) && !loadingStatus ? (
              <div className="mt-3 text-xs text-white/50">
                Connection check result: {status.error}
                {typeof status.status === "number" ? (
                  <span> (HTTP {status.status})</span>
                ) : null}
              </div>
            ) : null}
          </div>
        ) : rows.length === 0 ? (
          <div className="p-6 text-sm text-white/60">No matches.</div>
        ) : (
          <div
            style={{ height: `${rowVirtualizer.getTotalSize()}px` }}
            className="relative"
          >
            {rowVirtualizer.getVirtualItems().map((v) => {
              const d = rows[v.index];
              const flags = [
                d.locked ? "L" : "",
                d.autoRenew ? "R" : "",
                d.privacy ? "P" : "",
              ]
                .filter(Boolean)
                .join("");

              return (
                <div
                  key={v.key}
                  className={cn(
                    "absolute left-0 right-0 grid grid-cols-12 items-center gap-0 border-b border-white/5 px-6 text-sm",
                    v.index % 2 === 0 ? "bg-white/[0.02]" : "bg-transparent"
                  )}
                  style={{
                    transform: `translateY(${v.start}px)`,
                    height: `${v.size}px`,
                  }}
                >
                  <div className="col-span-5 truncate font-semibold text-white/90">
                    {d.domain || "—"}
                  </div>
                  <div className="col-span-2 text-white/70">{d.status ?? "—"}</div>
                  <div className="col-span-2 text-white/70">
                    {fmtDate(d.createdAt)}
                  </div>
                  <div className="col-span-2 text-white/70">
                    {fmtDate(d.expires)}
                  </div>
                  <div className="col-span-1 text-right font-mono text-[12px] text-white/55">
                    {flags || "—"}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="border-t border-white/10 p-6 text-xs text-white/45">
        Flags: <span className="font-mono">L</span>=locked,{" "}
        <span className="font-mono">R</span>=auto-renew,{" "}
        <span className="font-mono">P</span>=privacy.
      </div>
    </div>
  );
}


