const fs = require('fs');
const csv = require('csv-parser');
const { Parser } = require('json2csv');
const PDFDocument = require('pdfkit');
const Book = require('../models/Book');
const asyncHandler = require('../middleware/asyncHandler');

// @desc    Get all books (search, filter, pagination)
// @route   GET /api/books
// @access  Private
const getBooks = asyncHandler(async (req, res) => {
  const { search, category, page = 1, limit = 10 } = req.query;
  const query = {};

  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { author: { $regex: search, $options: 'i' } },
      { isbn: { $regex: search, $options: 'i' } },
      { category: { $regex: search, $options: 'i' } },
    ];
  }

  if (category) {
    query.category = category;
  }

  const skip = (Number(page) - 1) * Number(limit);

  const [books, total] = await Promise.all([
    Book.find(query).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
    Book.countDocuments(query),
  ]);

  res.status(200).json({
    success: true,
    count: books.length,
    total,
    page: Number(page),
    pages: Math.ceil(total / Number(limit)),
    books,
  });
});

// @desc    Get single book
// @route   GET /api/books/:id
// @access  Private
const getBook = asyncHandler(async (req, res) => {
  const book = await Book.findById(req.params.id);
  if (!book) {
    return res.status(404).json({ success: false, message: 'Book not found' });
  }
  res.status(200).json({ success: true, book });
});

// @desc    Add new book
// @route   POST /api/books
// @access  Private/Admin
const createBook = asyncHandler(async (req, res) => {
  const bookData = { ...req.body, addedBy: req.user._id };

  if (req.file) {
    bookData.image = `/uploads/${req.file.filename}`;
  }

  bookData.available = bookData.quantity;

  const book = await Book.create(bookData);
  res.status(201).json({ success: true, book });
});

// @desc    Update book
// @route   PUT /api/books/:id
// @access  Private/Admin
const updateBook = asyncHandler(async (req, res) => {
  let book = await Book.findById(req.params.id);
  if (!book) {
    return res.status(404).json({ success: false, message: 'Book not found' });
  }

  const updateData = { ...req.body };
  if (req.file) {
    updateData.image = `/uploads/${req.file.filename}`;
  }

  // Adjust available copies if quantity changes
  if (updateData.quantity) {
    const diff = Number(updateData.quantity) - book.quantity;
    updateData.available = Math.max(0, book.available + diff);
  }

  book = await Book.findByIdAndUpdate(req.params.id, updateData, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({ success: true, book });
});

// @desc    Delete book
// @route   DELETE /api/books/:id
// @access  Private/Admin
const deleteBook = asyncHandler(async (req, res) => {
  const book = await Book.findById(req.params.id);
  if (!book) {
    return res.status(404).json({ success: false, message: 'Book not found' });
  }
  await book.deleteOne();
  res.status(200).json({ success: true, message: 'Book deleted successfully' });
});

// @desc    Import books via CSV
// @route   POST /api/books/import
// @access  Private/Admin
const importBooks = asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'Please upload a CSV file' });
  }

  const results = [];
  const filePath = req.file.path;

  fs.createReadStream(filePath)
    .pipe(csv())
    .on('data', (data) => results.push(data))
    .on('end', async () => {
      try {
        const booksToInsert = results.map((row) => ({
          title: row.title,
          isbn: row.isbn,
          author: row.author,
          publisher: row.publisher || '',
          category: row.category,
          edition: row.edition || '',
          language: row.language || 'English',
          shelfNumber: row.shelfNumber || '',
          quantity: Number(row.quantity) || 1,
          available: Number(row.quantity) || 1,
          addedBy: req.user._id,
        }));

        const inserted = await Book.insertMany(booksToInsert, { ordered: false });
        fs.unlinkSync(filePath);

        res.status(201).json({
          success: true,
          message: `${inserted.length} books imported successfully`,
        });
      } catch (err) {
        res.status(400).json({ success: false, message: `Import failed: ${err.message}` });
      }
    });
});

// @desc    Export books as CSV
// @route   GET /api/books/export/csv
// @access  Private/Admin
const exportBooksCSV = asyncHandler(async (req, res) => {
  const books = await Book.find().lean();
  const fields = ['title', 'isbn', 'author', 'publisher', 'category', 'edition', 'language', 'shelfNumber', 'quantity', 'available'];
  const parser = new Parser({ fields });
  const csvData = parser.parse(books);

  res.header('Content-Type', 'text/csv');
  res.attachment('books_export.csv');
  res.send(csvData);
});

// @desc    Export books as PDF
// @route   GET /api/books/export/pdf
// @access  Private/Admin
const exportBooksPDF = asyncHandler(async (req, res) => {
  const books = await Book.find().lean();

  const doc = new PDFDocument({ margin: 30, size: 'A4' });
  res.header('Content-Type', 'application/pdf');
  res.attachment('books_export.pdf');
  doc.pipe(res);

  doc.fontSize(18).text('Library Management System - Book List', { align: 'center' });
  doc.moveDown();
  doc.fontSize(10);

  books.forEach((book, index) => {
    doc.text(
      `${index + 1}. ${book.title} | Author: ${book.author} | ISBN: ${book.isbn} | Category: ${book.category} | Available: ${book.available}/${book.quantity}`
    );
    doc.moveDown(0.3);
  });

  doc.end();
});

// @desc    Get distinct categories
// @route   GET /api/books/categories
// @access  Private
const getCategories = asyncHandler(async (req, res) => {
  const categories = await Book.distinct('category');
  res.status(200).json({ success: true, categories });
});

module.exports = {
  getBooks,
  getBook,
  createBook,
  updateBook,
  deleteBook,
  importBooks,
  exportBooksCSV,
  exportBooksPDF,
  getCategories,
};
