const Borrow = require('../models/Borrow');
const Book = require('../models/Book');
const Fine = require('../models/Fine');
const Notification = require('../models/Notification');
const asyncHandler = require('../middleware/asyncHandler');

const BORROW_DAYS_LIMIT = Number(process.env.BORROW_DAYS_LIMIT) || 14;
const FINE_PER_DAY = Number(process.env.FINE_PER_DAY) || 1;

// @desc    Student requests to borrow a book
// @route   POST /api/borrow
// @access  Private/Student
const requestBorrow = asyncHandler(async (req, res) => {
  const { bookId } = req.body;

  const book = await Book.findById(bookId);
  if (!book) {
    return res.status(404).json({ success: false, message: 'Book not found' });
  }

  if (book.available < 1) {
    return res.status(400).json({ success: false, message: 'No copies of this book are currently available' });
  }

  const existing = await Borrow.findOne({
    student: req.user._id,
    book: bookId,
    status: { $in: ['pending', 'approved', 'issued'] },
  });

  if (existing) {
    return res.status(400).json({ success: false, message: 'You already have an active request for this book' });
  }

  const borrow = await Borrow.create({
    student: req.user._id,
    book: bookId,
    status: 'pending',
  });

  await Notification.create({
    user: req.user._id,
    title: 'Borrow Request Submitted',
    message: `Your request to borrow "${book.title}" has been submitted and is pending approval.`,
    type: 'borrow',
  });

  res.status(201).json({ success: true, borrow });
});

// @desc    Get borrow records (admin: all, student: own)
// @route   GET /api/borrow
// @access  Private
const getBorrows = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 10 } = req.query;
  const query = {};

  if (req.user.role === 'student') {
    query.student = req.user._id;
  }

  if (status) {
    query.status = status;
  }

  const skip = (Number(page) - 1) * Number(limit);

  const [borrows, total] = await Promise.all([
    Borrow.find(query)
      .populate('student', 'name email registrationNumber')
      .populate('book', 'title author isbn image')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit)),
    Borrow.countDocuments(query),
  ]);

  res.status(200).json({
    success: true,
    count: borrows.length,
    total,
    page: Number(page),
    pages: Math.ceil(total / Number(limit)),
    borrows,
  });
});

// @desc    Admin approves borrow request (issues the book)
// @route   PUT /api/borrow/approve/:id
// @access  Private/Admin
const approveBorrow = asyncHandler(async (req, res) => {
  const borrow = await Borrow.findById(req.params.id).populate('book');

  if (!borrow) {
    return res.status(404).json({ success: false, message: 'Borrow request not found' });
  }
  if (borrow.status !== 'pending') {
    return res.status(400).json({ success: false, message: 'Only pending requests can be approved' });
  }
  if (borrow.book.available < 1) {
    return res.status(400).json({ success: false, message: 'No copies available to issue' });
  }

  const issueDate = new Date();
  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + BORROW_DAYS_LIMIT);

  borrow.status = 'issued';
  borrow.issueDate = issueDate;
  borrow.dueDate = dueDate;
  borrow.approvedBy = req.user._id;
  await borrow.save();

  borrow.book.available -= 1;
  await borrow.book.save();

  await Notification.create({
    user: borrow.student,
    title: 'Borrow Request Approved',
    message: `Your request for "${borrow.book.title}" was approved. Due date: ${dueDate.toDateString()}.`,
    type: 'borrow',
  });

  res.status(200).json({ success: true, borrow });
});

// @desc    Admin rejects borrow request
// @route   PUT /api/borrow/reject/:id
// @access  Private/Admin
const rejectBorrow = asyncHandler(async (req, res) => {
  const borrow = await Borrow.findById(req.params.id).populate('book');

  if (!borrow) {
    return res.status(404).json({ success: false, message: 'Borrow request not found' });
  }
  if (borrow.status !== 'pending') {
    return res.status(400).json({ success: false, message: 'Only pending requests can be rejected' });
  }

  borrow.status = 'rejected';
  await borrow.save();

  await Notification.create({
    user: borrow.student,
    title: 'Borrow Request Rejected',
    message: `Your request for "${borrow.book.title}" was rejected.`,
    type: 'borrow',
  });

  res.status(200).json({ success: true, borrow });
});

// @desc    Student cancels a pending request
// @route   PUT /api/borrow/cancel/:id
// @access  Private/Student
const cancelBorrow = asyncHandler(async (req, res) => {
  const borrow = await Borrow.findOne({ _id: req.params.id, student: req.user._id });

  if (!borrow) {
    return res.status(404).json({ success: false, message: 'Borrow request not found' });
  }
  if (borrow.status !== 'pending') {
    return res.status(400).json({ success: false, message: 'Only pending requests can be cancelled' });
  }

  borrow.status = 'cancelled';
  await borrow.save();

  res.status(200).json({ success: true, borrow });
});

// @desc    Student renews an issued book (extends due date once per renewal, max 2 renewals)
// @route   PUT /api/borrow/renew/:id
// @access  Private/Student
const renewBorrow = asyncHandler(async (req, res) => {
  const borrow = await Borrow.findOne({ _id: req.params.id, student: req.user._id }).populate('book');

  if (!borrow) {
    return res.status(404).json({ success: false, message: 'Borrow record not found' });
  }
  if (borrow.status !== 'issued') {
    return res.status(400).json({ success: false, message: 'Only currently issued books can be renewed' });
  }
  if (borrow.renewCount >= 2) {
    return res.status(400).json({ success: false, message: 'Maximum renewal limit (2) reached for this book' });
  }

  const newDueDate = new Date(borrow.dueDate);
  newDueDate.setDate(newDueDate.getDate() + BORROW_DAYS_LIMIT);

  borrow.dueDate = newDueDate;
  borrow.renewCount += 1;
  await borrow.save();

  res.status(200).json({ success: true, borrow });
});

// @desc    Admin marks a book as returned; auto-calculates fine if overdue
// @route   PUT /api/borrow/return/:id
// @access  Private/Admin
const returnBook = asyncHandler(async (req, res) => {
  const borrow = await Borrow.findById(req.params.id).populate('book').populate('student');

  if (!borrow) {
    return res.status(404).json({ success: false, message: 'Borrow record not found' });
  }
  if (borrow.status !== 'issued' && borrow.status !== 'overdue') {
    return res.status(400).json({ success: false, message: 'This book is not currently issued' });
  }

  const returnDate = new Date();
  borrow.returnDate = returnDate;
  borrow.status = 'returned';
  await borrow.save();

  borrow.book.available += 1;
  await borrow.book.save();

  // Calculate fine if overdue
  const daysLate = Math.max(0, Math.ceil((returnDate - borrow.dueDate) / (1000 * 60 * 60 * 24)));
  let fine = null;

  if (daysLate > 0) {
    const amount = daysLate * FINE_PER_DAY;
    fine = await Fine.create({
      student: borrow.student._id,
      borrow: borrow._id,
      amount,
      daysLate,
      status: 'unpaid',
    });

    await Notification.create({
      user: borrow.student._id,
      title: 'Fine Issued',
      message: `A fine of $${amount} was issued for returning "${borrow.book.title}" ${daysLate} day(s) late.`,
      type: 'fine',
    });
  }

  await Notification.create({
    user: borrow.student._id,
    title: 'Book Returned',
    message: `"${borrow.book.title}" has been marked as returned.`,
    type: 'return',
  });

  res.status(200).json({ success: true, borrow, fine });
});

module.exports = {
  requestBorrow,
  getBorrows,
  approveBorrow,
  rejectBorrow,
  cancelBorrow,
  renewBorrow,
  returnBook,
};
