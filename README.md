# UniArchive

A course-resource sharing platform for university students: browse, filter and
read study material (notes, question banks, cheatsheets, lab reports and
solutions) per course and slot, upload your own files, discuss them in
comments, and view coverage analytics.

Originally built as a hackathon prototype on MongoDB; **this version runs on a
normalized relational database (MySQL / MariaDB)** and is documented as a DBMS
case study.

## Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 19 + Vite + TypeScript + Tailwind CSS v4 (compiled at build) |
| Backend | Node.js + Express, `mysql2` connection pool |
| Database | MySQL 8 / MariaDB — 14 tables in Third Normal Form |
| File storage | Cloudinary (optional; needed only for uploads) |
| Email / AI | Nodemailer (OTP) and an OpenAI-compatible LLM endpoint (optional) |

## Quickstart

### 1. Database

Create the schema and load the sample data:

```bash
mariadb < db/schema.sql
mariadb test_uniarchive < db/seed.sql
```

Or, equivalently, through the backend (does both steps):

```bash
cd server && npm install && npm run db:reset
```

### 2. Backend

```bash
cd server
cp .env.example .env     # set DB_USER / DB_PASSWORD etc.
npm run dev              # http://localhost:5000
```

### 3. Frontend

```bash
npm install
npm run dev              # http://localhost:3000
```

The frontend talks to `http://localhost:5000/api` automatically when served
from localhost.

## Performance

The front end was rebuilt for load speed:

| Metric | Before | After |
|--------|--------|-------|
| Initial JS + CSS (gzip) | ~198 kB | **~95 kB** |
| CSS engine | Tailwind CDN script (~120 kB) + in-browser JIT on every load | compiled to a 7 kB gzip stylesheet at build time |
| Chart library | bundled into the entry chunk (parsed on first paint) | deferred — `recharts` (~102 kB gzip) loads only when Analytics opens |
| Overlays (upload / search / login / viewer) | in the entry chunk | lazy chunks, fetched on demand |
| API responses | uncompressed | gzip via the `compression` middleware |

The first paint fetches only `index.js`, `index.css` and `react.js`; this is
verified against Vite's build output and a Chrome network log.

## Tests

```bash
cd server && npm test
```

Runs 29 checks: schema/constraint/normalization validation, HTTP integration
tests against every endpoint, and the OTP/auth repository. `npm test` reseeds
the database first.

The frontend always calls the API on a relative `/api` path — Vite proxies it
to the backend during development (`vite.config.ts`), so the app works on
`localhost` and on a LAN address alike.

## Project structure

```
db/
  schema.sql            DDL — database + 14 normalized tables
  seed.sql              DML — sample data
server/
  src/config/db.ts      mysql2 pool + transaction helper
  src/repositories/     SQL data access (resources, stats, auth)
  src/controllers/      request handlers / business logic
  src/routes/           REST routes
  test/                 node:test suites
components/             React UI
services/api.ts         frontend API client
docs/case-study.md      the DBMS case study (ER → normalization → testing)
```

## Documentation

- **[docs/case-study.md](docs/case-study.md)** — problem statement, ER/EER
  design, relational mapping, 1NF→3NF normalization, DDL/DML, testing.
- **[db/README.md](db/README.md)** — database setup and schema reference.
