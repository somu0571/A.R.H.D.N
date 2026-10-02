const express = require('express');
const router = express.Router();
const cc = require('../controllers/cctvController');
const { protect } = require('../middleware/auth');

router.get('/', protect, cc.getCCTVs);
router.get('/:id', protect, cc.getCCTV);
router.post('/', cc.createCCTV);

module.exports = router;
