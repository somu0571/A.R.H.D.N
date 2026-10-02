const express = require('express');
const router = express.Router();
const rc = require('../controllers/reportController');
const { protect } = require('../middleware/auth');

router.get('/', protect, rc.getReports);
router.post('/', protect, rc.createReport);

module.exports = router;
