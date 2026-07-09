# Freeborn setup

## Requirements

- Node.js 22+
- npm 10+
- Expo Go or a simulator for mobile previews
- A Supabase project

## Install

```bash
npm install
```

## Environment variables

Copy `.env.example` to a local `.env` file and provide the Supabase values for both web and mobile.

## Run the apps

### Web

```bash
npm run dev:web
```

### Mobile

```bash
npm run dev:mobile
```

## Verify the foundation

```bash
npm run verify
```

This runs:

- linting for workspaces that expose a lint command
- TypeScript checks where available
- the production web build
- Expo config validation for the mobile app

## Deployment notes

### Vercel

Configure the Vercel project to use the `web` workspace inside this monorepo. Vercel should install from the repository root so the shared workspace is available, while the deployed application remains the Next.js app in `web`.

### Expo

Use `mobile` as the Expo app root.

### Supabase

Apply migrations from `supabase/migrations` with the Supabase CLI or CI pipeline.
