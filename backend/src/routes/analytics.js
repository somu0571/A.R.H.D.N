const express = require('express');
const router = express.Router();
const ac = require('../controllers/analyticsController');
const { protect } = require('../middleware/auth');

router.get('/overview', protect, ac.getOverview);
router.get('/hazards', protect, ac.getHazardAnalytics);
router.get('/coverage', protect, ac.getCoverageAnalytics);
router.get('/road-health', protect, ac.getRoadHealthAnalytics);

module.exports = router;
