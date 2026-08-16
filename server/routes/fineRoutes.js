const express = require('express');
const router = express.Router();
const { getFines, payFine } = require('../controllers/fineController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', protect, getFines);
router.put('/pay/:id', protect, authorize('admin'), payFine);

module.exports = router;
