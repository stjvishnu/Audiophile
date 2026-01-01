import express from "express";
import userRoute from "./userRoute.js"
import productsRoute from "./productsRouter.js"
import cartRoute from "./cartRouter.js"
import checkoutRoute from "./checkoutRouter.js"
import profileRoute from "./profileRouter.js"
import wishlistRoute from "./wishlistRouter.js"
import ordersRoute from "./ordersRouter.js"
import couponsRoute from "./couponsRouter.js"
import referralRoute from './referralRouter.js'
import categoryRoute from './categoryRouter.js'
import usermiddleware from "../../middlewares/usermiddleware.js";

const router = express.Router();

router.use('/',userRoute)
router.use('/products',productsRoute)
router.use('/cart',usermiddleware.restrcitedLogin,cartRoute)
router.use('/wishlist',usermiddleware.restrcitedLogin,wishlistRoute)
router.use('/checkout',usermiddleware.restrcitedLogin,checkoutRoute)
router.use('/profile',usermiddleware.restrcitedLogin,profileRoute)
router.use('/orders',usermiddleware.restrcitedLogin,ordersRoute)
router.use('/coupons',usermiddleware.restrcitedLogin,couponsRoute)
router.use('/referral',usermiddleware.restrcitedLogin,referralRoute)
router.use('/category',categoryRoute)


export default router

