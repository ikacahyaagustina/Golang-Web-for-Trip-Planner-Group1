const {
  getAllDestinations,
  getDestinationById,
  createDestination,
  updateDestination,
  deleteDestination,
} = require('../models/destinationModel');
const AppError = require('../utils/appError');

function normalizePrice(price) {
  const parsedPrice = Number(price);
  return Number.isNaN(parsedPrice) ? null : parsedPrice;
}

async function getDestinations(req, res, next) {
  try {
    const destinations = await getAllDestinations();

    res.status(200).json({
      success: true,
      message: 'Destinations fetched successfully',
      data: destinations,
    });
  } catch (error) {
    next(error);
  }
}

async function getDestinationDetail(req, res, next) {
  try {
    const destinationId = Number(req.params.id);

    if (Number.isNaN(destinationId)) {
      throw new AppError(400, 'Invalid destination id');
    }

    const destination = await getDestinationById(destinationId);

    if (!destination) {
      throw new AppError(404, 'Destination not found');
    }

    res.status(200).json({
      success: true,
      message: 'Destination fetched successfully',
      data: destination,
    });
  } catch (error) {
    next(error);
  }
}

async function createDestinationData(req, res, next) {
  try {
    const { name, category, price, description, location } = req.body;

    if (!name || !category || price === undefined || !description || !location) {
      throw new AppError(400, 'name, category, price, description, and location are required');
    }

    const normalizedPrice = normalizePrice(price);

    if (normalizedPrice === null || normalizedPrice < 0) {
      throw new AppError(400, 'price must be a number greater than or equal to 0');
    }

    const destination = await createDestination({
      name,
      category,
      price: normalizedPrice,
      description,
      location,
    });

    res.status(201).json({
      success: true,
      message: 'Destination created successfully',
      data: destination,
    });
  } catch (error) {
    next(error);
  }
}

async function updateDestinationData(req, res, next) {
  try {
    const destinationId = Number(req.params.id);

    if (Number.isNaN(destinationId)) {
      throw new AppError(400, 'Invalid destination id');
    }

    const payload = { ...req.body };

    if (payload.price !== undefined) {
      const normalizedPrice = normalizePrice(payload.price);

      if (normalizedPrice === null || normalizedPrice < 0) {
        throw new AppError(400, 'price must be a number greater than or equal to 0');
      }

      payload.price = normalizedPrice;
    }

    const updatedDestination = await updateDestination(destinationId, payload);

    if (!updatedDestination && Object.keys(payload).length === 0) {
      throw new AppError(400, 'At least one field must be provided for update');
    }

    if (!updatedDestination) {
      throw new AppError(404, 'Destination not found');
    }

    res.status(200).json({
      success: true,
      message: 'Destination updated successfully',
      data: updatedDestination,
    });
  } catch (error) {
    next(error);
  }
}

async function deleteDestinationData(req, res, next) {
  try {
    const destinationId = Number(req.params.id);

    if (Number.isNaN(destinationId)) {
      throw new AppError(400, 'Invalid destination id');
    }

    const isDeleted = await deleteDestination(destinationId);

    if (!isDeleted) {
      throw new AppError(404, 'Destination not found');
    }

    res.status(200).json({
      success: true,
      message: 'Destination deleted successfully',
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getDestinations,
  getDestinationDetail,
  createDestinationData,
  updateDestinationData,
  deleteDestinationData,
};
