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
- onboarding field options, step metadata, and shared Zod validation

## App boundaries

- `web` is the polished marketing and trust surface
- `mobile` is the branded app shell that future auth and onboarding flows plug into
- `shared` keeps product language, tokens, and validation aligned
- `supabase` contains the migration-led schema for auth-adjacent user records, profile fields, RLS, and timestamp helpers

## Phase discipline

This repository now covers **Phase 0**, **Phase 1**, and **Phase 2**:

- project structure
- design foundation
- Supabase setup
- public web experience
- mobile app shell
- email and Google authentication on web and mobile
- session persistence and protected routes
- five-step onboarding with display name, age validation, gender, location, bio, relationship goals, interests, lifestyle preferences, deal breakers, occupation, and education
- automatic progress saving across web and mobile
- shared Zod validation for every onboarding field
- documentation and environment setup

Discovery, matching, messaging, and payments remain for later phases.
