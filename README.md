# ClimateSmart Hub — Climate-Smart Property Intelligence

A single-page React + TypeScript application that calculates **risk-adjusted
property metrics** using simulated [PropEco](https://propeco.io) climate
parameters, then feeds a mortgage lead-generation funnel that hands qualified
contacts to FCA-regulated brokers.

## Overview

The app is a three-step, state-driven flow rendered inside a global layout
(sticky header + compliance footer):

| Step | View                 | Purpose                                                   |
| ---- | -------------------- | --------------------------------------------------------- |
| 1    | `LandingSearch`      | Multi-audience property input (investor vs. homeowner).   |
| 2    | `DashboardView`      | Dual math engines + dark-themed lead-capture gate.        |
| 3    | `SuccessScreen`      | White-label PDF delivery confirmation.                    |

All cross-cutting state (`step`, `calcMode`, `financials`, `modalType`) lives in
`App.tsx` and is threaded down into the step views.

## The two math engines

Simulated PropEco constants live in `src/types.ts`:

- **EPC retrofit liability:** `£7,500` one-off, added to upfront capital.
- **Flood premium surcharge:** `£85` / month, loaded onto expenses.

**Investor engine** (`computeInvestorMetrics`)

- Traditional gross yield = annual rent ÷ purchase price.
- Climate-smart yield = annual rent ÷ (price + EPC retrofit liability).
- True net monthly cash flow = rent − mortgage − flood premium.

**Homeowner engine** (`computeHomeownerMetrics`)

- Standard monthly outgoings = mortgage + utility bills.
- True monthly cost = standard outgoings + amortised EPC upgrade + flood premium.

## Tech stack

- [Vite](https://vitejs.dev/) + [React 18](https://react.dev/) + TypeScript
- [Tailwind CSS v4](https://tailwindcss.com/) (via `@tailwindcss/vite`)
- [Supabase JS](https://supabase.com/docs/reference/javascript) for lead storage

## Getting started

```bash
npm install
cp .env.example .env   # optional — omit to run in simulated-lead mode
npm run dev
```

Then open the printed local URL.

### Supabase configuration

Set the following in `.env` to enable live inserts into the `mortgage_leads`
table (otherwise submissions are simulated and logged to the console):

```
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```

Suggested table schema:

```sql
create table public.mortgage_leads (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null,
  email text not null,
  phone text not null,
  postcode text,
  house_number text,
  calc_mode text check (calc_mode in ('investor', 'homeowner')),
  price numeric,
  deposit numeric,
  rent numeric,
  bills numeric,
  broker_consent boolean not null default false,
  source text
);
```

## Scripts

| Command             | Description                          |
| ------------------- | ------------------------------------ |
| `npm run dev`       | Start the Vite dev server.           |
| `npm run build`     | Type-check and build for production.  |
| `npm run preview`   | Preview the production build.         |
| `npm run typecheck` | Run the TypeScript compiler only.    |

## Compliance

ClimateSmart Hub is a **software service** — not an FCA-regulated financial
advisory firm, broker or lender. All figures are illustrative estimates from
simulated PropEco parameters. Personal data is stored under UK GDPR, purged
automatically after 90 days, and shared with regulated brokers only with
explicit consent (see the in-app Privacy Policy and Terms of Service).
