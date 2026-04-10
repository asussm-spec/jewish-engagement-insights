# Jewish Engagement Insights

## Overview

A web application that collects event and membership data from Jewish organizations, anonymizes participants, and generates cross-organizational engagement insights. See `docs/SPEC.md` for the full product spec.

## Tech Stack

- **Framework:** Next.js 16 (App Router, TypeScript)
- **UI:** shadcn/ui components + Tailwind CSS v4
- **Database:** Supabase (Postgres) — not yet configured
- **Auth:** Supabase Auth (Google OAuth + email) — not yet configured
- **Charts:** Recharts (via shadcn/ui chart component)
- **Deploy:** Vercel — not yet configured

## Project Structure

```
src/
  app/
    (auth)/          # Login, signup pages (public)
    (dashboard)/     # Authenticated pages
      events/        # Event entry + analysis
      population/    # Population upload + analysis
    layout.tsx       # Root layout
    page.tsx         # Landing page
  components/
    layout/          # App shell (nav, sidebar)
    ui/              # shadcn/ui components (auto-generated)
  lib/
    utils.ts         # shadcn utility (cn function)
  hooks/             # Custom React hooks
docs/
  SPEC.md            # Product specification
```

## Development

```bash
npm run dev     # Start dev server at localhost:3000
npm run build   # Production build
npm run lint    # ESLint
```

## Conventions

- Use shadcn/ui components from `@/components/ui/` — don't build custom UI primitives
- Add new shadcn components via: `npx shadcn@latest add <component>`
- Use the `cn()` utility from `@/lib/utils` for conditional class merging
- Keep pages thin — extract logic into components under `src/components/`
- Use Server Components by default; add `"use client"` only when needed (interactivity, hooks)
- Prefer named exports for components

## Current State

MVP scaffold — no backend, no auth, no database. The app currently has:
- Next.js app with shadcn/ui components installed
- Landing page placeholder
- Directory structure for auth and dashboard routes
