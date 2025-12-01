import express from "express";
import * as checkoutController from "../../controller/userController.js"
import userMiddleware from '../../middlewares/usermiddleware.js'

const router = express.Router();

router.get('/',checkoutController.getCheckout)
router.post('/',checkoutController.postPlaceOrderInCheckout)

router.get('/order-success/:orderId',checkoutController.getOrderSuccess)
router.get('/order-failed/:orderId',checkoutController.getOrderFailed)

export default router