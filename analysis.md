# Full Codebase Analysis

## Architecture
- **Monorepo**: `web` (Next.js), `mobile` (Expo/RN), `shared` (tokens/types/validation), `supabase` (migrations)
- **Auth**: Supabase Auth (email + Google OAuth)
- **Styling**: Tailwind CSS (web), StyleSheet (mobile)

## Developer-Facing Elements to Remove
1. **"Phase 0", "Phase 1", "Phase 2", "Phase 3" labels** — landing page, auth, onboarding, discover, mobile
2. **"Supabase" mentions** in auth trust points, landing page foundation, photo manager
3. **Technical language** — "shared tokens", "monorepo setup", "migration-led", "RLS-ready", "Phase 1 ready"
4. **Raw UUIDs displayed** in mobile Likes screen
5. **"Phase 2" badge** in onboarding shell
6. **"Real S3/Supabase storage wired"** in photo manager
7. **Phase badges** on PhonePreview, AuthCard eyebrow, AppShell sidebar

## Broken/Weak Interactions
1. **Mobile Likes**: Shows raw UUIDs instead of names
2. **Profile editor**: Unstyled textareas, basic chip toggles
3. **Photo manager**: No drag-to-reorder, hacky file input
4. **Mobile Profile**: Only 4 fields editable, basic
5. **Discover empty state**: Generic
6. **Loading states**: Basic ActivityIndicator
7. **Error states**: Simple text alerts
8. **No animations/transitions** on mobile
9. **Auth form**: Tab-based mode switching is unintuitive
10. **Onboarding forms**: Values don't update on change in some steps (controlled vs uncontrolled issue)

## What Works Well (Preserve)
- Design token system (colors, spacing, radii, shadows)
- Zod validation schemas
- Supabase server actions architecture
- Auth provider pattern
- Session management
- Data models and migrations
- Route protection logic
