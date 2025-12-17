## FUNSTRATEGY ($FUNSTR) site

Modern Next.js site for the FUNSTRATEGY token. Includes:

- Token info + quick links
- A `/domains` page that **fetches your GoDaddy-owned domains via a server-side API route** (so your API secret never reaches the browser)

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

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
