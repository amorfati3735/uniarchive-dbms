/**
 * Database seeder.
 *
 * Applies, in order:
 *   1. db/schema.sql  — DDL: creates the database and every (3NF) table
 *   2. db/seed.sql    — DML: inserts the sample data
 *
 * Usage:  npm run seed
 */
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '../../..');
const SCHEMA_FILE = path.join(REPO_ROOT, 'db', 'schema.sql');
const SEED_FILE = path.join(REPO_ROOT, 'db', 'seed.sql');

// The SQL files hard-code `test_uniarchive` (deliberate: the DBMS case study
// documents that schema).  When DB_NAME points somewhere else -- notably the
// test suite, which must not touch the dev database -- rewrite the identifier.
const TARGET_DB = process.env.DB_NAME || 'test_uniarchive';

const runFile = async (conn: mysql.Connection, label: string, file: string) => {
    const raw = await fs.readFile(file, 'utf8');
    const statements = raw.replace(/`test_uniarchive`/g, `\`${TARGET_DB}\``);
    console.log(`[seed] applying ${label} (${path.relative(REPO_ROOT, file)}) -> ${TARGET_DB}...`);
    await conn.query(statements); // multipleStatements is enabled on the connection
};

const seed = async () => {
    // No default database: schema.sql creates and selects it itself.
    const conn = await mysql.createConnection({
        host: process.env.DB_HOST || '127.0.0.1',
        port: Number(process.env.DB_PORT || 3306),
        user: process.env.DB_USER ?? '',
        password: process.env.DB_PASSWORD ?? '',
        multipleStatements: true,
        decimalNumbers: true
    });

    try {
        await runFile(conn, 'schema', SCHEMA_FILE);
        await runFile(conn, 'seed data', SEED_FILE);
        console.log('[seed] Data Imported!');
    } catch (error) {
        console.error('[seed] Failed:', error);
        process.exitCode = 1;
    } finally {
        await conn.end();
    }
};

seed();
