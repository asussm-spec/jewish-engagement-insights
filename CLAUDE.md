# Jewish Engagement Insights

## Overview

A web application that collects event and membership data from Jewish organizations, anonymizes participants, and generates cross-organizational engagement insights. See `docs/SPEC.md` for the full product spec.

## Tech Stack

- **Framework:** Next.js 16 (App Router, TypeScript)
- **UI:** Custom design system in `src/components/layout/page-primitives.tsx` (PageHead, StatGrid, StatCard, Panel, InsightCard, DsButton) on top of shadcn/ui primitives. Tokens (paper/ink/stone palette, serif headings) defined as CSS custom properties in `src/app/globals.css`.
- **Database:** Supabase (Postgres) — schema in `supabase/schema*.sql`, configured via `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` in `.env.local`
- **Auth:** Supabase Auth (Google OAuth + email/password) with middleware-enforced route protection
- **Charts:** Recharts (via shadcn/ui chart component)
- **Deploy:** Vercel — not yet configured

## Project Structure

```
src/
  app/
    (auth)/                 # Login, signup pages (public)
    (dashboard)/dashboard/  # Authenticated pages
      events/               # Event list, detail, new, upload, by-type
      population/           # Population list, profile, new upload
      insights/             # Community Insights tabs
    api/
      events/               # attendance, community-distribution, by-type,
                            #   detect-columns, process-attendees
      population/           # validate-members, process-members
    auth/callback/          # OAuth redirect
    demo/population/        # Standalone demo route (no auth)
    layout.tsx              # Root layout
    page.tsx                # Marketing landing page
    globals.css             # Design tokens (--ink-*, --paper-*, --stone-*, etc.)
  components/
    layout/                 # dashboard-shell, page-primitives (the design system)
    events/                 # event-specific components
    population/             # population-profile, population-comparison
    insights/               # community-insights (4-tab analytics)
    ui/                     # shadcn/ui primitives (~20 components)
  lib/
    supabase/               # server, client, service helpers
    event-analytics.ts      # demographic field discovery, attribute prefix stripping
    field-classification.ts # field registry and classification
    mock-*.ts               # mock data for demo mode (population, members,
                            #   community insights, community comparison)
    utils.ts                # cn() helper
supabase/                   # SQL schema + migrations
scripts/                    # seed-data, build-demo-csv, fix-event-types, etc.
sample-data/                # Sample CSVs for upload testing
```

## Development

```bash
npm run dev     # Start dev server at localhost:3000
npm run build   # Production build
npm run lint    # ESLint
```

## Demo mode

`?demo=true` on any dashboard URL sets a `demo_mode` cookie (4h lifespan) that bypasses Supabase auth and renders a mock Temple Beth Shalom org through the dashboard shell. Used by `(dashboard)/layout.tsx` (DEMO_USER + DEMO_PROFILE) and surfaces mock data on dashboard home, population profile + community comparison, and the Community Insights tabs. The standalone `/demo/population` route renders the population profile outside the dashboard shell with no cookie required.

## Conventions

- Use the design system primitives from `@/components/layout/page-primitives` (PageHead, Panel, StatGrid, StatCard, InsightCard, DsButton) for new pages — don't reach for shadcn Cards directly
- Style with the CSS custom properties defined in `src/app/globals.css` (`var(--ink-800)`, `var(--paper-100)`, etc.) rather than hardcoded colors
- Add new shadcn primitives via: `npx shadcn@latest add <component>`
- Use the `cn()` utility from `@/lib/utils` for conditional class merging
- Keep pages thin — extract logic into components under `src/components/`
- Use Server Components by default; add `"use client"` only when needed (interactivity, hooks)
- Prefer named exports for components

## Current state

Working application with auth, database, and the following flows live:
- Marketing landing page
- Login/signup (Google OAuth + email/password)
- Dashboard home with KPI tiles + quick actions
- Events: list, detail with attendance analytics, new event form, CSV upload with column mapping (regex + AI fallback) and processing
- Population: upload list, profile dashboard (10 chart sections, quarter-over-quarter changes), upload validation diff (new/updated/unchanged), community comparison against peer synagogues
- Community Insights: 4 tabs (Overview, Engagement, Demographics, Retention & Pipeline)
- Demo mode for showing the product without auth
