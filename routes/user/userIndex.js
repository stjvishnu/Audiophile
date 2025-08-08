import express from "express";
import userRoute from "./userRoute.js"
import productsRoute from "./productsRouter.js"
import cartRoute from "./cartRouter.js"

const router = express.Router();

router.use('/',userRoute)
router.use('/products',productsRoute)
router.use('/cart',cartRoute)



export default router

