const Fine = require('../models/Fine');
const asyncHandler = require('../middleware/asyncHandler');

// @desc    Get all fines (admin: all, student: own)
// @route   GET /api/fines
// @access  Private
const getFines = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 10 } = req.query;
  const query = {};

  if (req.user.role === 'student') {
    query.student = req.user._id;
  }
  if (status) {
    query.status = status;
  }

  const skip = (Number(page) - 1) * Number(limit);

  const [fines, total] = await Promise.all([
    Fine.find(query)
      .populate('student', 'name email registrationNumber')
      .populate({ path: 'borrow', populate: { path: 'book', select: 'title isbn' } })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit)),
    Fine.countDocuments(query),
  ]);

  const totalUnpaid = await Fine.aggregate([
    { $match: { ...query, status: 'unpaid' } },
    { $group: { _id: null, sum: { $sum: '$amount' } } },
  ]);

  res.status(200).json({
    success: true,
    count: fines.length,
    total,
    page: Number(page),
    pages: Math.ceil(total / Number(limit)),
    totalUnpaidAmount: totalUnpaid[0]?.sum || 0,
    fines,
  });
});

// @desc    Mark a fine as paid
// @route   PUT /api/fines/pay/:id
// @access  Private/Admin
const payFine = asyncHandler(async (req, res) => {
  const fine = await Fine.findById(req.params.id);
  if (!fine) {
    return res.status(404).json({ success: false, message: 'Fine record not found' });
  }
  if (fine.status === 'paid') {
    return res.status(400).json({ success: false, message: 'This fine has already been paid' });
  }

  fine.status = 'paid';
  fine.paidDate = new Date();
  await fine.save();

  res.status(200).json({ success: true, fine });
});

module.exports = { getFines, payFine };
