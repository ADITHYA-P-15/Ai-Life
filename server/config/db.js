/**
 * db.js — PostgreSQL connection pool using the `pg` driver.
 */

import pg from "pg";
const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

// Test connection once on startup
(async () => {
  try {
    const client = await pool.connect();
    console.log("✅ Connected to Neon successfully");
    client.release();
  } catch (err) {
    console.error("❌ Failed to connect to PostgreSQL");
    console.error(err);
  }
})();

// Log whenever a new client connects
pool.on("connect", () => {
  console.log("📡 Connected to PostgreSQL");
});

// Handle unexpected errors
pool.on("error", (err) => {
  console.error("❌ Unexpected PostgreSQL error:", err);
});

export function query(text, params) {
  return pool.query(text, params);
}

export default pool;