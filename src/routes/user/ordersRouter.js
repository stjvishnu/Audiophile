import express from "express";
import * as ordersController from "../../controller/userController.js"

const router = express.Router();

router.post('/cancel',ordersController.cancelOrder)
router.post('/return',ordersController.returnOrder)
router.patch('/return-item/:itemId',ordersController.returnSingleItem)
router.patch('/cancel-item/:itemId',ordersController.cancelSingleItem)
router.get('/download-invoice/:orderId',ordersController.downloadInvoice)

export default router
