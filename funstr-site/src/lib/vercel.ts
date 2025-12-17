export type VercelDomainConfig = {
  configured: boolean;
  misconfigured: boolean;
  apexName?: string;
  cnameTarget?: string;
  verification?: Array<{
    type: string;
    domain: string;
    value: string;
  }>;
  dnsRecords?: Array<{
    type: string;
    name: string;
    value: string;
    ttl?: number;
  }>;
};

export async function addDomainToVercel(
  domain: string,
  projectId: string,
  teamId?: string
): Promise<{ success: boolean; error?: string; config?: VercelDomainConfig }> {
  const token = process.env.VERCEL_TOKEN;
  if (!token) {
    return { success: false, error: "VERCEL_TOKEN not configured" };
  }

  const baseUrl = "https://api.vercel.com";
  const teamParam = teamId ? `?teamId=${teamId}` : "";

  try {
    // Add domain to project
    const addRes = await fetch(
      `${baseUrl}/v10/projects/${projectId}/domains${teamParam}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: domain }),
      }
    );

    if (!addRes.ok) {
      const errorText = await addRes.text();
      // Domain might already exist (409), which is fine
      if (addRes.status === 409) {
        // Continue to fetch config
      } else {
        return {
          success: false,
          error: `Vercel API error (${addRes.status}): ${errorText}`,
        };
      }
    }

    // Get domain configuration/DNS requirements
    const configRes = await fetch(
      `${baseUrl}/v6/domains/${domain}/config${teamParam}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!configRes.ok) {
      const errorText = await configRes.text();
      return {
        success: false,
        error: `Failed to get domain config (${configRes.status}): ${errorText}`,
      };
    }

    const config = (await configRes.json()) as VercelDomainConfig;

    return { success: true, config };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

export async function listVercelDomains(
  projectId: string,
  teamId?: string
): Promise<{ success: boolean; domains?: string[]; error?: string }> {
  const token = process.env.VERCEL_TOKEN;
  if (!token) {
    return { success: false, error: "VERCEL_TOKEN not configured" };
  }

  const baseUrl = "https://api.vercel.com";
  const teamParam = teamId ? `?teamId=${teamId}` : "";

  try {
    const res = await fetch(
      `${baseUrl}/v9/projects/${projectId}/domains${teamParam}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!res.ok) {
      const errorText = await res.text();
      return {
        success: false,
        error: `Vercel API error (${res.status}): ${errorText}`,
      };
    }

    const data = (await res.json()) as { domains?: Array<{ name: string }> };
    const domains = (data.domains ?? []).map((d) => d.name);

    return { success: true, domains };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

