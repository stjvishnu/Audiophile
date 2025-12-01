import express from 'express'
import ordersController from "../../controller/adminModules/orders.js";
const router = express.Router();

router.get('/',ordersController.getOrders)
router.get('/:orderId',ordersController.getOrderDetails)
router.post('/change-order-status',ordersController.changeOrderStatus)

export default router