# Trail to Tides

India's adventure platform: treks, rafting, diving and more, with mapped trails, operator
comparison, a fitness Matchmaker and an adventure map. Live at https://www.trailtotides.com.

## Running it

```bash
npm install
npm run dev
```

Then open http://localhost:3000. Secrets live in `.env.local` (not committed).

## Where things are

| Path | What's there |
| --- | --- |
| `src/app/` | Pages and API routes (Next.js 15 App Router) |
| `src/lib/data.ts` | Every adventure: facts, prices, operators, copy |
| `src/lib/trails/` | Built trek trails, one JSON per trek, and the helpers that read them |
| `src/app/map/` | The Adventure Map (Leaflet with MapLibre styles, satellite from Esri) |
| `src/lib/email.ts` | Transactional emails (sent through Resend) |
| `supabase/` | Database schema: `setup.sql` for a fresh project, then `migrations/` in order |
| `scripts/` | Trail builder and checks, email images, the hero contour image, image upload |
| `research/` | Trail check reports and research notes |
| `.github/workflows/` | Trail builds and research jobs run on GitHub's runners |

## Trails

Trails are built from OpenStreetMap by `scripts/build-trail.mjs`, using the settings in
`scripts/trek-configs.mjs`. It runs on GitHub (Actions → Build trails), since Overpass isn't
reachable from every machine. After a build, these check the result and write their reports to
`research/`:

```bash
node scripts/check-trails.mjs
node scripts/check-consistency.mjs
node scripts/check-traces.mjs
```

## Deployment

Vercel builds and deploys every push to `master`; other branches get preview deployments.

Set these environment variables in the Vercel project (Settings → Environment Variables):
`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`,
`ANTHROPIC_API_KEY`, `GEMINI_API_KEY`, `RESEND_API_KEY` and `NEXT_PUBLIC_SITE_URL`.
