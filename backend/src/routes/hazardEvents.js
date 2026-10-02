const express = require('express');
const router = express.Router();
const hec = require('../controllers/hazardEventController');
const { protect } = require('../middleware/auth');

router.get('/', protect, hec.getHazardEvents);
router.get('/:id', protect, hec.getHazardEvent);

module.exports = router;
