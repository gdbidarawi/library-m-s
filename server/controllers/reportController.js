const { Parser } = require('json2csv');
const PDFDocument = require('pdfkit');
const Borrow = require('../models/Borrow');
const Fine = require('../models/Fine');
const asyncHandler = require('../middleware/asyncHandler');

const getDateRange = (period) => {
  const now = new Date();
  let start;
  switch (period) {
    case 'daily':
      start = new Date(now.setHours(0, 0, 0, 0));
      break;
    case 'weekly':
      start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case 'monthly':
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      break;
    case 'annual':
      start = new Date(now.getFullYear(), 0, 1);
      break;
    default:
      start = new Date(0);
  }
  return start;
};

// @desc    Generate report data (daily/weekly/monthly/annual)
// @route   GET /api/reports/:period
// @access  Private/Admin
const getReport = asyncHandler(async (req, res) => {
  const { period } = req.params; // daily | weekly | monthly | annual
  const start = getDateRange(period);

  const [borrows, fines] = await Promise.all([
    Borrow.find({ createdAt: { $gte: start } })
      .populate('student', 'name registrationNumber')
      .populate('book', 'title isbn')
      .sort({ createdAt: -1 }),
    Fine.find({ createdAt: { $gte: start } }).populate('student', 'name'),
  ]);

  const summary = {
    totalBorrowRequests: borrows.length,
    issued: borrows.filter((b) => ['issued', 'returned'].includes(b.status)).length,
    returned: borrows.filter((b) => b.status === 'returned').length,
    pending: borrows.filter((b) => b.status === 'pending').length,
    totalFines: fines.reduce((sum, f) => sum + f.amount, 0),
    paidFines: fines.filter((f) => f.status === 'paid').reduce((sum, f) => sum + f.amount, 0),
  };

  res.status(200).json({ success: true, period, summary, borrows, fines });
});

// @desc    Export report as PDF
// @route   GET /api/reports/:period/export/pdf
// @access  Private/Admin
const exportReportPDF = asyncHandler(async (req, res) => {
  const { period } = req.params;
  const start = getDateRange(period);

  const borrows = await Borrow.find({ createdAt: { $gte: start } })
    .populate('student', 'name registrationNumber')
    .populate('book', 'title isbn');

  const doc = new PDFDocument({ margin: 30, size: 'A4' });
  res.header('Content-Type', 'application/pdf');
  res.attachment(`${period}_report.pdf`);
  doc.pipe(res);

  doc.fontSize(18).text(`Library Management System - ${period.toUpperCase()} Report`, { align: 'center' });
  doc.moveDown();
  doc.fontSize(10);

  borrows.forEach((b, i) => {
    doc.text(
      `${i + 1}. ${b.book?.title || 'N/A'} | Student: ${b.student?.name || 'N/A'} | Status: ${b.status} | Requested: ${b.createdAt.toDateString()}`
    );
    doc.moveDown(0.3);
  });

  doc.end();
});

// @desc    Export report as Excel (CSV compatible with Excel)
// @route   GET /api/reports/:period/export/excel
// @access  Private/Admin
const exportReportExcel = asyncHandler(async (req, res) => {
  const { period } = req.params;
  const start = getDateRange(period);

  const borrows = await Borrow.find({ createdAt: { $gte: start } })
    .populate('student', 'name registrationNumber')
    .populate('book', 'title isbn')
    .lean();

  const data = borrows.map((b) => ({
    Book: b.book?.title,
    ISBN: b.book?.isbn,
    Student: b.student?.name,
    RegistrationNumber: b.student?.registrationNumber,
    Status: b.status,
    RequestDate: b.createdAt,
    DueDate: b.dueDate,
    ReturnDate: b.returnDate,
  }));

  const parser = new Parser();
  const csvData = parser.parse(data);

  res.header('Content-Type', 'text/csv');
  res.attachment(`${period}_report.csv`);
  res.send(csvData);
});

module.exports = { getReport, exportReportPDF, exportReportExcel };
