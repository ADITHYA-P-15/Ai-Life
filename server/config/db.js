/**
 * db.js — PostgreSQL connection pool using the `pg` driver.
 * 
 * Exports a single pool instance that all routes share.
 * Uses DATABASE_URL from environment variables.
 */

import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Log connection status on first query
pool.on('connect', () => {
  console.log('📡 Connected to PostgreSQL');
});

pool.on('error', (err) => {
  console.error('❌ Unexpected PostgreSQL error:', err);
  process.exit(-1);
});

/**
 * Execute a parameterized query.
 * @param {string} text - SQL query with $1, $2, ... placeholders
 * @param {any[]} params - Parameter values
 * @returns {Promise<pg.QueryResult>}
 */
export function query(text, params) {
  return pool.query(text, params);
}

export default pool;
