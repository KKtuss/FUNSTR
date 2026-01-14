export type TokenLinkKey =
  | "buy"
  | "chart"
  | "whitepaper"
  | "landingPage"
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
    "In the era of .fun, it’s only natural for strategy to meet memes. At FUNSTRATEGY, we're building a strategic reserve of .fun domains with creator rewards, establishing $FUNSTR as the leading force behind the .fun trademark.",
  chain: "Solana",
  contractAddress: "11111111111111111111111111111111",
  decimals: 6,
  totalSupply: "1,000,000,000",
  buyTax: "0%",
  sellTax: "0%",
  domainsBought: "0",
  totalSpent: "0",
  links: {
    buy: "https://example.com/buy",
    chart: "https://example.com/chart",
    landingPage: "/parked",
    x: "https://x.com/example",
    whitepaper: "/whitepaper",
  },
};


