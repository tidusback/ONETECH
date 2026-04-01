# Trivelox Service Network Platform

A full-scale B2B web platform for **Trivelox Trading Inc.** that integrates a public company website, customer portal, rule-based after-sales diagnosis system, spare parts ordering, technician affiliate network, and admin control panel.

Designed to be **simple for non-tech-savvy users** while remaining **scalable, secure, and business-driven**.

---

## Core Objectives

- Provide seamless after-sales support
- Increase spare parts sales
- Build a technician network as a distribution channel
- Capture and retain customer data
- Create a trusted ecosystem for services and products

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16.0 (App Router, Turbopack) |
| Language | TypeScript 5.9 |
| UI | shadcn/ui + Tailwind CSS 3.4 |
| Forms | React Hook Form + Zod |
| Database | PostgreSQL via Supabase |
| Auth | Supabase Auth (Email/Password, Google, Facebook OAuth) |
| Storage | Supabase Storage |
| Font | Geist (Sans + Mono) |
| Hosting | Vercel |

---

## Getting Started

### Prerequisites

- Node.js 20+
- A [Supabase](https://supabase.com) project

### Setup

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.local.example .env.local
# Fill in your Supabase URL, anon key, and service role key

# Apply database migrations via Supabase CLI or dashboard
# See supabase/migrations/ for all migration files

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Environment Variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key   # server-only, never expose to client

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Scripts

```bash
npm run dev        # Development server (Turbopack)
npm run build      # Production build
npm run start      # Production server
npm run lint       # ESLint
npm run typecheck  # TypeScript type checking
```

---

## Project Structure

```
app/
├── (public)/              # Marketing pages (home, about, products, services, parts, contact)
├── (auth)/                # Login, signup, password reset
├── (dashboard)/           # Protected routes (role-based)
│   ├── admin/             # Admin panel — 13+ management sections
│   ├── technician/        # Technician dashboard (leads, jobs, points, rewards)
│   ├── my-machines/       # Customer machine registry
│   ├── diagnosis-history/ # Past diagnosis sessions
│   ├── support-tickets/   # Support ticket management
│   ├── orders/            # Order tracking
│   └── custom-requests/   # Custom part requests
├── (onboarding)/          # Role-based onboarding flows
└── api/auth/callback/     # OAuth callback handler

components/
├── ui/                    # shadcn/ui primitives
├── layout/                # Navbar, sidebar, footer
├── auth/                  # OAuth buttons
├── marketing/             # Landing page sections
├── machines/              # Machine form & management
├── parts/                 # Parts catalog display
├── support/               # Support flow wizard
├── admin/                 # Admin-specific controls
├── technician/            # Technician dashboard components
├── onboarding/            # Multi-step onboarding forms
└── shared/                # Reusable banners, empty/loading/error states

lib/
├── auth/                  # Guards, actions, session utilities
├── supabase/              # Server & browser Supabase client setup
├── diagnosis/             # Rule-based diagnosis engine (engine, types, repo, storage, actions)
├── technician/            # Technician queries & actions
├── admin/                 # Admin queries & actions
├── orders/                # Order system queries & actions
├── validations/           # Zod schemas (auth, machine, onboarding)
├── parts-catalog.ts       # Parts data, categories, machine-type mapping
└── support-flow.ts        # Support categories & guided flow logic

supabase/migrations/       # 7 SQL migration files
types/                     # database.types.ts (auto-generated), domain types
hooks/                     # Custom React hooks
```

---

## System Modules

### 1. Public Website

- Homepage, About, Products, Services, Contact, Privacy, Terms
- Parts catalog with detail pages (`/parts/[slug]`)
- Self-service diagnosis entry point
- Technician program recruitment page

### 2. Authentication & Onboarding

- Email/password and OAuth (Google, Facebook) via Supabase Auth
- Role-based onboarding flows (customer vs. technician)
- Auth guards: `requireAuth()`, `requireRole()`, `requireOnboardingComplete()`, `redirectIfAuthenticated()`
- Profile completion banner for incomplete onboarding

### 3. After-Sales Diagnosis System

A rule-based engine (`lib/diagnosis/`) with pure functional design — no I/O in the engine core.

**Diagnosis flow:**
1. Select machine
2. Select issue category (Power, Noise, Heat, Leak, Vibration, Performance, Error Code, Other)
3. Answer guided multi-choice questions
4. Receive diagnosis with confidence score
5. Choose action: order part / request technician / open support ticket

**Engine details:**
- Confidence scoring (0.0–1.0); escalates to support if below 0.6
- Catch-all rules at 0.5 confidence as fallback
- JSONB condition matching stored in Supabase
- Persistent sessions — all answers saved for audit trail
- Recommended parts output per diagnosis outcome

### 4. Customer Dashboard

- Machine registry (nickname, model, serial, warranty tracking, service history)
- Diagnosis session history with outcomes and recommended parts
- Support ticket creation and tracking
- Parts order tracking with status timeline
- Custom part requests with line-item tracking
- Profile and settings management

### 5. Technician Network

Full lifecycle: **application → lead → job → points → rewards**

**Applications**
- Multi-step form: personal info, location, experience, skills, document uploads (ID, qualifications)
- Admin review and approval workflow

**Affiliation Levels (3 tiers)**
1. Affiliate Technician
2. Certified Technician
3. Certified Partner

Progression is criteria-based (minimum jobs, points balance, days at level) with admin approval. Manual admin override also available.

**Lead Management**
- Location-based routing; Certified Partners receive priority
- Lead lifecycle: offered → accepted / declined / expired
- Configurable lead expiration per lead

**Job Tracking**
- Status progression: assigned → en_route → on_site → completed / cancelled
- Completion notes and actual fault capture
- Full audit log — all state changes recorded with actor + timestamp

**Points & Rewards**
- Points earned per completed job; states: pending → released / voided
- Reward catalog: vouchers, tools, merchandise, cash equivalents
- Redemption workflow: pending → fulfilled / cancelled

### 6. Admin Panel

| Section | Scope |
|---------|-------|
| Customers | Profiles and machine registry |
| Technicians | Applications, affiliation levels, performance |
| Leads | Create, manage, assign leads |
| Jobs | Status override, bonus points, audit log |
| Part Requests | Review, quote, process custom requests |
| Orders | Order fulfillment management |
| Parts & Products | Catalog editor |
| Support Tickets | Triage and resolution |
| Diagnosis Rules | Configure categories, questions, outcomes, recommended parts |
| Points System | Award, release, void points |
| Rewards | Catalog management and redemption tracking |
| Risk Monitoring | Technician risk scoring and suspicious behavior detection |
| Reviews | Customer ratings management |

### 7. Parts & Orders

**6 part categories:** Drive & Motion, Pneumatics & Hydraulics, Electrical & Controls, Wear & Consumables, Structural & Mechanical, Packaging-specific

**8 machine type mappings:** CNC, Press, Welding, Compressor, Pump, Generator, Handling, HVAC

---

## Database

PostgreSQL via Supabase with Row-Level Security (RLS) enforced on all sensitive tables.

**Migrations** (`supabase/migrations/`):

| File | Scope |
|------|-------|
| `20260327000000_diagnosis_engine.sql` | Diagnosis tables, outcomes, parts |
| `20260328000000_part_requests.sql` | Part request workflow |
| `20260329000000_technician_applications.sql` | Technician onboarding |
| `20260329100000_technician_dashboard.sql` | Leads, jobs, assignments |
| `20260330000000_job_tracking.sql` | Job lifecycle + audit trail |
| `20260330200000_points_lifecycle.sql` | Points, rewards, redemptions |
| `20260331000000_affiliation_levels.sql` | Tier progression system |

**Key tables:** `profiles`, `issue_categories`, `diagnosis_questions`, `diagnosis_options`, `diagnosis_outcomes`, `diagnosis_sessions`, `diagnosis_answers`, `parts`, `outcome_parts`, `technician_applications`, `technician_leads`, `technician_jobs`, `technician_lead_assignments`, `technician_job_logs`, `technician_points`, `technician_rewards`, `technician_reward_redemptions`, `technician_level_criteria`, `technician_level_requests`, `part_requests`, `part_request_items`

---

## Security

- **RLS policies** enforce data access at the database layer
- **Server-only service role key** for sensitive operations (never exposed to client)
- **Job logging** captures all state changes with actor + timestamp
- **Risk monitoring** module for technician behavior tracking
- **Anti-bypass measures** — jobs must be logged in system to earn points; commissions tied to documented activity; CRM data owned by Trivelox

---

## UX Principles

- One action per screen
- Large buttons, minimal typing
- Guided flow for non-technical users
- Mobile-first design
- Fallback to human support at every step

---

## Development Phases

| Phase | Status | Scope |
|-------|--------|-------|
| 1 — Foundation | Complete | Public website, auth, customer dashboard, diagnosis, support, parts catalog |
| 2 — Technician System | In Progress | Onboarding, lead routing, job tracking, points system |
| 3 — Partner System | Planned | Certification levels, rewards, territory priority |
| 4 — Expansion | Future | Distribution centers, inventory, advanced logistics |

---

## Future Enhancements

- AI-assisted diagnosis
- Live technician chat
- WhatsApp integration
- QR code machine registration
- Inventory synchronization
- Advanced analytics dashboard

---

## Final Vision

This is not just a website. It is a:

- **Support engine** — guided diagnosis and ticket resolution
- **Sales engine** — parts catalog and ordering
- **Technician network** — recruitment, leads, jobs, and rewards
- **Distribution system** — territory routing and partner tiers
- **Customer retention platform** — machine registry, history, and loyalty

**Goal:** Make Trivelox the central hub of its industry ecosystem.

---

## License

Private — Trivelox Trading Inc.
