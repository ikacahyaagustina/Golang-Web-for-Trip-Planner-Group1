const fs = require('fs');
const path = require('path');
const { pool, query } = require('./db');

async function initDb() {
  const schemaPath = path.join(__dirname, 'schema.sql');
  const schemaSql = fs.readFileSync(schemaPath, 'utf8');

  await query(schemaSql);
  console.log('Database schema initialized successfully.');
}

initDb()
  .catch((error) => {
    console.error('Failed to initialize database schema.');
    console.error(error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await pool.end();
  });
