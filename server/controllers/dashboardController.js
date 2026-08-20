const Book = require('../models/Book');
const User = require('../models/User');
const Borrow = require('../models/Borrow');
const Fine = require('../models/Fine');
const asyncHandler = require('../middleware/asyncHandler');

// @desc    Admin dashboard summary stats + chart data
// @route   GET /api/dashboard/admin
// @access  Private/Admin
const getAdminDashboard = asyncHandler(async (req, res) => {
  const [
    totalBooks,
    totalStudents,
    borrowedCount,
    returnedCount,
    overdueCount,
    fineAgg,
    recentBorrows,
    booksByCategory,
    borrowsLast7Days,
  ] = await Promise.all([
    Book.countDocuments(),
    User.countDocuments({ role: 'student' }),
    Borrow.countDocuments({ status: 'issued' }),
    Borrow.countDocuments({ status: 'returned' }),
    Borrow.countDocuments({ status: 'issued', dueDate: { $lt: new Date() } }),
    Fine.aggregate([
      { $group: { _id: '$status', total: { $sum: '$amount' } } },
    ]),
    Borrow.find()
      .populate('student', 'name')
      .populate('book', 'title')
      .sort({ createdAt: -1 })
      .limit(8),
    Book.aggregate([{ $group: { _id: '$category', count: { $sum: 1 } } }, { $sort: { count: -1 } }]),
    Borrow.aggregate([
      {
        $match: {
          createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]),
  ]);

  const fineCollected = fineAgg.find((f) => f._id === 'paid')?.total || 0;
  const fineOutstanding = fineAgg.find((f) => f._id === 'unpaid')?.total || 0;

  res.status(200).json({
    success: true,
    stats: {
      totalBooks,
      totalStudents,
      borrowedBooks: borrowedCount,
      returnedBooks: returnedCount,
      overdueBooks: overdueCount,
      fineCollected,
      fineOutstanding,
    },
    charts: {
      booksByCategory,
      borrowsLast7Days,
    },
    recentActivities: recentBorrows,
  });
});

// @desc    Student dashboard summary
// @route   GET /api/dashboard/student
// @access  Private/Student
const getStudentDashboard = asyncHandler(async (req, res) => {
  const studentId = req.user._id;

  const [borrowedBooks, overdueBooks, returnedBooks, unpaidFines] = await Promise.all([
    Borrow.find({ student: studentId, status: 'issued' }).populate('book', 'title author image'),
    Borrow.countDocuments({ student: studentId, status: 'issued', dueDate: { $lt: new Date() } }),
    Borrow.countDocuments({ student: studentId, status: 'returned' }),
    Fine.aggregate([
      { $match: { student: studentId, status: 'unpaid' } },
      { $group: { _id: null, sum: { $sum: '$amount' } } },
    ]),
  ]);

  res.status(200).json({
    success: true,
    stats: {
      currentlyBorrowed: borrowedBooks.length,
      overdueBooks,
      returnedBooks,
      unpaidFineAmount: unpaidFines[0]?.sum || 0,
    },
    borrowedBooks,
  });
});

module.exports = { getAdminDashboard, getStudentDashboard };
