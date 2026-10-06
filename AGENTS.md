# AGENTS.md — UniArchive (DBMS edition)

> **This is a living handoff document.** If you (an AI agent) change the project,
> **update this file in the same session** — especially the *Current status*,
> *Gotchas* and *Changelog* sections — so the next agent can continue without
> re-deriving everything. Keep it accurate; delete stale claims.

Machine-level rules (shell, paths, package managers, hardware) live in the
user's global `~/AGENTS.md`. Read that too. This file is only about this repo.

---

## 1. What this is

A course-resource sharing platform for university students (browse / filter /
search / upload / download study material, comment, analytics). It began as a
hackathon prototype on **MongoDB** and has been ported to a **normalized
relational database (MySQL / MariaDB)** so it can be presented as a DBMS case
study. The relational design is the point of the project now, not just the app.

## 2. Stack & layout

| Layer | Technology |
|-------|------------|
| Frontend | React 19 + Vite + TypeScript, Tailwind CSS v4 (compiled via `@tailwindcss/vite`) |
| Backend | Node + Express 4 + `mysql2` (connection pool) |
| Database | MySQL 8 / MariaDB — 14 relations in 3NF |

```
db/                     DDL + DML (the relational design)
  schema.sql            creates DB + 14 tables, FKs, CHECKs, view
  seed.sql              sample data (set-based SQL for the activity grid)
  README.md             schema reference
server/
  src/config/db.ts      mysql2 pool + query/queryOne/execute/withTransaction
  src/repositories/     ALL SQL lives here (resources, stats, auth)
  src/controllers/      thin request handlers / business rules
  src/routes/           REST routes
  src/seed/seed.ts      applies db/schema.sql then db/seed.sql
  src/middleware/       multer upload filter
  src/utils/            cloudinary, email
  test/                 node:test suites (schema + API)
components/             React UI
  Analytics.tsx         lazily loaded; the only importer of recharts
index.css               Tailwind entry + @theme tokens + runtime palette
services/api.ts         the ONLY place the frontend talks to the API
types.ts                shared frontend types == API contract
docs/case-study.md      the DBMS case study (all 11 required stages)
```

`Resource.id` is a **string** on the wire (matches `types.ts` and the route
param). Keep it that way — the repository casts the integer PK with `String()`.

## 3. Current status

**Done and verified** (see §8 for how to re-verify):

- MongoDB → MySQL port complete. Mongoose models (`server/src/models/`) were
  **deleted** and replaced by `server/src/repositories/`.
- `db/schema.sql` + `db/seed.sql` apply cleanly; 10 resources, 34 topic links,
  3 comments, 2,912 activity rows.
- Backend + frontend both build; `tsc --noEmit` clean.
- **24/24 tests pass** (`server/test/`).
- API contract unchanged, so the React frontend needed no edits.
- Published: **github.com/amorfati3735/uniarchive-dbms** (public).
  `origin` = that repo, `upstream` = the original `amorfati3735/uniarchive`.
- Performance pass done: Tailwind CDN replaced with a compiled v4 build, entry
  bundle code-split (recharts + overlays deferred), mock data removed from the
  bundle, and API responses gzipped. Initial JS+CSS ~198 kB → ~95 kB gzip; the
  first paint fetches only `index.js`, `index.css` and `react.js`.

**Not done / optional** (see §9): dedicated DB user, rendered ER image,
Cloudinary/SMTP/NVIDIA credentials, any deployment.

## 4. Run it

```bash
# --- database ---
cd server && npm install
npm run db:reset          # applies db/schema.sql + db/seed.sql (WIPES the DB)
# or raw:
#   mariadb < db/schema.sql
#   mariadb test_uniarchive < db/seed.sql

# --- backend ---
npm run dev               # http://localhost:5000  (tsx watch)
npm test                  # 24 checks; note: reseeds the DB first (pretest)
npm run build && npm start
npm run typecheck

# --- frontend (repo root) ---
npm install && npm run dev   # Vite, port 3000
```

## 5. Environment specifics

- **Database:** MariaDB on `127.0.0.1:3306`, database **`test_uniarchive`**.
- This name is deliberate: the local MariaDB grants `PUBLIC` privileges only on
  `test` and `test_%` databases, and `root` is `unix_socket`-only (no
  passwordless `sudo`), so the app connects as the **anonymous user** with empty
  `DB_USER` / `DB_PASSWORD`. If you create a real user, update `server/.env`.
- Config: `server/.env` (gitignored) with template `server/.env.example`.
- Node is v26; MariaDB 12.3. `mysql2` pool has `decimalNumbers: true`, so
  `DECIMAL` columns arrive as JS numbers (repositories still `Number()`-cast
  defensively).

## 6. Conventions — follow these

1. **All SQL lives in `server/src/repositories/`.** Controllers call repository
   functions; they never build queries. Keep it that way.
2. **Always use bound parameters** (`?`) — never string-concatenate values.
3. **Multi-table writes go in `withTransaction`** (see `createResource`).
4. **ESM `.js` specifiers.** Internal imports are written as `'./x.js'` even
   though the files are `.ts`. Do not "fix" these to extensionless imports.
5. **`tsx`, not `ts-node`.** `ts-node` cannot resolve the `.js` ESM specifiers
   used across `server/src`; `npm run dev` / `seed` use `tsx`.
6. **The API contract is frozen** to match `types.ts` / `services/api.ts`
   (camelCase fields, `id` not `resource_id`, ISO date strings, `topics` as a
   string array). If you change a response shape you **must** update the
   frontend types and `services/api.ts` in the same change.
7. **Schema changes** go in `db/schema.sql` (and `db/seed.sql`), and the
   repositories/tests must be updated to match.
8. **Never commit `.env`** or real credentials. `.env.example` is tracked and
   must stay placeholder-only.
9. **Tailwind is compiled, not a CDN.** The theme lives in `index.css` under
   `@theme inline`; add new design tokens there, never re-add
   `<script src="https://cdn.tailwindcss.com">`. The runtime palette is the
   `--uni-*` custom properties (`:root` = dark, `[data-theme=light]` = light).
10. **Heavy UI must stay lazy.** `recharts` and the overlays are loaded via
    `React.lazy`; keep new heavy deps out of the entry chunk (add a
    `manualChunks` entry in `vite.config.ts` if needed).
11. Commits keep the original hackathon history; new commits are added on top.
   **Do not backdate commits or fabricate history** — the repo is part of an
   academic submission and commits carry the AI co-author trailer.

## 7. Gotchas / failure modes

- ⚠ **`db/schema.sql` starts with `DROP DATABASE IF EXISTS test_uniarchive`.**
  Running it (or `npm run db:reset`) destroys all data.
- `npm test` runs `pretest` → reseeds. That drops and recreates the DB while a
  running dev server holds a pool; **restart the API after running tests** if
  you hit stale-connection errors.
- Tests use `--test-force-exit` because the mysql pool / undici keep-alive hold
  the event loop open.
- `server/src/app.ts` binds port 5000 **unless `process.env.VERCEL` is set**
  (tests set it to `1` and bind an ephemeral port themselves). Don't reintroduce
  an `argv`-based listen guard.
- Cloudinary, SMTP and the AI endpoint need real keys. With empty keys only the
  **upload, OTP-email and AI-chat** features fail — listing, search, detail,
  comments, counters and stats all work without them (seeded data).
- The `pkill` footgun: `pkill -f "dist/app.js"` matches the shell command that
  contains that string and kills itself. Use `pgrep`/kill by PID, or a bracket
  pattern that the command line doesn't contain.
- The Vite **dev server is on port 3000** (not 5173) and binds `0.0.0.0`.
- If a resource route renders the Discover page instead of the viewer, the API
  is returning numeric ids again — `Resource.id` must be a string.
- `resources.upvotes/downloads/views` are **intentional** denormalized counters
  (documented in `docs/case-study.md`). Don't "normalize" them away without
  updating the case study.

## 8. How to verify a change

```bash
cd server
npm run typecheck                 # must be clean
npm test                          # must stay 24/24 (or more)
npm run build                     # dist/ must compile
npm run dev &                     # then exercise the API:
curl -s localhost:5000/api/health
curl -s "localhost:5000/api/resources?search=k-map"
curl -s localhost:5000/api/stats | head -c 200
curl -s -X POST localhost:5000/api/resources/1/upvote

cd .. && npm run build            # frontend must build
mariadb test_uniarchive -e "SELECT * FROM v_course_overview;"
```

When you change tests, prefer fixing the cause over weakening assertions. Do not
add suppressions to make checks pass.

## 9. Roadmap / optional work

- [ ] Create a dedicated MariaDB user + password instead of the anonymous user.
- [ ] Render the ER/EER diagram to an image (PlantUML / draw.io) for submission.
- [ ] Provide Cloudinary / SMTP / NVIDIA keys and verify upload + OTP + AI flows.
- [ ] Add the architecture note to the user's global `~/AGENTS.md` if desired.
- [ ] Deploy (Vercel config exists in `vercel.json` + `api/index.ts`).
- [ ] Server-side pagination for `/api/resources` (currently returns everything).
- [ ] Self-host the Google Fonts (3 families are still render-blocking).

## 10. Maintenance protocol (for agents)

1. Read this file and `~/AGENTS.md` before starting.
2. After any change: update **§3 Current status**, **§7 Gotchas** if you hit a new
   one, and add an entry to **§11 Changelog**.
3. Keep the file short enough to scan — link out to `docs/case-study.md` and
   `db/README.md` rather than duplicating them.
4. If something here is no longer true, **delete it**; a stale handoff doc is
   worse than none.

## 11. Changelog

| Date | Change |
|------|--------|
| 2026-10-06 | Initial `AGENTS.md`. Recorded the MongoDB → MySQL port, 3NF schema (14 relations), repository layer, 24-test suite, docs, and publication to `amorfati3735/uniarchive-dbms`. |
| 2026-10-06 | Performance pass: Tailwind v4 compiled build (CDN removed), code splitting (`Analytics`/overlays lazy, `manualChunks`), mock data dropped from the client, API gzip, native PDF viewer. Fixed `Resource.id` to be a string (was breaking `/resource/:id`). |
