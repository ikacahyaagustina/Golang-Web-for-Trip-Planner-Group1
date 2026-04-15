const dotenv = require('dotenv');
const { pool, query } = require('./db');

dotenv.config();

async function checkTables() {
  const connectionInfoSql = `
    SELECT
      current_database() AS db,
      current_user AS db_user,
      inet_server_addr()::text AS host,
      inet_server_port() AS port
  `;

  const connectionInfo = await query(connectionInfoSql);
  console.log('Connected to:', connectionInfo.rows[0]);

  const requiredTables = [
    'users',
    'destinations',
    'itinerary',
    'itinerary_details',
    'reviews',
  ];

  const sql = `
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name = ANY($1::text[])
    ORDER BY table_name ASC
  `;

  const result = await query(sql, [requiredTables]);
  const foundTables = result.rows.map((item) => item.table_name);
  const missingTables = requiredTables.filter((name) => !foundTables.includes(name));

  console.log('Found tables:', foundTables.join(', ') || '(none)');

  if (missingTables.length > 0) {
    console.log('Missing tables:', missingTables.join(', '));
    process.exitCode = 1;
    return;
  }

  console.log('All required tables are present.');
}

checkTables()
  .catch((error) => {
    console.error('Failed to check database tables.');
    console.error(error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await pool.end();
  });