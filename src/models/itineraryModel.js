const { pool, query } = require('../config/db');

async function buildDestinationLookup(destinationIds, client) {
  const sql = `
    SELECT id, name, category, price, description, location
    FROM destinations
    WHERE id = ANY($1::int[])
  `;

  const result = await client.query(sql, [destinationIds]);
  const lookup = new Map();

  result.rows.forEach((row) => {
    lookup.set(row.id, row);
  });

  return lookup;
}

async function createItineraryWithDetails({ userId, title, destinationIds }) {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const destinationLookup = await buildDestinationLookup(destinationIds, client);

    if (destinationLookup.size !== destinationIds.length) {
      throw new Error('One or more destinations were not found');
    }

    const totalCost = destinationIds.reduce((acc, destinationId) => {
      const item = destinationLookup.get(destinationId);
      return acc + Number(item.price);
    }, 0);

    const itineraryInsert = await client.query(
      `
        INSERT INTO itinerary (user_id, title, total_cost)
        VALUES ($1, $2, $3)
        RETURNING id, user_id, title, total_cost, created_at, updated_at
      `,
      [userId, title, totalCost]
    );

    const itinerary = itineraryInsert.rows[0];

    for (let i = 0; i < destinationIds.length; i += 1) {
      await client.query(
        `
          INSERT INTO itinerary_details (itinerary_id, destination_id, visit_order)
          VALUES ($1, $2, $3)
        `,
        [itinerary.id, destinationIds[i], i + 1]
      );
    }

    const detailsResult = await client.query(
      `
        SELECT
          idt.id,
          idt.visit_order,
          d.id AS destination_id,
          d.name,
          d.category,
          d.price,
          d.location,
          d.description
        FROM itinerary_details idt
        JOIN destinations d ON d.id = idt.destination_id
        WHERE idt.itinerary_id = $1
        ORDER BY idt.visit_order ASC
      `,
      [itinerary.id]
    );

    await client.query('COMMIT');

    return {
      ...itinerary,
      details: detailsResult.rows,
    };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

async function generateItineraryPreview({ title, destinationIds }) {
  const uniqueIds = Array.from(new Set(destinationIds));
  const sql = `
    SELECT id, name, category, price, description, location
    FROM destinations
    WHERE id = ANY($1::int[])
  `;

  const result = await query(sql, [uniqueIds]);
  const lookup = new Map();

  result.rows.forEach((item) => {
    lookup.set(item.id, item);
  });

  const details = [];
  let totalCost = 0;

  destinationIds.forEach((destinationId, index) => {
    const destination = lookup.get(destinationId);

    if (!destination) {
      return;
    }

    totalCost += Number(destination.price);

    details.push({
      visit_order: index + 1,
      destination_id: destination.id,
      name: destination.name,
      category: destination.category,
      price: destination.price,
      location: destination.location,
      description: destination.description,
    });
  });

  return {
    title,
    total_cost: totalCost,
    details,
    found_count: details.length,
    requested_count: destinationIds.length,
  };
}

async function getItinerariesByUserId(userId) {
  const sql = `
    SELECT id, user_id, title, total_cost, created_at, updated_at
    FROM itinerary
    WHERE user_id = $1
    ORDER BY created_at DESC
  `;

  const result = await query(sql, [userId]);
  return result.rows;
}

async function getItineraryByIdForUser(itineraryId, userId) {
  const itinerarySql = `
    SELECT id, user_id, title, total_cost, created_at, updated_at
    FROM itinerary
    WHERE id = $1 AND user_id = $2
    LIMIT 1
  `;

  const itineraryResult = await query(itinerarySql, [itineraryId, userId]);

  if (itineraryResult.rows.length === 0) {
    return null;
  }

  const detailSql = `
    SELECT
      idt.id,
      idt.visit_order,
      d.id AS destination_id,
      d.name,
      d.category,
      d.price,
      d.location,
      d.description
    FROM itinerary_details idt
    JOIN destinations d ON d.id = idt.destination_id
    WHERE idt.itinerary_id = $1
    ORDER BY idt.visit_order ASC
  `;

  const detailsResult = await query(detailSql, [itineraryId]);

  return {
    ...itineraryResult.rows[0],
    details: detailsResult.rows,
  };
}

module.exports = {
  createItineraryWithDetails,
  generateItineraryPreview,
  getItinerariesByUserId,
  getItineraryByIdForUser,
};
