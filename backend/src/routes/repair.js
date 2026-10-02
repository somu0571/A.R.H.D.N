const express = require('express');
const router = express.Router();
const rpc = require('../controllers/repairController');
const { protect } = require('../middleware/auth');

router.get('/', protect, rpc.getRepairTasks);
router.post('/', protect, rpc.createRepairTask);
router.put('/:id', protect, rpc.updateRepairTask);

module.exports = router;
