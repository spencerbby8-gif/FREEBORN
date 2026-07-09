# Freeborn setup

## Requirements

- Node.js 22+
- npm 10+
- A Supabase project
- For mobile auth testing: an Expo development build or simulator/device build

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

## Verify the project

```bash
npm run verify
```

This runs:

- linting for workspaces that expose a lint command
- TypeScript checks where available
- the production web build
- a mobile web export to catch Expo bundling issues
- Expo config validation for the mobile app

## Auth provider setup

These steps cannot be fully automated from the repository and must be configured in Supabase:

1. Enable **Email** auth and **Google** auth in the Supabase dashboard.
2. In **Authentication → URL Configuration**, set the Site URL to your deployed web domain.
3. Add these redirect URLs during development:
   - `http://localhost:3000/auth/callback`
   - `http://localhost:3000/auth/complete`
   - `freeborn://**`
4. Add matching production URLs for your real domain:
   - `https://your-domain.com/auth/callback`
   - `https://your-domain.com/auth/complete`
   - `freeborn://**`
5. In Google Cloud, add your Supabase Google callback URL from the provider settings as an authorized redirect URI, then paste the Google client ID and secret into the Supabase Google provider.

## Mobile auth notes

- Google sign in and email deep-link recovery should be tested on a development build or native simulator/device build rather than relying on Expo Go.
- The app uses the `freeborn://` scheme for auth completion links.

## Deployment notes

### Vercel

Configure the Vercel project to use the `web` workspace inside this monorepo. Vercel should install from the repository root so the shared workspace is available, while the deployed application remains the Next.js app in `web`.

### Expo

Use `mobile` as the Expo app root.

### Supabase

Apply migrations from `supabase/migrations` with the Supabase CLI or CI pipeline.
