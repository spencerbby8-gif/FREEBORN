# Freeborn

Freeborn is a premium-first dating platform monorepo built to scale across web, mobile, and Supabase.

## Workspace structure

- `web` — public-facing Next.js website and future authenticated web surface
- `mobile` — Expo-powered iOS and Android app shell
- `shared` — design tokens, brand system, and shared types
- `supabase` — migrations and project configuration
- `docs` — setup, architecture notes, and product foundation guidance

## Quick start

```bash
npm install
npm run dev:web
npm run dev:mobile
```

## Verification

```bash
npm run verify
```

## Deployment targets

- **Web:** Vercel, with the project pointed at the `web` app in this monorepo
- **Mobile:** Expo / EAS
- **Backend:** Supabase, managed with migrations in `supabase/migrations`
