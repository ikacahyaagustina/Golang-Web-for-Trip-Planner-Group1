const {
  upsertReview,
  getReviewsByDestination,
  getRatingSummaryByDestination,
} = require('../models/reviewModel');
const { getDestinationById } = require('../models/destinationModel');
const AppError = require('../utils/appError');

async function createOrUpdateReview(req, res, next) {
  try {
    const { destination_id: destinationId, rating, comment } = req.body;
    const parsedDestinationId = Number(destinationId);
    const parsedRating = Number(rating);

    if (Number.isNaN(parsedDestinationId) || Number.isNaN(parsedRating)) {
      throw new AppError(400, 'destination_id and rating are required');
    }

    if (parsedRating < 1 || parsedRating > 5) {
      throw new AppError(400, 'rating must be between 1 and 5');
    }

    const destination = await getDestinationById(parsedDestinationId);

    if (!destination) {
      throw new AppError(404, 'Destination not found');
    }

    const review = await upsertReview({
      userId: req.user.id,
      destinationId: parsedDestinationId,
      rating: parsedRating,
      comment,
    });

    res.status(201).json({
      success: true,
      message: 'Review submitted successfully',
      data: review,
    });
  } catch (error) {
    next(error);
  }
}

async function getDestinationReviews(req, res, next) {
  try {
    const destinationId = Number(req.params.destinationId);

    if (Number.isNaN(destinationId)) {
      throw new AppError(400, 'Invalid destination id');
    }

    const destination = await getDestinationById(destinationId);

    if (!destination) {
      throw new AppError(404, 'Destination not found');
    }

    const [summary, reviews] = await Promise.all([
      getRatingSummaryByDestination(destinationId),
      getReviewsByDestination(destinationId),
    ]);

    res.status(200).json({
      success: true,
      message: 'Reviews fetched successfully',
      data: {
        destination_id: destinationId,
        avg_rating: summary.avg_rating,
        total_reviews: summary.total_reviews,
        reviews,
      },
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createOrUpdateReview,
  getDestinationReviews,
};
