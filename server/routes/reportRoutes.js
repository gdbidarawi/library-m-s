const express = require('express');
const router = express.Router();
const { getReport, exportReportPDF, exportReportExcel } = require('../controllers/reportController');
const { protect, authorize } = require('../middleware/auth');

router.get('/:period', protect, authorize('admin'), getReport);
router.get('/:period/export/pdf', protect, authorize('admin'), exportReportPDF);
router.get('/:period/export/excel', protect, authorize('admin'), exportReportExcel);

module.exports = router;
