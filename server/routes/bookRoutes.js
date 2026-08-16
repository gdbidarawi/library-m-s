const express = require('express');
const router = express.Router();
const {
  getBooks,
  getBook,
  createBook,
  updateBook,
  deleteBook,
  importBooks,
  exportBooksCSV,
  exportBooksPDF,
  getCategories,
} = require('../controllers/bookController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.get('/categories', protect, getCategories);
router.get('/export/csv', protect, authorize('admin'), exportBooksCSV);
router.get('/export/pdf', protect, authorize('admin'), exportBooksPDF);
router.post('/import', protect, authorize('admin'), upload.single('csvFile'), importBooks);

router
  .route('/')
  .get(protect, getBooks)
  .post(protect, authorize('admin'), upload.single('image'), createBook);

router
  .route('/:id')
  .get(protect, getBook)
  .put(protect, authorize('admin'), upload.single('image'), updateBook)
  .delete(protect, authorize('admin'), deleteBook);

module.exports = router;
