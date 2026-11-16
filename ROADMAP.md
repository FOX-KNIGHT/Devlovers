# 🗺️ Devlovers Master Architecture & Execution Roadmap

This document serves as the authoritative, end-to-end milestone tracker for the Devlovers Global Hackathon & Innovation Platform.

---

## 📊 Milestone Execution Overview

| Phase | Description | Status | Test Coverage |
| :--- | :--- | :--- | :--- |
| **Phase 0** | **Foundation, Design System, Platform Layer & i18n** | **✅ 100% COMPLETE** | **25 / 25 Passing** |
| **Phase 1** | **PostgreSQL Data Layer & Drizzle ORM** | ⏳ Planned | Pending |
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
- [x] **Clean Dependency Graph**: Purged obsolete CRA remnants (`react-scripts`, `public/index.html`, orphan dropdowns).

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
- [x] **Modular Notification Dropdown**: Dedicated Radix UI popover with unread indicator pings, single-item read toggles, and batch clear actions.
- [x] **Reactive Feed Sorting & Channel Filtering**: Dynamic sorting by Newest, Oldest, High Bounty, and Deadline Soon, plus active sprint channel telemetry banners.
- [x] **Offline Draft Persistence**: Robust LocalStorage draft serialization with JSON error recovery for offline hackathon registrations and pitches.
- [x] **Responsive Mobile Drawer**: Seamless slide-out navigation sheet on viewport `<= 768px` with quick page links and live sprint channels.

### 5. Automated Verification & CI/CD
- [x] **Zero-Dependency Test Suite**: 25 unit tests using Node 20's native `node:test` and `node:assert/strict` covering platform services and schema contracts.
- [x] **ESLint Linting**: Direct `eslint .` command in `package.json`.
- [x] **GitHub Actions Workflow**: Automated pipeline executing dependency install, linting, unit tests, and production build on every PR and push to `main`.
- [x] **Metadata & SEO**: Dynamically generated OpenGraph images (`next/og`), `robots.txt`, and XML `sitemap.js`.

---

## ⏳ Phase 1: High-Performance Data Layer & Drizzle ORM

*Objective: Transition from client-side mock arrays to a production PostgreSQL database managed with Drizzle ORM.*

### Key Deliverables:
- [ ] Install and configure `drizzle-orm`, `drizzle-kit`, and `pg` / `@neondatabase/serverless`.
- [ ] Define relational database schema in `src/db/schema/`:
  - `hackathons`: id, slug, title, description, banner_url, prize_pool_cents, currency, status enum, starts_at, ends_at, timezone, criteria_weights (jsonb), created_at.
  - `users`: id, external_auth_id, username, email, full_name, avatar_url, bio, skills (text array), github_handle, created_at.
  - `squads`: id, hackathon_id, name, tagline, looking_for (text array), max_members, created_by, created_at.
  - `squad_members`: id, squad_id, user_id, role enum, joined_at.
  - `submissions`: id, hackathon_id, squad_id, title, repo_url, demo_url, verified_commits, status enum, submitted_at.
  - `evaluations`: id, submission_id, judge_id, criteria_scores (jsonb), raw_score, normalized_z_score, notes, evaluated_at.
- [ ] Migration generation scripts (`npm run db:generate`, `npm run db:migrate`).
- [ ] Seed script (`src/db/seed.ts`) populating high-fidelity real-world hackathon datasets.
- [ ] Type-safe query helper repositories (`src/db/queries/`).

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

*Last Updated: 2026-11-16 — Phase 0 Certified Complete*
