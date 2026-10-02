const express = require('express');
const router = express.Router();
const rhc = require('../controllers/roadHealthController');
const { protect } = require('../middleware/auth');

router.get('/', protect, rhc.getRoadSegments);
router.get('/:id', protect, rhc.getRoadSegment);

module.exports = router;
