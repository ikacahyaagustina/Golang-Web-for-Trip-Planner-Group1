const { Pool } = require('pg');
const dotenv = require('dotenv');

dotenv.config();

const dbPassword =
  typeof process.env.DB_PASSWORD === 'string'
    ? process.env.DB_PASSWORD
    : String(process.env.DB_PASSWORD ?? '');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 5432),
  user: process.env.DB_USER || 'postgres',
  password: dbPassword,
  database: process.env.DB_NAME || 'trip_planner',
});

async function query(text, params = []) {
  return pool.query(text, params);
}

async function testConnection() {
  const client = await pool.connect();

  try {
    const result = await client.query('SELECT NOW() AS current_time');
    return result.rows[0].current_time;
  } finally {
    client.release();
  }
}

module.exports = {
  pool,
  query,
  testConnection,
};
