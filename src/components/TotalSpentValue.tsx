"use client";

import * as React from "react";

type DomainsApiResponse =
  | {
      domains: Array<{ priceUsd?: number }>;
      fetchedAt: string;
      stats?: { totalSpentUsd?: number; domainsBought?: number };
    }
  | { error: string; status?: number };

function fmtMoney(n: number) {
  // Display as 0.00 with dot decimals (user requested decimals after comma; UI uses dot).
  return `${n.toFixed(2)}$`;
}

export function TotalSpentValue({ placeholder = "…" }: { placeholder?: string }) {
  const [value, setValue] = React.useState<number | null>(null);

  React.useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await fetch("/api/godaddy/domains", { cache: "no-store" });
        const json = (await res.json()) as DomainsApiResponse;
        if (cancelled) return;

        if (json && !("error" in json)) {
          const fromStats = json.stats?.totalSpentUsd;
          if (typeof fromStats === "number") {
            setValue(fromStats);
            return;
          }

          const sum =
            Array.isArray(json.domains)
              ? json.domains.reduce(
                  (acc, d) => acc + (typeof d.priceUsd === "number" ? d.priceUsd : 0),
                  0
                )
              : 0;
          setValue(Math.round(sum * 100) / 100);
        } else {
          setValue(null);
        }
      } catch {
        if (!cancelled) setValue(null);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  return <>{typeof value === "number" ? fmtMoney(value) : placeholder}</>;
}


