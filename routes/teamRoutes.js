const express = require('express');
const router = express.Router();
const teamController = require('../controllers/teamController');

router.get('/', teamController.getMyTeams);
router.post('/', teamController.createTeam);
router.post('/:teamId/players', teamController.addPlayer);
router.delete('/players/:id', teamController.deletePlayer);

module.exports = router;
