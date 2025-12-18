export type TokenLinkKey =
  | "buy"
  | "chart"
  | "whitepaper"
  | "telegram"
  | "x"
  | "discord"
  | "github";

export type TokenConfig = {
  name: string;
  symbol: string;
  tagline: string;
  chain: string;
  contractAddress: string;
  decimals: number;
  totalSupply: string;
  buyTax?: string;
  sellTax?: string;
  domainsBought?: string;
  totalSpent?: string;
  links: Partial<Record<TokenLinkKey, string>>;
};

/**
 * Update these fields to match your launch details.
 * All pages/components read from this single config.
 */
export const token: TokenConfig = {
  name: "FUNSTRATEGY",
  symbol: "FUNSTR",
  tagline:
    "In an era of .fun, it seems only logical that strategy meet memes. At FUNSTR, we're building a strategic reserve of .fun domains with creator rewards, turning FUNSTR in the leader and most active investor of the .fun trademark.",
  chain: "EVM (update me)",
  contractAddress: "0x0000000000000000000000000000000000000000",
  decimals: 18,
  totalSupply: "1,000,000,000",
  buyTax: "0%",
  sellTax: "0%",
  domainsBought: "0",
  totalSpent: "0",
  links: {
    buy: "https://example.com/buy",
    chart: "https://example.com/chart",
    telegram: "https://t.me/example",
    x: "https://x.com/example",
    whitepaper: "https://example.com/whitepaper",
  },
};


