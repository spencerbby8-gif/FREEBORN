# Freeborn architecture foundation

## Product posture

Freeborn is designed to feel intentional, premium, and trustworthy from the first screen. The foundation in this phase focuses on durable structure rather than rushed feature sprawl.

## Design system

The shared workspace exposes:

- brand identity
- color system
- typography scale
- spacing and radius tokens
- motion and shadow primitives
- shared preview data for marketing and shell experiences

## App boundaries

- `web` is the polished marketing and trust surface
- `mobile` is the branded app shell that future auth and onboarding flows plug into
- `shared` keeps product language and tokens aligned
- `supabase` contains the first migration for auth-adjacent user records, RLS, and timestamp helpers

## Phase discipline

This repository is intentionally scoped to **Phase 0**:

- project structure
- design foundation
- Supabase setup
- public web experience
- mobile app shell
- documentation and environment setup

Auth, onboarding, matching, messaging, and payments remain for later phases.
