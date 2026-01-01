import salesReportController from '../../controller/adminModules/sales-report.js';
import express from 'express'

const router = express.Router();

router.get('/',salesReportController.getSalesReport)
router.post('/',salesReportController.getCustomSalesReport)

export default router