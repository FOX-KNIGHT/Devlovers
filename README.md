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
- **Testing & Verification**: 73 automated tests across 8 suites (`node:test`), ESLint 10 flat config (`eslint.config.mjs`)
- **Upcoming (Phase 2–5)**: Supabase Auth + RLS, Remote Stateless MCP Server, MCP Apps, Production Hardening

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
npm test         # 73 / 73 tests passing across 8 suites
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
- `ESC` — Close active modals and dropdown menus
- Quick toggle for light/dark mode and cyber audio effects in the top bar.

---

## 📜 License

MIT License. Crafted with precision for developers worldwide.
