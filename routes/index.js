import express from "express";
import userRoute from "./userRoute.js"
const router = express.Router();

router.use('/user',userRoute)
router.use('/',userRoute)


export default router

