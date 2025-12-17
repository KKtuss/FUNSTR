import { NextResponse } from "next/server";

import { getGoDaddyBaseUrl } from "@/lib/godaddy";
import { upsertDnsRecord } from "@/lib/godaddy-dns";
import { addDomainToVercel, listVercelDomains } from "@/lib/vercel";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Protect cron endpoint (Vercel sets this header automatically)
function isAuthorized(req: Request): boolean {
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.SYNC_CRON_SECRET;

  // If SYNC_CRON_SECRET is set, require it
  if (cronSecret) {
    return authHeader === `Bearer ${cronSecret}`;
  }

  // Otherwise, allow Vercel cron header (x-vercel-cron: 1)
  const vercelCron = req.headers.get("x-vercel-cron");
  return vercelCron === "1";
}

export async function GET(req: Request) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const projectId = process.env.VERCEL_PROJECT_ID;
  const teamId = process.env.VERCEL_TEAM_ID;
  const godaddyKey = process.env.GODADDY_API_KEY;
  const godaddySecret = process.env.GODADDY_API_SECRET;

  if (!projectId) {
    return NextResponse.json(
      { error: "VERCEL_PROJECT_ID not configured" },
      { status: 500 }
    );
  }

  if (!godaddyKey || !godaddySecret) {
    return NextResponse.json(
      { error: "GoDaddy API credentials not configured" },
      { status: 500 }
    );
  }

  const results: Array<{
    domain: string;
    action: string;
    success: boolean;
    error?: string;
  }> = [];

  try {
    // 1. Fetch domains from GoDaddy
    const baseUrl = getGoDaddyBaseUrl();
    const godaddyRes = await fetch(`${baseUrl}/v1/domains`, {
      headers: {
        Authorization: `sso-key ${godaddyKey}:${godaddySecret}`,
        Accept: "application/json",
      },
    });

    if (!godaddyRes.ok) {
      const errorText = await godaddyRes.text();
      return NextResponse.json(
        {
          error: "Failed to fetch GoDaddy domains",
          details: errorText,
          status: godaddyRes.status,
        },
        { status: 502 }
      );
    }

    const godaddyDomains = (await godaddyRes.json()) as Array<{
      domain?: string;
    }>;

    // Filter for .fun domains only
    const funDomains = godaddyDomains
      .map((d) => d.domain)
      .filter((d): d is string => typeof d === "string" && d.endsWith(".fun"));

    // 2. Get already-synced domains from Vercel
    const vercelList = await listVercelDomains(projectId, teamId);
    if (!vercelList.success) {
      return NextResponse.json(
        {
          error: "Failed to list Vercel domains",
          details: vercelList.error,
        },
        { status: 502 }
      );
    }

    const syncedDomains = new Set(vercelList.domains ?? []);

    // 3. For each new .fun domain, add to Vercel and configure DNS
    for (const domain of funDomains) {
      if (syncedDomains.has(domain)) {
        results.push({
          domain,
          action: "skipped (already synced)",
          success: true,
        });
        continue;
      }

      // Add domain to Vercel
      const addResult = await addDomainToVercel(domain, projectId, teamId);
      if (!addResult.success) {
        results.push({
          domain,
          action: "add to Vercel",
          success: false,
          error: addResult.error,
        });
        continue;
      }

      const config = addResult.config;
      if (!config) {
        results.push({
          domain,
          action: "add to Vercel",
          success: false,
          error: "No config returned from Vercel",
        });
        continue;
      }

      // Configure DNS records based on Vercel's requirements
      const dnsErrors: string[] = [];

      // A record for apex (if specified)
      if (config.apexName) {
        const apexResult = await upsertDnsRecord(domain, {
          type: "A",
          name: "@",
          data: config.apexName,
          ttl: 600,
        });
        if (!apexResult.success) {
          dnsErrors.push(`A record: ${apexResult.error}`);
        }
      }

      // CNAME for www (if specified)
      if (config.cnameTarget) {
        const cnameResult = await upsertDnsRecord(domain, {
          type: "CNAME",
          name: "www",
          data: config.cnameTarget,
          ttl: 600,
        });
        if (!cnameResult.success) {
          dnsErrors.push(`CNAME www: ${cnameResult.error}`);
        }
      }

      // Verification TXT records (if required)
      if (config.verification && Array.isArray(config.verification)) {
        for (const verif of config.verification) {
          if (verif.type === "TXT" && verif.domain && verif.value) {
            const txtResult = await upsertDnsRecord(domain, {
              type: "TXT",
              name: verif.domain === domain ? "@" : verif.domain.replace(`.${domain}`, ""),
              data: verif.value,
              ttl: 600,
            });
            if (!txtResult.success) {
              dnsErrors.push(`TXT ${verif.domain}: ${txtResult.error}`);
            }
          }
        }
      }

      // DNS records from config (if provided)
      if (config.dnsRecords && Array.isArray(config.dnsRecords)) {
        for (const dnsRec of config.dnsRecords) {
          const recordName =
            dnsRec.name === domain || dnsRec.name === `@`
              ? "@"
              : dnsRec.name.replace(`.${domain}`, "");

          const dnsResult = await upsertDnsRecord(domain, {
            type: dnsRec.type as "A" | "CNAME" | "TXT",
            name: recordName,
            data: dnsRec.value,
            ttl: dnsRec.ttl ?? 600,
          });
          if (!dnsResult.success) {
            dnsErrors.push(`${dnsRec.type} ${dnsRec.name}: ${dnsResult.error}`);
          }
        }
      }

      if (dnsErrors.length > 0) {
        results.push({
          domain,
          action: "configure DNS",
          success: false,
          error: dnsErrors.join("; "),
        });
      } else {
        results.push({
          domain,
          action: "synced (added to Vercel + DNS configured)",
          success: true,
        });
      }
    }

    return NextResponse.json({
      success: true,
      synced: results.filter((r) => r.success).length,
      failed: results.filter((r) => !r.success).length,
      total: funDomains.length,
      results,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    return NextResponse.json(
      {
        error: "Unexpected error during sync",
        details: err instanceof Error ? err.message : String(err),
      },
      { status: 500 }
    );
  }
}

