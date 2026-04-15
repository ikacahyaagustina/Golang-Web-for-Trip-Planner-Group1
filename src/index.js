const dotenv = require('dotenv');
const app = require('./app');
const { pool, testConnection } = require('./config/db');

dotenv.config();

const PORT = Number(process.env.PORT || 3000);

async function bootstrap() {
  try {
    await testConnection();
    console.log('Database connected successfully.');

    const server = app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });

    const shutdown = async (signal) => {
      console.log(`${signal} received. Closing server...`);

      server.close(async () => {
        await pool.end();
        process.exit(0);
      });
    };

    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));
  } catch (error) {
    console.error('Failed to start application.');
    console.error(error.message);
    process.exit(1);
  }
}

bootstrap();
