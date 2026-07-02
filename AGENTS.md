# AGENTS.md

## Cursor Cloud specific instructions

ClimateSmart Hub is a single-page **Vite + React 18 + TypeScript** app (Tailwind
CSS v4) with an optional Supabase backend for lead storage. There is only one
service.

- **Run (dev):** `npm run dev` → serves at `http://localhost:5173/`. Standard
  scripts (`dev`, `build`, `preview`, `typecheck`) are documented in `README.md`
  / `package.json`.
- **Supabase is optional.** With no `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY`
  in `.env`, lead submissions run in **simulated mode**: `submitLead` in
  `src/lib/leads.ts` resolves as a fake success and logs the row to the browser
  console (`[ClimateSmart] Simulated lead insert:`). This means the full
  three-step flow (search → dashboard → success) works end-to-end with no
  external services, which is the default in this environment.
- **`npm run lint` does not work as-is.** The `lint` script runs `eslint .`, but
  `eslint` is not in `devDependencies` and there is no ESLint config file, so it
  fails with `eslint: not found`. Use `npm run typecheck` (`tsc -b --noEmit`) for
  static checking instead.
- Vite reads `VITE_`-prefixed env vars only at server start; restart `npm run dev`
  after editing `.env`.
