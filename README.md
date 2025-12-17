## FUNSTRATEGY ($FUNSTR)

This repo contains the FUNSTRATEGY token website in `funstr-site/` (Next.js).

### Local dev

```bash
cd funstr-site
npm install
npm run dev
```

Open `http://localhost:3000`.

### GoDaddy API (optional)

Create `funstr-site/.env.local` with:

- `GODADDY_API_KEY`
- `GODADDY_API_SECRET`

Then restart `npm run dev`.

### Vercel deploy

This repo includes `vercel.json` so Vercel builds the Next.js app from `funstr-site/`.

If Vercel asks for a Root Directory, set it to **`.`** (repo root). The root
`package.json` exists only so Vercel can detect the Next.js version; actual build
commands run inside `funstr-site/` via `vercel.json`.

### Parked domains (simple "owned by FUNSTRATEGY" page)

This site supports a second "parked" experience for extra domains:

- Primary host shows the full site
- Any other connected domain rewrites to `/parked`

Set these env vars in Vercel:

- `FUNSTR_PRIMARY_HOST` (example: `funstrategy.com`)
- `FUNSTR_MAIN_SITE_URL` (example: `https://funstrategy.com`)

### Automated domain sync (GoDaddy → Vercel + DNS)

The site includes a **cron job** that automatically syncs new `.fun` domains from GoDaddy:

1. **Polls GoDaddy** every 15 minutes for new `.fun` domains
2. **Adds each new domain** to your Vercel project
3. **Configures DNS records** in GoDaddy (A/CNAME/TXT) based on Vercel's requirements

Once DNS propagates, the domain will automatically show the `/parked` page (via middleware).

**Required env vars in Vercel:**

- `GODADDY_API_KEY` / `GODADDY_API_SECRET` (already needed for `/domains` page)
- `VERCEL_TOKEN` (get from https://vercel.com/account/tokens)
- `VERCEL_PROJECT_ID` (find in Project Settings → General)
- `VERCEL_TEAM_ID` (optional, only if using a team)

**Optional security:**

- `SYNC_CRON_SECRET` (if set, cron endpoint requires `Authorization: Bearer <secret>` header)

**Manual trigger (for testing):**

You can manually trigger the sync by calling:

```bash
curl -H "x-vercel-cron: 1" https://your-site.vercel.app/api/cron/sync-domains
```

Or if `SYNC_CRON_SECRET` is set:

```bash
curl -H "Authorization: Bearer YOUR_SECRET" https://your-site.vercel.app/api/cron/sync-domains
```

**Note:** GoDaddy may restrict domain/DNS API access for accounts with fewer than 10 domains (unless you have Discount Domain Club). See: https://www.godaddy.com/hi-in/help/how-do-i-access-domain-related-apis-42424


