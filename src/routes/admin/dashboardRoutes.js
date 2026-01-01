import express from "express"
import * as adminController from "../../controller/adminController.js";
import adminMiddleware from '../../middlewares/adminMiddleware.js'

const router = express.Router();

router.get('/' ,adminController.getAdminDasboard)
router.get('/sales-chart',adminController.getSalesChart)


export default router