# Freeborn Product Blueprint

_Last updated: 2026-07-11_

## 1. Source of truth from the current codebase

This blueprint is grounded in the repository as it exists now:

- **Product posture:** Freeborn is a premium, dark-first relationship platform for values-aligned people who care about medical freedom, natural health, personal sovereignty, and intentional long-term commitment: full profiles, clear intentions, privacy-minded onboarding, visible trust signals, and finite discovery.
- **Platforms:** Next.js web app, Expo mobile app, shared design/data/validation package, Supabase schema and server actions.
- **Brand language:** "Date like you mean it." Public positioning is direct about medical freedom, natural health, and long-term relationships; in-app language is balanced, warm, privacy-minded, and welcoming.
- **Visual system:** cinematic night backgrounds, ember/gold/violet/teal accents, glass panels, rounded cards, Fraunces display type, Inter body type, subtle aurora motion, and pearl text on midnight surfaces.
- **Core data available today:** user profile details, birth date-derived age, gender, city/region/country, bio, relationship goals, interests, lifestyle preferences, deal breakers, occupation, education, prompt answers, height, discoverability, profile photos, verification flags, discovery preferences, swipes, likes, matches, and messages.
- **Trust constraints:** never show email, full birth date, auth provider, last name, private medical history, or backend implementation details in public/discovery surfaces. Do not claim fake success metrics, fake press, or verification where it is not present.

## 2. Global product rules

### 2.1 Visual style

- Backgrounds use a deep vertical night gradient with soft ember, violet, and teal glow fields. Pages must never use flat black or bright white backgrounds.
- Primary surfaces are translucent midnight panels with 1px white borders at 8–14% opacity, 24–40px border radius on large containers, and soft inner highlights.
- Primary actions use either:
  - warm gradient: ember to gold, white text, glow shadow; or
  - pearl fill, ink text, reserved for decisive account/form actions.
- Secondary actions use transparent glass buttons with white/pearl borders and muted text.
- Destructive actions are quiet until needed: red text or border, no giant red fills unless confirming irreversible danger.
- Typography hierarchy:
  - screen title: Fraunces, 34–52px desktop, 30–38px mobile, tight line height.
  - section title: Inter/Fraunces, 18–24px.
  - body: Inter 14–16px, relaxed line height.
  - labels/eyebrows: uppercase 11–12px, 0.16–0.22em letter spacing, sand/mist color.
- Spacing follows a practical 8px rhythm: 16px minimum internal card padding on mobile, 24–32px desktop; 24px between sibling cards; 40–64px between major page blocks.

### 2.2 Layout rules

- App pages sit inside `AppShell`.
- Desktop app layout uses a left sidebar and a content area. Content max width should feel editorial, not stretched: major pages should cap primary content around 1180–1240px.
- Mobile app layout uses a compact top header and fixed bottom navigation. Page content must leave at least 96px bottom padding so the nav never covers actions.
- Main action placement:
  - On focused task screens, the primary action sits at the lower-right of the form/card on desktop and full-width at the bottom of its section on mobile.
  - Discovery actions sit beneath the active profile card and remain thumb-accessible on mobile.
  - Settings save actions are sticky within each edited card only if the card is long; otherwise they sit at the bottom of the card.
- Horizontal two-column layouts collapse to one column below `lg`. The most important task appears first on mobile.

### 2.3 Interaction rules

- Every interactive element has hover, active, disabled, focus-visible, loading, success, and error behavior.
- Buttons should move no more than 1–4px on hover. Motion is ambient and premium, never bouncy or distracting.
- Disabled buttons keep their shape and label but reduce opacity and show a waiting label when work is pending.
- Forms validate inline. Errors appear directly beneath or above the relevant input group, with a red-tinted panel for form-level failures.
- Success states appear as small green/teal panels with a check icon and a clear "saved" message. They should not reset user context.
- Empty states explain why the user is seeing nothing, what Freeborn is doing, and one useful next action.

### 2.4 Safety and privacy rules

- Discovery cards can show: display name, age, city/region, occupation, education, bio, relationship goals, interests, lifestyle tags, prompt answers, photos, verified badge only if `is_verified` is true.
- Discovery cards must hide: email, full birth date, last name, auth providers, internal IDs, backend/storage labels.
- Settings may show account email because it is private to the owner, but the email must be visually deemphasized and identified as private.
- Date of birth copy must always say it is used for age-gating and not shown publicly.
- Verification copy must distinguish "Verified" from "Not verified yet". Do not imply every profile is verified.
- Discoverability controls must explain the privacy impact: off means the member will not appear in discovery.

## 3. Navigation

### Purpose
Give signed-in members stable, low-friction movement between discovery, likes, matches, and profile/settings.

### Desktop behavior
- Left sidebar, sticky at top with 32px page padding.
- Top of sidebar: Freeborn wordmark.
- Nav links stack vertically: Discover, Likes, Matches, Profile.
- Active nav item uses warm gradient fill, white text, icon in a lighter sub-surface.
- Inactive nav items use mist text and brighten on hover.
- Sidebar includes one small trust card: "Your journey" with a calm sentence about thoughtful profiles.
- Sign out sits at the bottom of the sidebar panel, low emphasis.

### Mobile behavior
- Top header shows wordmark left and member avatar/name right.
- Bottom tab bar is fixed, blurred, 4 items equally spaced.
- Active tab has a subtle pearl/glow background; inactive tabs are mist.
- Do not put sign out in the mobile top header unless no profile/settings surface is available; sign out belongs in account settings.

### Emotional feel
Stable, protective, quiet. Navigation should disappear into the background once a user starts browsing.

## 4. Landing page

### Purpose
Convert a new visitor into someone who trusts Freeborn enough to create an account.

### What the user sees first
- Sticky pill-shaped nav with wordmark left, anchor links centered on desktop, sign-in and join CTA right.
- Hero eyebrow: "Values-aligned dating for health autonomy and lasting love".
- Large Fraunces headline: "Date freely. Love intentionally." with warm gradient emphasis.
- Manifesto paragraph using existing brand manifesto.
- Primary CTA: "Create your profile"; secondary CTA: "See how it works".
- Trust chips under CTA: values-forward profiles, medical freedom respected, long-term intent.
- Phone/profile preview on the right on desktop, below copy on mobile.

### Layout and hierarchy
- Desktop: two-column hero, copy left around 55%, phone right around 45%.
- Mobile: nav at top, hero copy first, CTA buttons full-width or stacked, phone preview after trust chips.
- Sections below: manifesto, how it works, product pillars, safety, community standard, trust ledger, FAQ, final CTA, footer.
- Each section uses a clear eyebrow, single headline, one supporting paragraph, and cards no smaller than 220px high on desktop.

### Main action
Primary CTA appears in hero nav, hero body, safety section, trust ledger, and final CTA. It always routes to `/auth?mode=sign-up`.

### Secondary actions
- Sign in routes to `/auth?mode=sign-in`.
- Anchor links scroll to sections.
- FAQ expands inline with `details` behavior.

### Emphasis / hidden
- Emphasize privacy, intentionality, no fake metrics.
- Hide technical terms: Supabase, phases, migrations, RLS, storage, monorepo.

### Emotional feel
Cinematic, warm, careful, credible. It should feel like the user has found a calmer values-aligned room, not a growth-hacked funnel.

## 5. Authentication

### Purpose
Let users sign in, create an account, recover access, or update a password with confidence.

### What the user sees first
- Centered auth card, max width about 460px, on a dark aurora background.
- Eyebrow changes by mode: private by default, welcome back, account recovery, recovery confirmed.
- Title and short description explain the exact action.

### Main action
- Email submit button spans full card width at the bottom of the form.
- Sign-in label: "Sign in".
- Sign-up label: "Create account".
- Reset label: "Send reset link".
- Update password label: "Update password".

### Secondary actions
- Google auth button sits above the email divider for sign-in/sign-up.
- Sign in/create account switch appears as a two-option segmented control.
- Forgot password is a text button aligned right under the password field.
- Back-to-sign-in link appears below reset/update states.

### Spacing and hierarchy
- Card padding: 24px mobile, 32px desktop.
- 20–24px between header copy, notices, mode switch, OAuth, divider, fields, and submit.
- Field labels above inputs; errors directly under inputs.

### Emphasis / hidden
- Emphasize secure confirmation links, private-by-default account creation, and clear recovery.
- Hide backend/provider implementation details except the user-facing "Continue with Google".

### States
- Loading: button text changes and spinner appears inside the button.
- Success: notice card at top of form with green/teal tone and concrete next step.
- Error: notice card with calm wording and no raw provider jargon where possible.
- Env/config missing: user-facing service unavailable notice, not technical stack copy.

### Mobile and desktop
- Same centered single-card pattern. Mobile card takes nearly full width with 20px page padding.
- Inputs are at least 44px tall.

### Emotional feel
Reassuring, direct, low-pressure.

## 6. Onboarding

### Purpose
Turn a new account into a discoverable, trustworthy profile without overwhelming the user.

### What the user sees first
- Progress component at top of the flow.
- One large card containing the current step title, description, form fields, tip, and controls.
- Step 1 asks display name and birth date before anything else.

### Step hierarchy
1. Identity: display name, birth date.
2. About you: gender, city, region, country code.
3. Bio & goals: bio, up to 3 relationship goals.
4. Interests & lifestyle: up to 12 interests and 12 lifestyle tags.
5. Preferences & extras: deal breakers, occupation, education.
6. Completion: confirmation, profile improvement tips, enter app CTA.

### Main action
- "Continue" button sits bottom-right on desktop and full-width/last on mobile.
- Completion CTA: "Enter Freeborn".

### Secondary actions
- Back button appears from step 2 onward, bottom-left desktop and beneath primary on mobile if stacked.
- No skip button for required steps. Optional fields are marked optional.

### Spacing and hierarchy
- One step per screen. No multi-step content hidden below long folds except chip lists.
- Chip sections show counters when limited.
- Tips appear below fields in a soft bordered panel.

### Emphasis / hidden
- Emphasize privacy of birth date and profile details that improve conversation quality.
- Hide advanced discovery filters until profile settings.

### States
- Loading: primary button shows spinner and "Saving…".
- Error: scroll top to notice and show field-level errors.
- Success: advance to next step, not a separate success page until final completion.

### Mobile and desktop
- Mobile keeps each step as one column, with bottom controls stacked.
- Desktop may use compact two-field grids only when fields are related.

### Emotional feel
Guided, gentle, honest, like a concierge helping the user tell the truth well.

## 7. Discover page

### Purpose
Help a member evaluate one person at a time with enough context to make a considerate like, spark, or pass.

### What the user sees first
- Page header at the top of main content:
  - Eyebrow: "Discover".
  - Title: "Meet one person at a time.".
  - Short welcome sentence personalized with first name when available.
- Under the header, desktop uses a two-column command layout:
  - Left/primary: active candidate card centered and capped around 640px.
  - Right/secondary: discovery brief panel with profile health, filters, trust cues, and links.
- Mobile shows header, a compact status strip, then the candidate card. Secondary panels move below the card.

### Main action
- The decision actions are attached to the bottom of the candidate card:
  - Pass left, neutral glass button.
  - Spark middle, violet/gold accented button for higher intent.
  - Like right, warm gradient primary button.
- On mobile, the three actions remain large, equal-width, and thumb-reachable below profile details.

### Secondary actions
- Adjust preferences link routes to `/app/profile#discovery`.
- Edit profile link routes to `/app/profile`.
- Refresh button appears only in empty state.
- Match success modal/sheet offers "View matches" and dismiss after a short time or by user action.

### Candidate card layout
- Overall card: rounded 32px, glass/midnight surface, bordered, max width 640px.
- Photo section: top, aspect ratio 4:5 on mobile and 3:4-ish on desktop, with dark gradient overlay at bottom.
- Photo progress bars sit 16px from top, spanning the photo width.
- Left/right photo navigation appears on desktop hover and remains accessible by progress buttons. Mobile uses progress buttons/tapping zones if implemented later.
- Name and age overlay at photo bottom-left. Verified badge at photo bottom/right only if `is_verified` is true.
- Under photo: location/occupation line, bio, prompt answer if available, relationship goals, interests, lifestyle tags.
- Hide any empty group rather than showing blank labels. If bio is missing, show a respectful placeholder.

### Spacing and hierarchy
- Header bottom margin: 24–32px.
- Candidate card internal padding: 24px mobile, 28–32px desktop.
- Bio line height: 1.65–1.75 for readability.
- Action buttons height: at least 64px desktop, 58px mobile.
- Remaining count and keyboard hints are below card in muted text, never above the main decision area.

### What is emphasized
- The person: photo, name, age, city, bio, intentions.
- Trust: verified badge only when real, private-data note in sidebar, finite discovery count.
- Quality of choice: "Read first, decide once" language.

### What is hidden
- Email, birth date, internal IDs, raw database values with underscores. Labels must be humanized.
- Filter controls are summarized here; full editing is in profile settings.

### Empty state
- Card centered in primary column with icon, title, body, and two actions.
- If no candidates came from the backend: "We're finding thoughtful people near you".
- If the user exhausted the loaded list: "You've seen everyone for now".
- Primary action: "Refresh discovery".
- Secondary action: "Tune preferences".
- Include a safety cue: preferences and privacy are still active.

### Loading state
- Header can render immediately.
- Candidate area uses skeleton blocks approximating photo, name, text, chips, and actions. Avoid lone spinners for full-page loading.

### Error state
- Show a bordered red-tinted card in the candidate area with title "Discovery needs a refresh", body explaining the action failed, and a retry button.
- Swipe/action failures should not silently advance the card.

### Success state
- Match success appears as a centered modal on desktop and bottom sheet on mobile:
  - warm icon, "It's a match", names, short encouragement.
  - Primary: "Open matches".
  - Secondary: "Keep discovering".

### Mobile and desktop behavior
- Desktop: two-column layout, sticky right-side brief panel when height allows.
- Mobile: single column, candidate card full width, bottom nav clearance, no hover-only essential controls.
- Candidate action buttons never move below secondary panels on mobile.

### Emotional feel
Focused, respectful, alive but not frantic. The user should feel they are meeting a whole values-aligned person, not swiping through inventory.

## 8. Profile page

### Purpose
Show the member how they appear and provide a gateway to editing their profile, photos, preferences, and account controls.

### What the user sees first
- Header: "Profile" eyebrow, title "Shape how people meet you." and a short trust/privacy sentence.
- A profile overview card with primary photo/initials, display name, location, completeness, verification status, and discoverability.
- Primary next action: "Edit profile" or "Improve profile" depending on completeness.

### Main action
- Edit profile primary button sits in the overview card, visible without scrolling on desktop and mobile.

### Secondary actions
- Manage photos.
- Discovery preferences.
- Account settings/sign out.
- Preview public profile if/when implemented.

### Spacing and hierarchy
- Use cards, not a long unstructured form as the first impression.
- Overview and status cards appear before detailed editing controls.
- Editing modules can sit below with clear section anchors.

### Emphasis / hidden
- Emphasize what public viewers see and what remains private.
- Hide email from profile overview; show it only in account settings.

### Mobile and desktop
- Desktop can use a 2-column layout: main editing/photo column and settings/status column.
- Mobile stacks: overview, photos, edit profile, discovery settings, account.

### Emotional feel
Empowering and editorial: the user is shaping a profile, not filling a form.

## 9. Profile settings

### Purpose
Give members control over discovery boundaries, privacy/discoverability, profile trust status, and account session actions.

### What the user sees first
- A settings area titled "Profile settings" or "Discovery settings" with an immediate privacy summary.
- First row/card states current discoverability: "Visible in discovery" or "Hidden from discovery".
- The most important control is discoverability, placed near the top with explanatory text.

### Main action
- For preference edits, "Save discovery settings" sits at the bottom of the discovery settings card, full width on mobile and right-aligned/full-width card width on desktop.
- For account actions, sign out is a secondary low-emphasis button at the bottom of account card.

### Secondary actions
- Link back to Discover after saving preferences.
- Edit profile details.
- Manage photos.

### Settings card layout
- Use a large glass card with grouped sections:
  1. Visibility and trust: discoverable status, verified-only preference, photos-required preference.
  2. Age and distance: three numeric controls with visible min/max hints.
  3. Who appears: gender chips.
  4. Intentions: relationship goal chips.
  5. Boundaries: strict deal breakers toggle.
- Each group has a label, one-line helper copy, and controls below.
- On desktop, age/distance controls are 3 columns; mobile stacks or uses 2 columns with distance full-width if needed.

### Account card layout
- Private label at top: "Private account details".
- Email row with caption "Only you can see this".
- Verification row with exact status.
- Profile status row.
- Discoverability row duplicates current status for confirmation.
- Sign out button at bottom.

### What is emphasized
- Control, privacy, clear consequences of visibility.
- Saved state after successful updates.

### What is hidden
- Provider names, auth IDs, storage paths, raw enum formatting.
- Do not show email in any public preview.

### States
- Loading: skeleton rows in settings cards.
- Error: red-tinted panel above save button; keep user-entered values.
- Success: green/teal panel saying "Discovery settings saved. Your next feed will reflect these boundaries." with link to Discover.

### Mobile and desktop
- Mobile settings controls stack with 12–16px gaps. Save button spans full card width.
- Desktop settings can live in the right column of profile page and remain near top.

### Emotional feel
Safe, in control, transparent. It should make the member confident that Freeborn respects their boundaries.

## 10. Edit profile

### Purpose
Allow members to update the public story and matching-relevant details on their profile.

### What the user sees first
- Section title: "Edit profile".
- Short copy: "Your story, well-told and easy to trust.".
- Privacy note: public profile excludes email, full birth date, and account provider details.

### Main action
- "Save profile" at the bottom of the edit card. Full width on mobile. Disabled/loading label "Saving…".

### Secondary actions
- None inside the form except chip toggles and prompt controls. Avoid mixing sign out/account actions with story editing.

### Form hierarchy
1. Public identity: display name, gender, height.
2. Private age gate: birth date with privacy hint.
3. Location and context: city, region, country, occupation, education.
4. Bio with character count.
5. Relationship goals with max 3.
6. Interests and lifestyle with max 12 each.
7. Deal breakers.
8. Prompts, up to 3.
9. Who to show me, if kept here; otherwise place under discovery settings.
10. Discoverability toggle, ideally mirrored in settings.

### Spacing and hierarchy
- Inputs use consistent 48px height, 12px radius minimum, 1px white/10 border.
- Textareas should not feel raw: same border, background, focus, counter, and helper text as inputs.
- Long chip groups must have max height and scroll, with gradient/fade if possible.

### States
- Inline errors per field when validation can identify them; form-level error otherwise.
- Success panel at bottom: "Profile saved.".

### Mobile and desktop
- Mobile single column. Desktop two columns only for simple paired fields.

### Emotional feel
Creative, specific, reassuring.

## 11. Empty states

### Global rules
- Empty state card contains: icon, title, body, primary action, optional secondary action, and one trust/safety cue.
- Do not say "No data" or show raw empty arrays.
- Empty states must be useful, not apologetic.

### Examples
- Discover no candidates: "We're finding thoughtful people near you" + "Refresh discovery" + "Tune preferences".
- Likes empty: "No likes yet" + explain profile completeness/photos help + action to edit profile.
- Matches empty: "No matches yet" + encourage thoughtful likes + action to discover.
- Photos empty: "Add your first photo" + privacy/recognizability copy + choose photo action.
- Messages empty: "Start with something specific" + prompt from their profile if available.

## 12. Loading states

### Global rules
- Prefer skeletons shaped like final content over centered spinners.
- Use shimmer class and dark glass blocks.
- Full-card loading should preserve page layout to reduce jump.
- Button-level loading uses an inline spinner plus a specific pending label.

### Screen-specific
- Discover: photo skeleton, name line, bio lines, chips, decision buttons.
- Settings: skeleton rows and toggles.
- Auth/onboarding: button spinner is enough because forms are already visible.

## 13. Error states

### Global rules
- Errors use danger color in a glass panel, never raw exception dumps.
- Copy format: what happened, what to do next.
- Keep user input and context.
- Retry actions should be explicit.

### Examples
- Auth: "We couldn't finish that" + normalized auth message.
- Onboarding: "We hit a snag" + highlighted fields.
- Discover action: "That choice did not save" + retry same action or keep card visible.
- Settings save: "Check your filters" + field/constraint hint.

## 14. Success states

### Global rules
- Success panels are calm, not celebratory unless it is a match or onboarding completion.
- Use success/teal border and a check icon.
- State exactly what changed.

### Examples
- Settings: "Discovery settings saved. Your next feed will reflect these boundaries.".
- Profile: "Profile saved.".
- Photo upload: "Photo added. Your first photo is used as the cover.".
- Match: celebratory modal/sheet with clear next action.

## 15. Modals and sheets

### Modal rules
- Desktop modals center in viewport with blurred dark overlay.
- Mobile modals become bottom sheets with rounded top corners and safe-area padding.
- Use modals only for high-signal events or confirmations: match success, destructive confirmation, photo delete, unsaved changes.
- Modal structure: icon, eyebrow, title, body, primary action, secondary action/close.
- Escape/click outside should dismiss non-destructive modals.

### Match modal
- Icon: warm heart/spark.
- Eyebrow: "It's a match".
- Title: "You and [Name] liked each other.".
- Body: "Start from something specific in their profile.".
- Primary: "Open matches".
- Secondary: "Keep discovering".

### Destructive sheet
- Title states the irreversible action.
- Primary destructive button is red-outline or muted red fill.
- Secondary cancel is visually safer and first on mobile if platform convention demands.

## 16. Mobile behavior

### Global mobile rules
- Minimum horizontal page padding: 16–20px.
- Cards use 20–24px padding and 24–28px radius.
- All tap targets are at least 44px high/wide.
- Bottom nav clearance: content padding bottom at least 112px.
- Avoid side-by-side controls if labels become cramped; stack instead.
- Primary form buttons full-width.
- Text should not rely on hover-only states.
- Fixed elements respect safe areas.

### Screen-specific mobile rules
- Landing: hero CTAs stack; phone preview follows copy.
- Auth: single centered card, full-width buttons.
- Onboarding: one column, sticky perception through progress, actions stacked.
- Discover: card first, actions before secondary panels, no sidebar before decisions.
- Profile/settings: overview, photos, edit, discovery settings, account in that order.

## 17. Desktop behavior

### Global desktop rules
- Use generous whitespace and a maximum content width.
- Sidebars may be sticky but cannot trap important actions out of view.
- Primary/secondary columns should feel intentional: primary task left/wider, status/settings right/narrower.
- Hover states can reveal secondary controls, but all essential controls remain accessible without hover.

## 18. SEO and public discoverability rules

- Public web surfaces must be semantic, crawlable, internally linked, and fast.
- Metadata, canonical URLs, sitemap, robots rules, structured data, headings, and copy must be designed together.
- Protected app routes should not be indexed.
- Homepage structured data should describe the organization, website, app, and FAQ without fake ratings or fake offers.
- SEO copy should clearly include medical freedom, natural health, values-aligned dating, and long-term relationships without keyword stuffing.

## 19. Implementation priority from this blueprint

1. Rebuild Discover page to match section 7.
2. Rebuild Profile Settings to match section 9.
3. Then revisit Profile overview/edit profile, photos, likes/matches empty states, mobile parity, and remaining loading/error states.
