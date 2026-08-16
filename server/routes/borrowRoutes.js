const express = require('express');
const router = express.Router();
const {
  requestBorrow,
  getBorrows,
  approveBorrow,
  rejectBorrow,
  cancelBorrow,
  renewBorrow,
  returnBook,
} = require('../controllers/borrowController');
const { protect, authorize } = require('../middleware/auth');

router.route('/').get(protect, getBorrows).post(protect, authorize('student'), requestBorrow);

router.put('/approve/:id', protect, authorize('admin'), approveBorrow);
router.put('/reject/:id', protect, authorize('admin'), rejectBorrow);
router.put('/return/:id', protect, authorize('admin'), returnBook);
router.put('/cancel/:id', protect, authorize('student'), cancelBorrow);
router.put('/renew/:id', protect, authorize('student'), renewBorrow);

module.exports = router;
