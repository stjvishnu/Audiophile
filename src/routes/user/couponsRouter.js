import express from "express";
import * as couponsController from "../../controller/userController.js"

const router = express.Router();

router.get('/',couponsController.getCoupons)

export default router