import { getGoDaddyBaseUrl } from "./godaddy";

export type GoDaddyDnsRecord = {
  type: "A" | "AAAA" | "CNAME" | "MX" | "NS" | "SRV" | "TXT";
  name: string;
  data: string;
  ttl?: number;
  priority?: number;
};

export async function upsertDnsRecord(
  domain: string,
  record: GoDaddyDnsRecord
): Promise<{ success: boolean; error?: string }> {
  const key = process.env.GODADDY_API_KEY;
  const secret = process.env.GODADDY_API_SECRET;

  if (!key || !secret) {
    return { success: false, error: "GoDaddy API credentials not configured" };
  }

  const baseUrl = getGoDaddyBaseUrl();
  const endpoint = `${baseUrl}/v1/domains/${domain}/records/${record.type}/${record.name}`;

  try {
    const res = await fetch(endpoint, {
      method: "PUT",
      headers: {
        Authorization: `sso-key ${key}:${secret}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify([
        {
          data: record.data,
          ttl: record.ttl ?? 600,
          priority: record.priority,
        },
      ]),
    });

    if (!res.ok) {
      const errorText = await res.text();
      return {
        success: false,
        error: `GoDaddy DNS API error (${res.status}): ${errorText}`,
      };
    }

    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

export async function getDnsRecords(
  domain: string,
  type?: string,
  name?: string
): Promise<{ success: boolean; records?: GoDaddyDnsRecord[]; error?: string }> {
  const key = process.env.GODADDY_API_KEY;
  const secret = process.env.GODADDY_API_SECRET;

  if (!key || !secret) {
    return { success: false, error: "GoDaddy API credentials not configured" };
  }

  const baseUrl = getGoDaddyBaseUrl();
  let endpoint = `${baseUrl}/v1/domains/${domain}/records`;
  if (type) {
    endpoint += `/${type}`;
    if (name) {
      endpoint += `/${name}`;
    }
  }

  try {
    const res = await fetch(endpoint, {
      headers: {
        Authorization: `sso-key ${key}:${secret}`,
        Accept: "application/json",
      },
    });

    if (!res.ok) {
      const errorText = await res.text();
      return {
        success: false,
        error: `GoDaddy DNS API error (${res.status}): ${errorText}`,
      };
    }

    const data = (await res.json()) as Array<{
      type: string;
      name: string;
      data: string;
      ttl?: number;
      priority?: number;
    }>;

    const records: GoDaddyDnsRecord[] = data.map((r) => ({
      type: r.type as GoDaddyDnsRecord["type"],
      name: r.name,
      data: r.data,
      ttl: r.ttl,
      priority: r.priority,
    }));

    return { success: true, records };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

