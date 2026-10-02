const express = require('express');
const router = express.Router();
const ac = require('../controllers/alertController');
const { protect } = require('../middleware/auth');

router.get('/', protect, ac.getAlerts);
router.put('/:id', protect, ac.updateAlert);

module.exports = router;
