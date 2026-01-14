## FUNSTRATEGY ($FUNSTR) site

Modern Next.js site for the FUNSTRATEGY token. Includes:

- Token info + quick links
- A `/domains` page that **fetches your GoDaddy-owned domains via a server-side API route** (so your API secret never reaches the browser)
- **Claude AI-powered Domain Agent** that analyzes and scores domains, provides explanations, and guides domain acquisition strategy
- **Web3 Marketplace** where users can connect their wallet (Phantom, Backpack) and purchase domains using $FUNSTR tokens on Solana

## Getting Started

### 1) Configure GoDaddy API keys

Copy `env.local.example` to `.env.local` and fill in:

- `GODADDY_API_KEY`
- `GODADDY_API_SECRET`

Keys: `https://developer.godaddy.com/keys`

### 2) Run the dev server

Run:

```bash
npm run dev
```

Open `http://localhost:3000`.

### Update token details

Edit `src/lib/token.ts` to change:

- Contract address
- Supply / decimals
- Links (buy/chart/socials)

### GoDaddy domains API

The UI calls:

- `GET /api/godaddy/domains`

That route calls GoDaddy:

- `GET https://api.godaddy.com/v1/domains`

and returns `{ domains, fetchedAt }`.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Multi-Domain Setup

To configure multiple domains to point to your Vercel deployment:

1. **Set primary domain**: In your Vercel env vars, set `FUNSTR_PRIMARY_HOST` to your main domain (e.g. "funstrategy.com")
2. **Add additional primary domains (optional)**: Use `FUNSTR_PRIMARY_HOSTS` (comma-separated) to add more main domains
3. **Point domains to Vercel**: Configure all your .fun domains to point to your Vercel deployment
4. **Automatic routing**:
   - Primary domains will show the main site
   - All other domains will automatically redirect to the /parked landing page

You can update the landing page link in `env.local.example` with `FUNSTR_MAIN_SITE_URL`.

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
