const { query } = require('../config/db');

async function getAllDestinations() {
  const sql = `
    SELECT
      d.id,
      d.name,
      d.category,
      d.price,
      d.description,
      d.location,
      d.created_at,
      d.updated_at,
      COALESCE(ROUND(AVG(r.rating)::numeric, 2), 0) AS avg_rating,
      COUNT(r.id)::int AS total_reviews
    FROM destinations d
    LEFT JOIN reviews r ON r.destination_id = d.id
    GROUP BY d.id
    ORDER BY d.id DESC
  `;

  const result = await query(sql);
  return result.rows;
}

async function getDestinationById(id) {
  const sql = `
    SELECT
      d.id,
      d.name,
      d.category,
      d.price,
      d.description,
      d.location,
      d.created_at,
      d.updated_at,
      COALESCE(ROUND(AVG(r.rating)::numeric, 2), 0) AS avg_rating,
      COUNT(r.id)::int AS total_reviews
    FROM destinations d
    LEFT JOIN reviews r ON r.destination_id = d.id
    WHERE d.id = $1
    GROUP BY d.id
    LIMIT 1
  `;

  const result = await query(sql, [id]);
  return result.rows[0] || null;
}

async function createDestination({ name, category, price, description, location }) {
  const sql = `
    INSERT INTO destinations (name, category, price, description, location)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING id, name, category, price, description, location, created_at, updated_at
  `;

  const result = await query(sql, [name, category, price, description, location]);
  return result.rows[0];
}

async function updateDestination(id, payload) {
  const allowedFields = ['name', 'category', 'price', 'description', 'location'];
  const fields = [];
  const values = [];

  allowedFields.forEach((key) => {
    if (payload[key] !== undefined) {
      values.push(payload[key]);
      fields.push(`${key} = $${values.length}`);
    }
  });

  if (fields.length === 0) {
    return null;
  }

  values.push(id);

  const sql = `
    UPDATE destinations
    SET ${fields.join(', ')}, updated_at = NOW()
    WHERE id = $${values.length}
    RETURNING id, name, category, price, description, location, created_at, updated_at
  `;

  const result = await query(sql, values);
  return result.rows[0] || null;
}

async function deleteDestination(id) {
  const sql = 'DELETE FROM destinations WHERE id = $1';
  const result = await query(sql, [id]);
  return result.rowCount > 0;
}

async function getDestinationsByIds(destinationIds) {
  const sql = `
    SELECT id, name, category, price, description, location
    FROM destinations
    WHERE id = ANY($1::int[])
  `;

  const result = await query(sql, [destinationIds]);
  return result.rows;
}

module.exports = {
  getAllDestinations,
  getDestinationById,
  createDestination,
  updateDestination,
  deleteDestination,
  getDestinationsByIds,
};
