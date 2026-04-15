const { query } = require('../config/db');

async function upsertReview({ userId, destinationId, rating, comment }) {
  const sql = `
    INSERT INTO reviews (user_id, destination_id, rating, comment)
    VALUES ($1, $2, $3, $4)
    ON CONFLICT (user_id, destination_id)
    DO UPDATE SET
      rating = EXCLUDED.rating,
      comment = EXCLUDED.comment,
      updated_at = NOW()
    RETURNING id, user_id, destination_id, rating, comment, created_at, updated_at
  `;

  const result = await query(sql, [userId, destinationId, rating, comment || null]);
  return result.rows[0];
}

async function getReviewsByDestination(destinationId) {
  const sql = `
    SELECT
      r.id,
      r.user_id,
      u.name AS user_name,
      r.destination_id,
      r.rating,
      r.comment,
      r.created_at,
      r.updated_at
    FROM reviews r
    JOIN users u ON u.id = r.user_id
    WHERE r.destination_id = $1
    ORDER BY r.created_at DESC
  `;

  const result = await query(sql, [destinationId]);
  return result.rows;
}

async function getRatingSummaryByDestination(destinationId) {
  const sql = `
    SELECT
      COALESCE(ROUND(AVG(rating)::numeric, 2), 0) AS avg_rating,
      COUNT(*)::int AS total_reviews
    FROM reviews
    WHERE destination_id = $1
  `;

  const result = await query(sql, [destinationId]);
  return result.rows[0];
}

module.exports = {
  upsertReview,
  getReviewsByDestination,
  getRatingSummaryByDestination,
};
