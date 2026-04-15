const { pool, testConnection } = require('./db');

async function run() {
  try {
    const currentTime = await testConnection();
    console.log('Database connected successfully.');
    console.log('Server time:', currentTime);
  } catch (error) {
    console.error('Database connection failed.');
    console.error(error.message);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

run();
