"use client";

import * as React from "react";

type DomainsApiResponse =
  | { domains: Array<{ domain: string }>; fetchedAt: string; source?: string }
  | { error: string; status?: number };

export function DomainsBoughtValue({ placeholder = "…" }: { placeholder?: string }) {
  const [count, setCount] = React.useState<number | null>(null);

  React.useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await fetch("/api/godaddy/domains", { cache: "no-store" });
        const json = (await res.json()) as DomainsApiResponse;
        if (cancelled) return;

        if (json && !("error" in json) && Array.isArray(json.domains)) {
          setCount(json.domains.length);
        } else {
          setCount(null);
        }
      } catch {
        if (!cancelled) setCount(null);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  return <>{typeof count === "number" ? String(count) : placeholder}</>;
}


