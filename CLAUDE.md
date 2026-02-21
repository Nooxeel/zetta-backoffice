# Zetta Reports Backoffice

## Purpose & Boundaries

**What this service does:**
- Multi-language reporting dashboard that consumes the Zetta Reports Backend API
- Generates world-class reports with interactive tables, charts, and data visualization
- Provides database exploration, connectivity monitoring, and settings management
- Serves as the primary UI for business intelligence and operational reporting

**What this service does NOT do:**
- Does not connect to databases directly — all data comes from the backend API (`../backendZetta`)
- Does not implement business logic for data processing — that lives in the backend
- Does not handle authentication flows yet (Auth0 planned, currently simulated)

**Relationship with backend:**
- Backend runs on `http://localhost:3001` (configurable via `NEXT_PUBLIC_API_URL`)
- All data fetching goes through backend REST endpoints under `/api/*`
- Backend manages database connections; backoffice only displays the results

---

## Repo Map

```
backoffice/
├── .claude/agents/
│   └── agent-tech-lead.md          # Next.js architecture agent
├── .github/workflows/
│   └── all-in-one.yaml             # CI/CD: build + Docker publish
├── mcp-conf/                       # MCP server configs (Auth0, Sentry, shadcn, Next.js)
├── public/                         # Static SVG assets
├── src/
│   ├── app/
│   │   ├── globals.css             # Tailwind v4 + OKLCH CSS variables
│   │   ├── layout.tsx              # Root layout (IBM Plex fonts, ThemeProvider)
│   │   ├── page.tsx                # Root redirect → /sign-in
│   │   ├── (auth)/
│   │   │   ├── layout.tsx          # Centered auth container
│   │   │   └── sign-in/page.tsx    # Login form (simulated auth)
│   │   └── (dashboard)/
│   │       ├── layout.tsx          # Sidebar + header + breadcrumbs
│   │       └── dashboard/page.tsx  # KPI cards (placeholder)
│   └── modules/
│       └── shared/
│           ├── components/
│           │   ├── app-sidebar.tsx  # Navigation sidebar (Dashboard, Reports, Databases, Settings)
│           │   ├── theme-*.tsx     # Dark/light/system theme components
│           │   └── ui/             # shadcn/ui component library (25+ components)
│           │       ├── data-table.tsx              # TanStack Table wrapper
│           │       ├── data-table-column-header.tsx
│           │       ├── data-table-pagination.tsx
│           │       ├── data-table-toolbar.tsx
│           │       ├── data-table-view-options.tsx
│           │       └── ...         # button, card, dialog, form, input, table, etc.
│           ├── hooks/
│           │   └── use-mobile.ts   # Mobile breakpoint detection
│           └── lib/
│               └── utils.ts        # cn() utility (clsx + tailwind-merge)
├── components.json                 # shadcn/ui configuration (New York style)
├── Dockerfile                      # Multi-stage Docker build (Node 22 Alpine, port 8080)
├── next.config.ts                  # output: "standalone"
├── package.json                    # zetta-reports v0.1.0
└── tsconfig.json                   # Strict mode, @/* and @/src/* aliases
```

---

## Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | Next.js (App Router) | 16.0.1 |
| UI Runtime | React | 19.2.0 |
| Language | TypeScript | 5.x |
| Styling | Tailwind CSS v4 | 4.x |
| Components | shadcn/ui (New York) + Radix UI | — |
| Data Tables | TanStack React Table | 8.x |
| Forms | React Hook Form + Zod | 7.x / 4.x |
| Theme | next-themes | 0.4.x |
| Icons | Lucide React | 0.553.x |
| Toasts | Sonner | 2.x |
| Dates | date-fns + react-day-picker | 4.x / 9.x |
| Package manager | pnpm | — |
| Deployment | Docker (standalone) + GitHub Actions | — |

---

## Golden Commands

```bash
# Development
pnpm dev             # Start dev server (Next.js, port 3000)
pnpm build           # Production build
pnpm start           # Start production server
pnpm lint            # ESLint check

# Dependencies
pnpm add <pkg>       # Add production dependency
pnpm add -D <pkg>    # Add dev dependency

# shadcn/ui
pnpm dlx shadcn@latest add <component>  # Add new shadcn component
```

---

## Architectural Conventions

### Module Structure

```
src/modules/{module-name}/
├── components/          # Module-specific React components
├── hooks/               # Module-specific hooks
├── lib/                 # Module-specific utilities
├── types/               # Module-specific types
└── services/            # API client functions for this module
```

Currently only `shared` module exists. Create domain modules (e.g., `reports`, `databases`) as features are built.

### Component Conventions

- **Server Components by default** — only add `'use client'` when interactivity is needed
- **shadcn/ui as the component primitive** — always use existing UI components from `src/modules/shared/components/ui/`
- **Tailwind CSS v4** — utility-first styling with OKLCH color variables in `globals.css`
- **IBM Plex Sans / Mono** — project typography loaded via `next/font/google`

### Data Fetching Pattern (to implement)

```ts
// Server Component — preferred for initial data
async function ReportsPage() {
  const data = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/reports/tables?db=esaabbionet`)
  const tables = await data.json()
  return <DataTable data={tables} columns={columns} />
}

// Client Component — for interactive filtering/real-time
'use client'
function ReportFilters() {
  const [data, setData] = useState(null)
  // fetch on user interaction
}
```

### DataTable Usage

The project includes a complete DataTable system built on TanStack Table:
- `data-table.tsx` — main table component
- `data-table-column-header.tsx` — sortable column headers
- `data-table-pagination.tsx` — pagination controls
- `data-table-toolbar.tsx` — filtering and search toolbar
- `data-table-view-options.tsx` — column visibility toggles

Use these for **all tabular report data**.

---

## Page & Routing Structure

App Router with route groups:

| Route | Status | Description |
|-------|--------|-------------|
| `/` | Done | Redirects to `/sign-in` |
| `/sign-in` | Scaffold | Login form (simulated — needs Auth0) |
| `/dashboard` | Scaffold | KPI cards (placeholder data) |
| `/dashboard/reports` | TODO | Report listing, generation, and export |
| `/dashboard/databases` | TODO | DB connectivity status, table exploration |
| `/dashboard/settings` | TODO | User/app settings |

**Layout hierarchy:**
1. `app/layout.tsx` — fonts + ThemeProvider
2. `app/(auth)/layout.tsx` — centered container for auth pages
3. `app/(dashboard)/layout.tsx` — SidebarProvider + AppSidebar + header + breadcrumbs

---

## State & Data Patterns

- **Theme:** `next-themes` with `ThemeProvider` in root layout (dark/light/system)
- **Forms:** React Hook Form + Zod resolvers for validation
- **Server state:** Not yet implemented — use Server Components + `fetch` for backend API calls
- **Client state:** React `useState`/`useReducer` for local UI state; no global state library installed
- **Toasts:** Sonner via `<Toaster />` in root layout

---

## Performance & Accessibility

### Performance
- **Standalone output** for optimized Docker deployments
- **Server Components** for initial data loads — minimize client-side JavaScript
- **Streaming + Suspense** for progressive rendering of report data
- **Dynamic imports** for heavy report/chart components
- **next/image** for optimized image loading

### Accessibility
- **shadcn/ui + Radix** provide accessible primitives out of the box (keyboard nav, ARIA, focus management)
- **Semantic HTML** — use proper heading hierarchy, landmarks, and form labels
- **Color contrast** — OKLCH variables designed for WCAG AA compliance
- **Reduced motion** — respect `prefers-reduced-motion` for animations

---

## Git & Delivery Conventions

- **Branch naming:** `feat/{feature-name}`, `fix/{bug-name}`, `hotfix/{issue}`
- **Commit messages:** Conventional Commits (`feat:`, `fix:`, `refactor:`, `docs:`, `chore:`)
- **CI/CD:** GitHub Actions builds on all branches; Docker image published on `release/test` and `main`
- **Never commit** `.env*` files
- **Version:** in `package.json` — patch for fixes, minor for features

---

## Subagent Orchestration

| Intent | Agent | Output |
|--------|-------|--------|
| Next.js architecture & performance | `agent-tech-lead` | Architectural guidance, caching strategies, code review |

---

## When to Ask Humans

- **New report type** — confirm data requirements, visualization preferences, export formats
- **Authentication integration** — Auth0 configuration and flow decisions
- **Backend API changes** — coordinate with backend team for new endpoints
- **Design/UX decisions** — layout, color schemes, report presentation
- **Deployment configuration** — Docker, CI/CD, environment variables
- **Charting library selection** — no charting library installed yet; confirm choice before adding
