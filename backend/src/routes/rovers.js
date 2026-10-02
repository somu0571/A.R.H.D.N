const express = require('express');
const router = express.Router();
const rc = require('../controllers/roverController');
const { protect } = require('../middleware/auth');

router.get('/', protect, rc.getRovers);
router.get('/:id', protect, rc.getRover);
router.post('/', rc.createRover);
router.put('/:id', rc.updateRover);

module.exports = router;
