import express from "express";
import userRoute from "./userRoute.js"
import productsRoute from "./productsRouter.js"
import cartRoute from "./cartRouter.js"
import checkoutRoute from "./checkoutRouter.js"
import profileRoute from "./profileRouter.js"
import usermiddleware from "../../middlewares/usermiddleware.js";

const router = express.Router();

router.use('/',usermiddleware.blockedUser,userRoute)
router.use('/products',usermiddleware.isLogin,usermiddleware.blockedUser,productsRoute)
router.use('/cart',usermiddleware.restrcitedLogin,cartRoute)
router.use('/checkout',usermiddleware.restrcitedLogin,checkoutRoute)
router.use('/profile',usermiddleware.restrcitedLogin,profileRoute)



export default router

