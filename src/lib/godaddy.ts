export type GoDaddyDomain = {
  domain: string;
  status?: string;
  createdAt?: string;
  expires?: string;
  renewalPeriod?: number;
  privacy?: boolean;
  autoRenew?: boolean;
  locked?: boolean;
  nameServers?: string[];
  /**
   * Synthetic purchase price (USD). Used for prop/mock/manual reserve previews.
   * Not sourced from GoDaddy.
   */
  priceUsd?: number;
};

export function getGoDaddyBaseUrl() {
  const explicit = process.env.GODADDY_API_BASE_URL;
  if (explicit) return explicit;

  const env = (process.env.GODADDY_ENV ?? "production").toLowerCase();
  if (env === "ote" || env === "test" || env === "staging") {
    return "https://api.ote-godaddy.com";
  }

  return "https://api.godaddy.com";
}


