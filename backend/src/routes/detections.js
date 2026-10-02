const express = require('express');
const router = express.Router();
const dc = require('../controllers/detectionController');
const { protect } = require('../middleware/auth');

router.get('/', protect, dc.getDetections);
router.get('/:id', protect, dc.getDetection);
router.post('/', dc.createDetection); // Open for rover/edge devices
router.put('/:id', protect, dc.updateDetection);

module.exports = router;
