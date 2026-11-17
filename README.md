# 🌌 Devlovers | The Global Hackathon & Innovation Platform

Devlovers is an enterprise-grade platform connecting developers to high-stakes hackathons, squad formation tools, and AI-augmented judging.

Built on **Next.js 16 (React 19)**, **Tailwind CSS v4**, **shadcn/ui**, **Framer Motion**, and **Model Context Protocol (MCP)**.

---

## ⚡ Tech Stack

- **Framework**: Next.js 16.4.6 (App Router, Server Actions, Dynamic OG Generation)
- **Runtime & UI**: React 19, Tailwind CSS v4, shadcn/ui, Radix UI Primitives
- **Animations**: Framer Motion (3D Tilt & Glare, Spring Reveals)
- **Audio Engine**: Synthesized Web Audio UI sound effects (zero audio assets)
- **Internationalization**: Multi-language i18n engine (English, Spanish, Japanese) with RTL layout preparedness
- **Platform Layer**: Universal PWA with standalone window chrome & App Badging API
- **Data Layer (Phase 1)**: Drizzle ORM, PostgreSQL (18 relational tables, 4 enums), Drizzle Kit migrations, and Next.js App Router REST API endpoints
- **Auth & Security (Phase 2)**: Supabase Auth (`@supabase/supabase-js`, `@supabase/ssr`), Edge middleware route protection (`/dashboard`, `/squads/create`, `/admin`, `/submit`), multi-modal authentication (GitHub, Google, Magic Link, Password), and PostgreSQL Row Level Security (RLS) across all 18 tables with blind evaluation anti-bias judging
- **Testing & Verification**: 155 automated tests passing across 34 suites (`node:test`), ESLint 10 flat config (`eslint.config.mjs`)
- **Agentic Protocol (Phase 3)**: Remote Stateless Model Context Protocol (MCP) server (`protocolVersion: "2024-11-05"`), JSON-RPC 2.0 at `POST /api/mcp`, 6 tools (`list_active_hackathons`, `match_squad`, `verify_github_commits`, `evaluate_submission_rubric`, `get_sprint_details`, `get_developer_leaderboard`), 3 resources (`hackathons://active`, `rubrics://standard`, `squads://open`), 3 prompts (`audit_submission`, `squad_pitch`, `summarize_hackathon`), sliding-window rate limiting (60 req/min), Bearer token/API key authentication, and interactive Cyber Void UI inspector (`McpInspectorModal.jsx`)
- **Workspace & MCP Apps (Phase 4)**: Interactive Hackathon Workspace (`WorkspaceView.jsx`) with Squad Matchmaker Dock (role slotting & AI synergy gauge), Sponsor API Dispensary ($345 credit pool & sandboxed token provisioning at `/api/sponsors/dispense`), 4-Pillar Multi-Axial Submissions Radar Matrix, Blind Anti-Bias Judging Console with Z-Score Normalization ($Z = (X-\mu)/\sigma$), floating AI Copilot Dock (`AiCopilotDock.jsx`), and Header quick launcher (`Sparkles`)
- **Production Hardening & Observability (Phase 5)**: Enterprise Security Hardening (strict CSP, HSTS `max-age=63072000`, X-Frame-Options DENY, X-Content-Type-Options nosniff), Stale-While-Revalidate Edge Caching (`next.config.mjs`), On-Demand ISR Revalidation (`POST /api/revalidate`), System Health Diagnostic Probe (`GET /api/health`), Structured JSON Logger with token redaction (`logger.js`), OpenTelemetry/Sentry distributed tracing engine (`telemetry.js`), Core Web Vitals RUM observer (`web-vitals.js`), Cyber Void Telemetry Error Boundary (`GlobalErrorBoundary.jsx`), Server Instrumentation (`instrumentation.js`), and Multi-Region Global Edge Deployment (`vercel.json`, `.github/workflows/ci.yml`)

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Run the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the application.

### 3. Run Automated Tests & Lint
```bash
npm test         # 155 / 155 tests passing across 34 suites
npm run lint     # ESLint 10 flat config verification
```

### 4. Database Migrations & Seeding (Drizzle ORM)
```bash
npm run db:generate   # Generate SQL migrations
npm run db:migrate    # Apply migrations to PostgreSQL
npm run db:seed       # Populate realistic hackathons, squads, and rubrics
```

### 5. Build for Production
```bash
npm run build
npm start
```

---

## ⌨️ Global Shortcuts

- `⌘K` (macOS) / `Ctrl+K` (Windows/Linux) — Open Universal Command Palette
- `⌘J` (macOS) / `Ctrl+J` (Windows/Linux) — Toggle Floating AI Copilot Dock
- `G W` — Open Interactive AI Workspace
- `G M` — Open AI Agent Protocol & MCP Console Modal
- `ESC` — Close active modals and dropdown menus
- Quick toggle for light/dark mode and cyber audio effects in the top bar.

---

## 📜 License

MIT License. Crafted with precision for developers worldwide.
