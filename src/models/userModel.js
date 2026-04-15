const { query } = require('../config/db');

async function createUser({ name, email, password, role = 'user' }) {
  const sql = `
    INSERT INTO users (name, email, password, role)
    VALUES ($1, $2, $3, $4)
    RETURNING id, name, email, role, created_at, updated_at
  `;

  const result = await query(sql, [name, email, password, role]);
  return result.rows[0];
}

async function findUserByEmail(email) {
  const sql = `
    SELECT id, name, email, password, role, created_at, updated_at
    FROM users
    WHERE email = $1
    LIMIT 1
  `;

  const result = await query(sql, [email]);
  return result.rows[0] || null;
}

async function findUserById(id) {
  const sql = `
    SELECT id, name, email, role, created_at, updated_at
    FROM users
    WHERE id = $1
    LIMIT 1
  `;

  const result = await query(sql, [id]);
  return result.rows[0] || null;
}

module.exports = {
  createUser,
  findUserByEmail,
  findUserById,
};
