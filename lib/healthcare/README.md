# Healthcare places providers

Nearby-healthcare data (hospitals, clinics, pharmacies, etc.) comes from a
swappable provider behind `HealthcarePlacesProvider` (`provider.ts`). The
active provider is selected in `healthcare.ts` via the `HEALTHCARE_PROVIDER`
environment variable and defaults to `overpass` — Google is never selected
silently.

## OpenStreetMap Overpass (default, live today)

No configuration required. `providers/overpass.ts` queries a list of public
Overpass mirrors with automatic fallback. See that file's comments for the
mirror list and `OVERPASS_ENDPOINTS` override.

## Google Places (skeleton only — not live yet)

`providers/google-places.ts` currently only validates configuration and
throws a typed, safe error — it makes **no live request and returns no
results**, real or fabricated. To finish the integration later:

1. **Enable the right API.** In Google Cloud Console, enable **Places API
   (New)** for the project, and specifically its Nearby Search endpoint
   (`places:searchNearby`). The legacy "Places API" is a different product
   and is not what the TODO in `providers/google-places.ts` targets.
2. **Billing.** Places API (New) requires a billing-enabled Google Cloud
   project. Nearby Search calls are billed per request beyond any free
   monthly credit — confirm budget/alerts are set up in Cloud Console
   before switching real traffic to this provider.
3. **Where the key belongs.** Create a **server-only** API key (restrict it
   to the Places API, and ideally to your server's IP or a service
   account) and put it in `GOOGLE_MAPS_SERVER_API_KEY` inside your local
   `.env.local` file (copy `.env.example` to `.env.local` first). Never
   prefix it with `NEXT_PUBLIC_` — it must never reach the browser bundle,
   and the provider is only ever called from the `/api/location/*` server
   routes, never from client components.
4. **Never commit the key.** `.env.local` is already gitignored (see
   `.gitignore`); `.env.example` only documents the variable name with an
   empty value. Double-check `git status`/`git diff` before committing if
   you ever hand-edit env files near this feature.
5. **Switching providers.** Once the key is set, set
   `HEALTHCARE_PROVIDER=google` in `.env.local` and restart the dev server.
   To go back to Overpass, remove that line (or set it back to
   `overpass`) — no code changes needed either way.

Until step 1-5 are done and the TODO in `providers/google-places.ts` is
implemented, selecting `google` will return a safe `503` from
`/api/location/nearby-healthcare` rather than any data.
