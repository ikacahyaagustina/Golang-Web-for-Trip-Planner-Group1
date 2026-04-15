const {
  createItineraryWithDetails,
  generateItineraryPreview,
  getItinerariesByUserId,
  getItineraryByIdForUser,
} = require('../models/itineraryModel');
const AppError = require('../utils/appError');

function parseDestinationIds(rawDestinationIds) {
  if (!Array.isArray(rawDestinationIds) || rawDestinationIds.length === 0) {
    return null;
  }

  const parsed = rawDestinationIds.map((item) => Number(item));

  if (parsed.some((item) => Number.isNaN(item) || item <= 0)) {
    return null;
  }

  return parsed;
}

async function generateGuestRundown(req, res, next) {
  try {
    const { title, destination_ids: destinationIds } = req.body;
    const parsedDestinationIds = parseDestinationIds(destinationIds);

    if (!title || !parsedDestinationIds) {
      throw new AppError(400, 'title and destination_ids[] are required');
    }

    const preview = await generateItineraryPreview({
      title,
      destinationIds: parsedDestinationIds,
    });

    if (preview.requested_count !== preview.found_count) {
      throw new AppError(404, 'One or more destinations were not found');
    }

    res.status(200).json({
      success: true,
      message: 'Itinerary generated successfully (guest mode, not saved)',
      data: preview,
    });
  } catch (error) {
    next(error);
  }
}

async function createItinerary(req, res, next) {
  try {
    const { title, destination_ids: destinationIds } = req.body;
    const parsedDestinationIds = parseDestinationIds(destinationIds);

    if (!title || !parsedDestinationIds) {
      throw new AppError(400, 'title and destination_ids[] are required');
    }

    const uniqueIds = Array.from(new Set(parsedDestinationIds));

    const itinerary = await createItineraryWithDetails({
      userId: req.user.id,
      title,
      destinationIds: uniqueIds,
    });

    res.status(201).json({
      success: true,
      message: 'Itinerary saved successfully',
      data: itinerary,
    });
  } catch (error) {
    if (error.message === 'One or more destinations were not found') {
      return next(new AppError(404, error.message));
    }

    return next(error);
  }
}

async function getMyItineraries(req, res, next) {
  try {
    const itineraries = await getItinerariesByUserId(req.user.id);

    res.status(200).json({
      success: true,
      message: 'Itineraries fetched successfully',
      data: itineraries,
    });
  } catch (error) {
    next(error);
  }
}

async function getMyItineraryById(req, res, next) {
  try {
    const itineraryId = Number(req.params.id);

    if (Number.isNaN(itineraryId)) {
      throw new AppError(400, 'Invalid itinerary id');
    }

    const itinerary = await getItineraryByIdForUser(itineraryId, req.user.id);

    if (!itinerary) {
      throw new AppError(404, 'Itinerary not found');
    }

    res.status(200).json({
      success: true,
      message: 'Itinerary detail fetched successfully',
      data: itinerary,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  generateGuestRundown,
  createItinerary,
  getMyItineraries,
  getMyItineraryById,
};
