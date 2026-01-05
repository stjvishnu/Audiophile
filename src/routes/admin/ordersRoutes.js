import express from 'express'
import ordersController from "../../controller/adminModules/orders.js";
const router = express.Router();

router.get('/',ordersController.getOrders)
router.get('/:orderId',ordersController.getOrderDetails)
router.post('/change-order-status',ordersController.changeOrderStatus)
router.post('/return-item',ordersController.returnItem)
router.post('/return-whole-item',ordersController.returnWholeItem)

export default router