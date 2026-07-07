◉

**PERSONAL AI LIFE DASHBOARD**

Implementation & Architecture Plan

_Tracking Mood · Sleep · Habits · Money · Hobbies_

Prepared for Adithya · June 2026

# 1\. Background & Why This Matters

Most people manage their life entirely from memory and feeling. Mood, sleep, money, habits, and hobby time exist as vague impressions - "I've been tired lately," "I think I'm overspending" - never as something you can actually look at.

The Quantified Self movement and behavioral research (Fogg Behavior Model, self-monitoring studies in CBT and habit literature) converge on one finding: the act of measurement changes behavior, independent of any advice attached to it. Logging a habit daily increases adherence. Logging mood daily increases emotional awareness. This is sometimes called the "mere-measurement effect."

## 1.1 The Problem With Existing Tools

- Habit apps (Streaks, Habitica) only do habits - no mood, no money, no cross-domain view.
- Mood trackers (Daylio) don't connect feelings to sleep, spending, or behavior.
- Budget apps (Walnut, Money Manager) are finance-only and feel like accounting, not self-reflection.
- None of them tell you anything - they store data but don't reason about it.
- Most require a subscription once you want more than 1 tracked category.

## 1.2 The Core Idea

One dashboard, five domains, a single daily ritual (2 minutes), and an AI layer on top that actually notices patterns across domains - e.g. "Your mood drops on days you sleep under 6 hours and skip exercise" - something no single-purpose app can say, because it only sees one slice of you.

# 2\. Goals & Design Principles

| **Principle** | **What it means in practice**                                                                                                 |
| ------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| Easy          | Daily check-in takes under 2 minutes. Sliders and taps, not forms.                                                            |
| Free          | Runs entirely on free tiers - Supabase free tier, Vercel free tier, Claude API pay-per-use (pennies/month at personal scale). |
| Simple        | Five domains, one screen, no nested menus for the core flow.                                                                  |
| Fun           | Streaks, a Life Score, a radar chart "pulse" - gamified without being childish.                                               |
| Interactive   | Live sliders, animated counters, instant AI insights, not static forms.                                                       |

# 3\. Tech Stack

The stack is chosen for zero/near-zero cost, fast iteration, and a clean upgrade path from a local prototype to a real synced multi-device app.

## 3.1 Frontend

| **Layer** | **Choice**                             | **Why**                                                                         |
| --------- | -------------------------------------- | ------------------------------------------------------------------------------- |
| Framework | React 18 + Vite                        | Fast dev server, huge ecosystem, what the current prototype is already built in |
| Styling   | Plain CSS-in-JS / Tailwind (optional)  | No build complexity; Tailwind only if the project grows past ~10 components     |
| Charts    | Custom SVG (radar) + Recharts (trends) | Full control over the signature radar chart; Recharts for time-series later     |
| State     | React useState/useReducer + Context    | App is small enough that Redux/Zustand is unnecessary overhead                  |
| Hosting   | Vercel (free tier)                     | Zero-config React deploys, automatic HTTPS, generous free tier                  |

## 3.2 Backend & Data

| **Layer**     | **Choice**                               | **Why**                                                                                         |
| ------------- | ---------------------------------------- | ----------------------------------------------------------------------------------------------- |
| Database      | Supabase (Postgres)                      | Free tier: 500MB DB, 50K monthly active users - absurdly generous for a personal app            |
| Auth          | Supabase Auth (email or Google login)    | Built-in, free, lets you log in from phone + laptop with the same data                          |
| API layer     | Supabase auto-generated REST + JS client | No need to hand-write a backend; supabase-js talks to Postgres directly with row-level security |
| Realtime sync | Supabase Realtime (optional, Phase 3)    | Live updates if you ever add a companion mobile widget                                          |
| File/exports  | Supabase Storage (optional)              | For storing generated weekly PDF reports                                                        |

## 3.3 AI Layer

| **Layer**       | **Choice**                                           | **Why**                                                                                          |
| --------------- | ---------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| Insights engine | Claude API (claude-sonnet-4-6)                       | Already integrated in the prototype; strong at noticing cross-domain patterns in structured data |
| Call pattern    | Client → your own thin serverless proxy → Claude API | Never call Claude directly from the browser with a real API key embedded - see Section 5.3       |
| Cost            | ~\$0.003 per insight call (Sonnet, short prompts)    | At 1 insight/day, under \$0.10/month                                                             |

## 3.4 Stack Summary Diagram (textual)

React (Vercel) → Supabase JS client → Supabase Postgres + Auth → Supabase Edge Function → Claude API

# 4\. System Architecture

## 4.1 High-Level Flow

- User opens the app and logs in via Supabase Auth (email magic link or Google OAuth).
- React app fetches today's row (and recent history) from Supabase via supabase-js.
- User interacts with sliders/toggles → local state updates instantly (optimistic UI).
- Changes are debounced and written to Supabase (upsert on date + user_id).
- "AI Insights" button calls a Supabase Edge Function, which calls the Claude API server-side and returns the insight text.
- Weekly, a scheduled Edge Function (Supabase Cron) can pre-generate a "week in review" summary.

## 4.2 Why a Serverless Proxy (Not Calling Claude Directly From the Browser)

Calling the Claude API straight from client-side JavaScript means your API key sits in the browser bundle, visible to anyone. Supabase Edge Functions (or Vercel serverless functions) solve this: the key lives server-side as an environment variable, the browser calls your function, and your function calls Claude.

## 4.3 Data Model (Postgres tables)

| **Table**   | **Key columns**                                                      | **Purpose**                                                        |
| ----------- | -------------------------------------------------------------------- | ------------------------------------------------------------------ |
| daily_logs  | id, user_id, date, mood_score, mood_note, sleep_hours, sleep_quality | One row per user per day - the core record                         |
| habits      | id, user_id, name, created_at, active                                | User-defined habit list                                            |
| habit_logs  | id, habit_id, date, done                                             | Per-day completion, used to compute streaks                        |
| expenses    | id, user_id, date, label, amount, category                           | Individual spend entries                                           |
| budgets     | id, user_id, month, amount                                           | Monthly budget ceiling                                             |
| hobbies     | id, user_id, name, created_at                                        | User-defined hobby list                                            |
| hobby_logs  | id, hobby_id, date, minutes                                          | Time spent per hobby per day                                       |
| ai_insights | id, user_id, date, content                                           | Cached AI insight text, avoids re-calling the API for the same day |

_Row-Level Security (RLS) is turned on for every table from day one: each policy restricts rows to auth.uid() = user_id, so even with the public API exposed, one user can never read another's data._

# 5\. Security & Privacy

- All tables behind Supabase Row-Level Security (RLS) - enforced at the database, not just the app.
- Claude API key stored only as a server-side environment variable (Supabase Edge Function secret), never shipped to the browser.
- HTTPS everywhere by default via Vercel + Supabase.
- Mood notes and money data are sensitive - no third-party analytics SDKs are added to the app.
- Local-only mode remains available (current localStorage prototype) for anyone who wants zero cloud dependency.

# 6\. Phased Implementation Plan

## Phase 0 - Prototype (Done)

Single-file React app, in-memory + localStorage persistence, all five domains, radar chart, live Claude API call for insights. This is what exists today and is the design reference for everything below.

## Phase 1 - Real Backend (Week 1-2)

- Create a Supabase project (free tier). Define the 8 tables above with RLS policies.
- Add Supabase Auth: email magic-link login screen as the app's entry point.
- Replace localStorage calls with supabase-js read/write calls, keeping the same UI.
- Add a thin debounce layer so sliders don't fire a network write on every pixel of drag.

## Phase 2 - Secure AI Integration (Week 2-3)

- Write a Supabase Edge Function (Deno/TypeScript) that accepts today's data, calls the Claude API server-side, and returns insight text.
- Cache the result in the ai_insights table so re-opening the app doesn't re-spend API credits.
- Add a "Regenerate" button for when the user wants a fresh take.

## Phase 3 - History & Trends (Week 3-4)

- Add a 7/30-day trend view per domain using Recharts line charts.
- Compute and surface simple correlations (e.g. sleep vs. mood) directly in the UI, not just via AI text.
- Add a "Week in Review" auto-summary, generated every Sunday via a scheduled Edge Function.

## Phase 4 - Polish & Extras (Week 4+)

- PDF/Word export of weekly reports (reuse the existing docx/pdf skills pattern).
- Badges/milestones for streaks and Life Score thresholds.
- Optional: PWA install prompt so it behaves like a native app on your phone home screen.

# 7\. Benefits & What You Get

- A single 2-minute daily ritual replaces five different mental tabs you're already keeping open.
- Cross-domain pattern detection (sleep × mood, spending × mood, hobby time × mood) that no single-purpose app offers.
- Fully free to run at personal scale - Supabase and Vercel free tiers, pennies per month on Claude API calls.
- Data ownership - it's your Postgres database, exportable any time, not locked in a closed app.
- A genuinely fun, game-like surface (Life Score, streaks, radar pulse) on top of what is otherwise a spreadsheet.

# 8\. Next Step

The recommended starting point is Phase 1: stand up the Supabase project and tables, wire auth, and swap localStorage for real database calls while keeping the existing UI exactly as it is. That alone turns the prototype into a real, cross-device personal system.