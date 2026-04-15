const express = require('express');
const {
  getDestinations,
  getDestinationDetail,
  createDestinationData,
  updateDestinationData,
  deleteDestinationData,
} = require('../controllers/destinationController');
const { authenticate, authorizeRoles } = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/', getDestinations);
router.get('/:id', getDestinationDetail);
router.post('/', authenticate, authorizeRoles('admin'), createDestinationData);
router.put('/:id', authenticate, authorizeRoles('admin'), updateDestinationData);
router.delete('/:id', authenticate, authorizeRoles('admin'), deleteDestinationData);

module.exports = router;
