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

### Parked domains (simple “owned by FUNSTRATEGY” page)

This site supports a second “parked” experience for extra domains:

- Primary host shows the full site
- Any other connected domain rewrites to `/parked`

Set these env vars in Vercel:

- `FUNSTR_PRIMARY_HOST` (example: `funstrategy.com`)
- `FUNSTR_MAIN_SITE_URL` (example: `https://funstrategy.com`)


