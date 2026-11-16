# 🗺️ Devlovers Master Architecture & Execution Roadmap

This document serves as the authoritative, end-to-end milestone tracker for the Devlovers Global Hackathon & Innovation Platform.

---

## 📊 Milestone Execution Overview

| Phase | Description | Status | Test Coverage |
| :--- | :--- | :--- | :--- |
| **Phase 0** | **Foundation, Design System, Platform Layer & i18n** | **✅ 100% COMPLETE** | **36 / 36 Passing** |
| **Phase 1** | **PostgreSQL Data Layer & Drizzle ORM** | **✅ 100% COMPLETE** | **71 / 71 Passing** |
| **Phase 2** | **Supabase Auth, Sessions & Row-Level Security (RLS)** | ⏳ Planned | Pending |
| **Phase 3** | **Remote Stateless MCP Server (Agentic Protocol)** | ⏳ Planned | Pending |
| **Phase 4** | **MCP Apps & Dynamic Interactive Workspace** | ⏳ Planned | Pending |
| **Phase 5** | **Production Hardening, Observability & Launch** | ⏳ Planned | Pending |

---

## ✅ Phase 0: Foundation & Platform Layer (Completed)

Phase 0 establishes the bedrock foundation, aesthetic identity, internationalization, and platform runtime.

### 1. Framework & Core Runtime
- [x] **Next.js 16.4.6 (React 19)**: Configured with App Router, server-rendered layouts, dynamic metadata, and webpack compilation.
- [x] **Strict ESM Migration**: Full `"type": "module"` support across configs and test suites.
- [x] **Clean Dependency Graph**: Purged obsolete CRA remnants (`react-scripts`, `public/index.html`, orphan dropdowns, and conflicting legacy `public/robots.txt`).

### 2. Design Tokens & Aesthetic Identity (Void System)
- [x] **Tailwind CSS v4 Integration**: Pure CSS `@import "tailwindcss";` pipeline with `@layer base`.
- [x] **Void Design Tokens**:
  - Void Background: `#06080F`
  - Deep Surface: `#0C0F1D`
  - Elevated Container: `#141A2E`
  - Laser Cyan: `#00F5FF`
  - Hyper Violet: `#8A2BE2`
  - Emerald Signal: `#00FF9D`
  - Solar Amber: `#FF9E00`
- [x] **Glassmorphism & HUD Elements**: High-performance backdrop blur layers (`backdrop-blur-xl`), animated conic gradient border beams, and real-time radar ping indicators.
- [x] **3D Card Micro-Interactions**: Framer Motion spring physics with perspective tilt and dynamic glare overlays (`TiltCard`).

### 3. Internationalization (i18n) & Regionalization
- [x] **Multi-Dictionary Engine**: Context-driven client i18n provider supporting English (`en`), Spanish (`es`), and Japanese (`ja`).
- [x] **100% Dictionary Key Parity**: Automated unit test assertion verifying zero missing keys across all languages.
- [x] **Component Localization**: Full coverage across Navigation, Filter bar, Feed Posts, Sidebar Channels, Global Dispatch, and Command Palette.
- [x] **Global Currency FX Conversion**: Localized conversion with custom rounding for USD, EUR, GBP, INR, and JPY.
- [x] **Universal Dual-Timezone Display**: Instant toggle between Viewer's Local Time and Greenwich Mean Time (UTC).

### 4. Audio Engine & PWA Native Layer
- [x] **Synthesized Web Audio Engine**: Zero-asset procedural UI audio effects (sine and triangle oscillator synthesis for click and success chimes).
- [x] **PWA Application Badging API**: Native OS dock / taskbar badge synchronization based on real-time unread notifications count.
- [x] **Enhanced Notification Dropdown**: Dedicated Radix UI popover with category-aware icons (feedback, deadline, joined, system, submission), unread filter tabs, single-item read toggles, and batch clear actions.
- [x] **Reactive Feed Sorting & Track Channel Filtering**: Dynamic sorting by Newest, Oldest, High Bounty, and Deadline Soon, plus bidirectional channel filters and active sprint telemetry banners.
- [x] **Evaluation Rubric Breakdown**: Real-time visualization of 100% weighted judging criteria (Innovation, Technical Depth, Execution, Impact) on challenge cards.
- [x] **Relational Schema Contract**: Explicit `hackathonId` and `hackathonSlug` relations across mock datasets, verified by contract tests.
- [x] **Offline Draft Persistence**: Robust LocalStorage draft serialization with JSON error recovery for offline hackathon registrations, squad formations, and pitches.
- [x] **Responsive Mobile Drawer**: Seamless slide-out navigation sheet on viewport `<= 768px` with quick page links and live sprint channels.
- [x] **Live Countdown Timer Engine**: Custom `useCountdown` hook with day/hour/minute/second calculations and automatic expiry flags for ongoing and upcoming sprints.
- [x] **Squad Matchmaker Modal**: Interactive squad matchmaking dialog featuring compatibility ratings, open role badges, one-click squad join requests, and offline squad draft creation.
- [x] **Active Tech Stack Tag Filtering**: Interactive tech stack chips on challenge cards with global state filtering, active HUD indicator, and instant clear capability.
- [x] **Prize Pool Distribution Popover**: Interactive prize tier breakdown (1st: 60%, 2nd: 25%, 3rd: 10%, Sponsor: 5%) dynamically formatted in the user's active currency.
- [x] **Sprint Bookmark / Saved Sprints Engine**: Offline persistent bookmarks with instant card bookmark toggles, toast notifications, audio chimes, and a dedicated "Bookmarked" filter in the challenge feed.
- [x] **Developer Leaderboard & Hall of Fame (`LeaderboardView.jsx`)**: Global rankings podium (Gold/Silver/Bronze), XP points, bounties won, wins counter, team captain handles, and search filter by tech specialty.
- [x] **Direct Sprint Deep-Link Sharing**: One-click sprint link copy to clipboard with toast notification and audio feedback.

### 5. Automated Verification & CI/CD
- [x] **Zero-Dependency Test Suite**: 36 unit tests across 8 test suites using Node 20's native `node:test` and `node:assert/strict` covering platform services, timers, formatters, squad matchmaking contracts, rankings, and live browser endpoints.
- [x] **Automated Live Browser & Visual Audit**: End-to-end audit test suite (`tests/browser-audit.test.mjs`) verifying HTTP 200 responses, semantic landmarks, OpenGraph image tags, sitemap XML, PWA manifest, and dynamic crawler directives.
- [x] **ESLint Linting**: Direct `eslint .` command in `package.json`.
- [x] **GitHub Actions Workflow**: Automated pipeline executing dependency install, linting, unit tests, and production build on every PR and push to `main`.
- [x] **Metadata & SEO**: Dynamically generated OpenGraph images (`next/og`), `robots.txt`, and XML `sitemap.js`.

---

## ✅ Phase 1: High-Performance Data Layer & Drizzle ORM (Completed)

*Objective: Transition from client-side mock arrays to a production PostgreSQL database managed with Drizzle ORM.*

### Key Deliverables:
- [x] Install and configure `drizzle-orm`, `drizzle-kit`, and `postgres` driver in ESM Next.js 16.
- [x] Define relational database schema in `src/db/schema/`:
  - `hackathons`: id, slug, title, description, banner_url, prize_pool_cents, currency, status enum, starts_at, ends_at, timezone, criteria_weights (jsonb), prize_distribution (jsonb), created_at.
  - `users`: id, external_auth_id, username, email, full_name, avatar_url, bio, skills (jsonb), github_handle, role enum, created_at.
  - `squads`: id, hackathon_id, name, tagline, looking_for (jsonb), max_members, compatibility_score, created_by, created_at.
  - `squad_members`: id, squad_id, user_id, role enum, joined_at.
  - `submissions`: id, hackathon_id, squad_id, title, repo_url, demo_url, verified_commits, status enum, submitted_at.
  - `evaluations`: id, submission_id, judge_id, criteria_scores (jsonb), raw_score, normalized_z_score, feedback, evaluated_at.
  - `social`: likes, comments (with threaded replies), bookmarks.
  - `sponsors`: sponsor_credits with claim tracking.
  - `analytics`: events telemetry table for real-time views, registrations, and submissions.
  - `messages`: conversations, conversation_members, and direct messages.
  - `audit`: audit_logs for host and admin operational traceability.
  - `notifications`: system & user notifications with categories and unread counters.
  - `tracks`: challenge tracks and prize categories.
  - `registrations`: hackathon participant registration ledger.
  - `relations`: comprehensive bidirectional Drizzle relations mapping across all 18 tables.
- [x] Migration generation scripts (`npm run db:generate`, `npm run db:migrate`) and SQL migrations (`0000_skinny_shotgun.sql`, `0001_windy_magdalene.sql`, `0002_abandoned_hawkeye.sql`, `0003_parched_excalibur.sql`).
- [x] Seed script (`src/db/seed.js`) populating high-fidelity real-world hackathon datasets.
- [x] Type-safe query helper repositories (`src/db/queries/hackathons.js`, `squads.js`, `leaderboard.js`, `submissions.js`, `social.js`, `users.js`, `evaluations.js`, `messages.js`, `audit.js`, `notifications.js`, `registrations.js`) with offline fallback support.
- [x] REST API Route Handlers: `/api/hackathons`, `/api/hackathons/[slug]`, `/api/squads`, `/api/leaderboard`, `/api/comments`, `/api/likes`, `/api/bookmarks`, `/api/notifications`, `/api/submissions`, `/api/messages`, `/api/evaluations`, `/api/users`, `/api/registrations`.
- [x] UI Reactive Hydration: `AppContext.jsx`, `FeedPost.jsx`, and `LeaderboardView.jsx` dynamically revalidate against live REST APIs with instant offline caching.
- [x] Project Showcase & Submission Flow: Interactive Submissions Matrix (`ProjectShowcaseView.jsx`), real-time search, verified git commit pills, like triggers, and Project Submission Modal (`SubmitProjectModal.jsx`) connected to `/api/submissions`.
- [x] Automated Test Suite expansion: 73 / 73 tests passing covering schemas, enums, relational queries, submissions contracts, and live API endpoints.

---

## ⏳ Phase 2: Supabase Auth & Row Level Security (RLS)

*Objective: Production authentication, session management, and granular database security policies.*

### Key Deliverables:
- [ ] Configure `@supabase/supabase-js` and `@supabase/ssr` with Next.js App Router.
- [ ] Implement OAuth providers (GitHub Developer OAuth & Google OAuth) + Passwordless Magic Link.
- [ ] Server Action authentication flows (`login`, `signup`, `logout`, `callback`).
- [ ] Next.js Edge Middleware for protected routes (`/dashboard`, `/squads/create`, `/admin`, `/submit`).
- [ ] Postgres Row Level Security (RLS) policies:
  - Public read access for published hackathons and squad listings.
  - Authenticated-only squad creation and membership updates.
  - Strict submission edit access limited to verified squad members prior to deadline.
  - Blind judging isolation (judges cannot view creator identities or peer scores).

---

## ⏳ Phase 3: Remote Stateless MCP Server (Agentic Protocol)

*Objective: Provide a secure Model Context Protocol server exposing hackathon capabilities to AI agents.*

### Key Deliverables:
- [ ] Deploy remote stateless MCP server adhering to JSON-RPC 2.0 / MCP spec.
- [ ] MCP Tools:
  - `list_active_hackathons`: Query hackathons by category, prize threshold, and tech stack.
  - `match_squad`: Semantic squad matching based on developer skill vector and squad open roles.
  - `verify_github_commits`: Verify commits occurred strictly between sprint window `starts_at` and `ends_at`.
  - `evaluate_submission_rubric`: Automated preliminary scoring of project README, deployment status, and originality.
- [ ] MCP Resources & Prompts for automated judging audits and squad pitch generation.
- [ ] Bearer token authentication and per-minute rate limiting for agent consumers.

---

## ⏳ Phase 4: MCP Apps & Dynamic Interactive Workspace

*Objective: Embedded AI Copilot and dynamic visual canvas inside Devlovers.*

### Key Deliverables:
- [ ] Interactive Squad Matchmaker dock: Drag-and-drop squad formation interface with AI compatibility scores.
- [ ] Sponsor API Dispensary: One-click generation of sandboxed API keys for hackathon sponsor tracks.
- [ ] Real-time Submissions Matrix: Live radar chart displaying normalized score distribution and judging progress.
- [ ] Interactive Judging Console: Side-by-side code diff viewer, demo video player, and blind evaluation slider interface.

---

## ⏳ Phase 5: Production Hardening, Observability & Launch

*Objective: Enterprise resilience, zero-lag global delivery, and compliance.*

### Key Deliverables:
- [ ] Edge Caching & ISR (Incremental Static Regeneration) on hackathon feed and sitemaps.
- [ ] Sentry / OpenTelemetry integration for real-time error tracking and performance profiling.
- [ ] Security audit: Content Security Policy (CSP), rate limiting, sanitization, and automated dependency vulnerability checks via Dependabot.
- [ ] Lighthouse 100/100 Core Web Vitals audit (LCP < 1.2s, INP < 50ms, CLS 0).
- [ ] Custom domain DNS, SSL pinning, and global CDN delivery via Vercel.

---

*Last Updated: 2026-11-17 — Phase 0 & Phase 1 Certified Complete*
