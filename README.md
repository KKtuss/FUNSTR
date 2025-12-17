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


