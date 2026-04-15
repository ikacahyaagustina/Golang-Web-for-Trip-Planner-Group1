const bcrypt = require('bcryptjs');
const { pool, query } = require('./db');

async function ensureSchemaInitialized() {
  const sql = `
    SELECT
      to_regclass('public.users') AS users_table,
      to_regclass('public.destinations') AS destinations_table
  `;

  const result = await query(sql);
  const { users_table: usersTable, destinations_table: destinationsTable } = result.rows[0] || {};

  if (!usersTable || !destinationsTable) {
    throw new Error('Database schema not initialized. Run "npm run db:init" first.');
  }
}

async function seedAdminUser() {
  const adminName = process.env.SEED_ADMIN_NAME || 'Admin';
  const adminEmail = process.env.SEED_ADMIN_EMAIL || 'admin@example.com';
  const adminPassword = process.env.SEED_ADMIN_PASSWORD || 'admin123';

  const existing = await query('SELECT id FROM users WHERE email = $1 LIMIT 1', [adminEmail]);

  if (existing.rowCount > 0) {
    console.log(`Admin user already exists: ${adminEmail}`);
    return existing.rows[0].id;
  }

  const hashedPassword = await bcrypt.hash(adminPassword, 10);

  const insertResult = await query(
    `
      INSERT INTO users (name, email, password, role)
      VALUES ($1, $2, $3, 'admin')
      RETURNING id
    `,
    [adminName, adminEmail, hashedPassword]
  );

  console.log(`Seeded admin user: ${adminEmail} (password: ${adminPassword})`);
  return insertResult.rows[0].id;
}

async function seedDestinations() {
  const countResult = await query('SELECT COUNT(*)::int AS count FROM destinations');
  const destinationCount = countResult.rows[0]?.count ?? 0;

  if (destinationCount > 0) {
    console.log('Destinations table already has data. Skipping destination seed.');
    return;
  }

  const destinations = [
    {
      name: 'Jatim Park 2',
      category: 'Wisata Keluarga',
      price: 120000,
      description: 'Eco Green Park + Batu Secret Zoo (contoh data untuk testing).',
      location: 'Batu, Malang',
    },
    {
      name: 'Museum Angkut',
      category: 'Museum',
      price: 100000,
      description: 'Museum transportasi dengan zona tematik (contoh data untuk testing).',
      location: 'Batu, Malang',
    },
    {
      name: 'Coban Rondo',
      category: 'Alam',
      price: 35000,
      description: 'Air terjun populer di Malang (contoh data untuk testing).',
      location: 'Pujon, Malang',
    },
  ];

  for (const destination of destinations) {
    await query(
      `
        INSERT INTO destinations (name, category, price, description, location)
        VALUES ($1, $2, $3, $4, $5)
      `,
      [
        destination.name,
        destination.category,
        destination.price,
        destination.description,
        destination.location,
      ]
    );
  }

  console.log(`Seeded destinations: ${destinations.length}`);
}

async function seedDb() {
  await ensureSchemaInitialized();
  await seedAdminUser();
  await seedDestinations();
  console.log('Database seed completed.');
}

seedDb()
  .catch((error) => {
    console.error('Failed to seed database.');
    console.error(error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await pool.end();
  });
