# Unresolved Items

## AI-Powered Column Detection
- **Status:** Built but not funded
- **What:** The `/api/events/detect-columns` endpoint uses Claude Haiku to intelligently map spreadsheet columns by analyzing both header names and sample values. This handles edge cases that regex can't (e.g., unlabeled columns with email values, semantic variants like "movement" → denomination).
- **Blocker:** Anthropic API account needs credits. Go to [console.anthropic.com](https://console.anthropic.com) → Plans & Billing → add payment method and purchase credits (minimum $5).
- **Current workaround:** Regex pattern matching + value-based detection (checks if values look like emails, dates, denominations). Works for common cases but misses semantic variants.
- **Files:** `src/app/api/events/detect-columns/route.ts` (ready to go once funded)

## Role Types
- **Status:** Needs rethinking
- **What:** Current roles (program_manager, org_leader, communal_leader) are too rigid. Need to decide whether roles are permissions (contributor/admin/viewer) or job titles, and whether to defer role-based access control until multiple users exist at the same org.

## Google OAuth
- **Status:** Not configured
- **What:** Google sign-in on the login/signup pages is wired up in code but Google OAuth provider needs to be enabled in Supabase + Google Cloud OAuth credentials created.
