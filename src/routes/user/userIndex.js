import express from "express";
import userRoute from "./userRoute.js"
import productsRoute from "./productsRouter.js"
import cartRoute from "./cartRouter.js"
import usermiddleware from "../../middlewares/usermiddleware.js";

const router = express.Router();

router.use('/',usermiddleware.blockedUser,userRoute)
router.use('/products',usermiddleware.isLogin,usermiddleware.blockedUser,productsRoute)
router.use('/cart',cartRoute)



export default router

