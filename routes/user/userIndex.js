import express from "express";
import userRoute from "./userRoute.js"
import productsRoute from "./productsRouter.js"

const router = express.Router();

router.use('/user',userRoute)
router.use('/products',productsRoute)

router.use('/',userRoute)


export default router

