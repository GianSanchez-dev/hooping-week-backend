const express = require('express');
const router = express.Router();
const venueController = require('../controllers/venueController');

router.get('/', venueController.getAllVenues);
router.post('/', venueController.createVenue);
router.put('/:id', venueController.updateVenue); // <--- NUEVO
router.delete('/:id', venueController.deleteVenue); // <--- NUEVO

module.exports = router;
