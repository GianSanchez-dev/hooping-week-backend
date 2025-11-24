const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');

// GET /api/bookings?venueId=1
router.get('/', bookingController.getBookings);

// POST /api/bookings
router.post('/', bookingController.createBooking);

router.patch('/:id/status', bookingController.updateBookingStatus);

router.delete('/:id', bookingController.deleteBooking);

module.exports = router;
