/**
 * db.js — PostgreSQL connection pool using the `pg` driver.
 * 
 * Serverless-friendly: no eager connection test.
 * SSL enabled for Neon/cloud PostgreSQL.
 */

import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes('sslmode=require')
    ? { rejectUnauthorized: false }
    : false,
  max: 5,                // Limit pool size for serverless
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

pool.on('error', (err) => {
  console.error('Unexpected PostgreSQL pool error:', err);
});

/**
 * Execute a parameterized query.
 */
export function query(text, params) {
  return pool.query(text, params);
}

export default pool;