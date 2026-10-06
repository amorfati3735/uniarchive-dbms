import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Single connection pool for the whole process.
 *
 * Connection settings come from the environment so that no credentials are
 * hard-coded (see server/.env.example).  Defaults target the local MariaDB
 * instance and the `test_uniarchive` database created by db/schema.sql.
 */
const pool = mysql.createPool({
    host: process.env.DB_HOST || '127.0.0.1',
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER ?? '',
    password: process.env.DB_PASSWORD ?? '',
    database: process.env.DB_NAME || 'test_uniarchive',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    decimalNumbers: true,   // return DECIMAL columns as JS numbers, not strings
    timezone: 'Z',
    charset: 'utf8mb4_unicode_ci'
});

/** Run a query and return all rows. */
export const query = async <T = any>(sql: string, params: any[] = []): Promise<T[]> => {
    const [rows] = await pool.query(sql, params);
    return rows as T[];
};

/** Run a query and return the first row (or null). */
export const queryOne = async <T = any>(sql: string, params: any[] = []): Promise<T | null> => {
    const rows = await query<T>(sql, params);
    return rows.length ? rows[0] : null;
};

/** Run a query and return the ResultSetHeader (INSERT/UPDATE/DELETE metadata). */
export const execute = async (sql: string, params: any[] = []): Promise<mysql.ResultSetHeader> => {
    const [result] = await pool.query(sql, params);
    return result as mysql.ResultSetHeader;
};

/**
 * Run `fn` inside a single transaction.  Commits on success, rolls back on any
 * thrown error, and always releases the connection back to the pool.
 */
export const withTransaction = async <T>(
    fn: (conn: mysql.PoolConnection) => Promise<T>
): Promise<T> => {
    const conn = await pool.getConnection();
    try {
        await conn.beginTransaction();
        const result = await fn(conn);
        await conn.commit();
        return result;
    } catch (error) {
        await conn.rollback();
        throw error;
    } finally {
        conn.release();
    }
};

/**
 * Verify connectivity once and memoize the result.  The per-request middleware
 * calls this on every request, so we must not re-ping the server each time.
 */
let connected: Promise<typeof pool> | null = null;

export const connectDB = async () => {
    if (connected) return connected;

    connected = (async () => {
        const conn = await pool.getConnection();
        try {
            await conn.ping();
            const [rows] = await conn.query('SELECT DATABASE() AS db');
            const db = (rows as any[])[0]?.db;
            console.log(`MySQL Connected: ${process.env.DB_HOST || '127.0.0.1'}/${db}`);
        } finally {
            conn.release();
        }
        return pool;
    })();

    try {
        return await connected;
    } catch (error) {
        connected = null; // allow a later retry
        throw error;
    }
};

export default pool;
