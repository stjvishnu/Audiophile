import salesReportController from '../../controller/adminModules/sales-report.js';
import express from 'express'

const router = express.Router();

router.get('/',salesReportController.getSalesReport)
router.post('/',salesReportController.getCustomSalesReport)
router.post('/paginated',salesReportController.paginatedgetCustomSalesReport)
router.post('/download-sales-report',salesReportController.downloadSalesReportPdf)
router.post('/download-sales-report-excel',salesReportController.downloadSalesReportXlsx)

export default router   