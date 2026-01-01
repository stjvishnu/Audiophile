import express from "express";
import * as checkoutController from "../../controller/userController.js"
import userMiddleware from '../../middlewares/usermiddleware.js'

const router = express.Router();

router.get('/',checkoutController.getCheckout)
router.post('/',userMiddleware.validateCheckoutItems,checkoutController.postPlaceOrderInCheckout)
router.post('/create-razorpay-order',checkoutController.createRazorpayOrder)
router.post('/verify-payment',checkoutController.verifyPayment)
router.delete('/cancel-razorpay-order/:orderId',checkoutController.cancelRpzOrder)
router.get('retry-payment',checkoutController.retryRpzPayment)

router.get('/order-success/:orderId',checkoutController.getOrderSuccess)
router.get('/order-failed/:orderId',checkoutController.getOrderFailed)

router.post('/apply-coupon',checkoutController.applyCoupon)


export default router