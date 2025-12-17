"use client";

import * as React from "react";
import { useVirtualizer } from "@tanstack/react-virtual";

type DomainRow = {
  domain: string;
};

type ApiResponse =
  | {
      domains: DomainRow[];
      fetchedAt: string;
    }
  | { error: string; status?: number };

function cn(...parts: Array<string | undefined | false>) {
  return parts.filter(Boolean).join(" ");
}

export function DomainsClient() {
  const [data, setData] = React.useState<ApiResponse | null>(null);
  const [loading, setLoading] = React.useState(true);

  const parentRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      try {
        const res = await fetch("/api/godaddy/domains", { cache: "no-store" });
        const json = (await res.json()) as ApiResponse;
        if (!cancelled) setData(json);
      } catch {
        if (!cancelled) setData({ error: "Failed to load domains." });
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  const rows = React.useMemo(() => {
    if (!data || "error" in data) return [];
    return (data.domains ?? [])
      .filter((d) => typeof d.domain === "string" && d.domain.length > 0)
      .sort((a, b) => a.domain.localeCompare(b.domain));
  }, [data]);

  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 52,
    overscan: 16,
  });

  return (
    <div className="rounded-3xl bg-white/5 ring-1 ring-white/10">
      <div className="border-b border-white/10 p-6">
        <div className="text-sm font-extrabold text-white">Domains</div>
        <div className="mt-1 text-sm text-white/60">
          {loading
            ? "Loading..."
            : data && "error" in data
              ? "Unable to load domains"
              : `${rows.length.toLocaleString()} domains`}
        </div>
      </div>

      <div className="border-b border-white/10 px-6 py-3 text-xs font-semibold tracking-wide text-white/50">
        Domain
      </div>

      <div
        ref={parentRef}
        className="relative h-[70vh] overflow-auto"
        role="region"
        aria-label="Domains list"
      >
        {loading ? (
          <div className="p-6 text-sm text-white/60">Loading...</div>
        ) : data && "error" in data ? (
          <div className="p-6 text-sm text-white/70">
            <div className="font-semibold text-white">Unable to load domains.</div>
            <div className="mt-2 text-white/60">
              Please try again later.
              {typeof data.status === "number" ? (
                <span className="text-white/45"> (HTTP {data.status})</span>
              ) : null}
            </div>
          </div>
        ) : rows.length === 0 ? (
          <div className="p-6 text-sm text-white/60">No domains yet.</div>
        ) : (
          <div style={{ height: `${rowVirtualizer.getTotalSize()}px` }} className="relative">
            {rowVirtualizer.getVirtualItems().map((v) => {
              const d = rows[v.index];
              return (
                <div
                  key={v.key}
                  className={cn(
                    "absolute left-0 right-0 flex items-center border-b border-white/5 px-6 text-sm",
                    v.index % 2 === 0 ? "bg-white/[0.02]" : "bg-transparent"
                  )}
                  style={{
                    transform: `translateY(${v.start}px)`,
                    height: `${v.size}px`,
                  }}
                >
                  <a
                    className="min-w-0 truncate font-semibold text-white/90 hover:underline"
                    href={`https://${d.domain}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={d.domain}
                  >
                    {d.domain}
                  </a>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
