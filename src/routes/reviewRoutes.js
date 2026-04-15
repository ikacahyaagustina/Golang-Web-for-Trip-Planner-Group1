const express = require('express');
const {
  createOrUpdateReview,
  getDestinationReviews,
} = require('../controllers/reviewController');
const { authenticate } = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/destination/:destinationId', getDestinationReviews);
router.post('/', authenticate, createOrUpdateReview);

module.exports = router;
