# Database

Relational implementation of UniArchive — MySQL 8 / MariaDB 10.4+, Third
Normal Form.

## Files

| File | Purpose |
|------|---------|
| `schema.sql` | DDL — drops/creates `test_uniarchive` and all 14 tables, keys, constraints and one view |
| `seed.sql` | DML — inserts the sample data and prints a row-count summary |

## Apply

```bash
# 1. structure
mariadb < db/schema.sql

# 2. data
mariadb test_uniarchive < db/seed.sql
```

Both steps at once, from the backend:

```bash
cd server && npm run db:reset
```

> `schema.sql` starts with `DROP DATABASE IF EXISTS test_uniarchive`, so it is
> safe to re-run — but it **wipes existing data**.

## Connection settings

The backend reads these environment variables (see `server/.env.example`):

```
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=...
DB_PASSWORD=...
DB_NAME=test_uniarchive
```

## Tables

| Table | Role | Key |
|-------|------|-----|
| `users` | students / admins who author resources and comments | PK `user_id` |
| `courses` | course catalogue (`course_code` → `course_name`) | PK `course_id`, UQ `course_code` |
| `slots` | teaching slots (B1, G2, …) | PK `slot_id`, UQ `slot_code` |
| `resource_types` | Notes, Question Bank, Cheatsheet, Lab Report, Solution | PK `type_id`, UQ `type_name` |
| `topics` | atomic topic tags | PK `topic_id`, UQ `topic_name` |
| `professors` | professor names | PK `professor_id` |
| `semesters` | (term, year) pairs | PK `semester_id`, UQ `(semester_name, year)` |
| `resources` | the shared file itself | PK `resource_id`, 6 FKs |
| `resource_topics` | M:N resource ↔ topic | PK `(resource_id, topic_id)` |
| `comments` | discussion on a resource | PK `comment_id`, FKs → resource, user |
| `course_stats` | maintained per-course aggregates | PK `course_id` |
| `course_topic_coverage` | per-course topic coverage % | PK `(course_id, topic_id)` |
| `course_activity` | daily activity intensity for the heatmap | PK `(course_id, activity_date)` |
| `otp_requests` | one live login OTP per email | PK `email` |

A convenience view, `v_course_overview`, joins `courses` and `resources` to
expose per-course resource counts and average quality.

## Verify

```bash
mariadb test_uniarchive -e "SELECT * FROM v_course_overview;"
```

See `docs/case-study.md` for the ER model and normalization rationale.
