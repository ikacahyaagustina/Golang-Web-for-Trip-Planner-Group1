const express = require('express');
const {
  generateGuestRundown,
  createItinerary,
  getMyItineraries,
  getMyItineraryById,
} = require('../controllers/itineraryController');
const { authenticate } = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/generate', generateGuestRundown);
router.post('/', authenticate, createItinerary);
router.get('/', authenticate, getMyItineraries);
router.get('/:id', authenticate, getMyItineraryById);

module.exports = router;
