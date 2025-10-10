import express from "express";
import * as cartController from "../../controller/userController.js"
import userMiddleware from '../../middlewares/usermiddleware.js'

const router = express.Router();

router.get('/',userMiddleware.restrcitedLogin,cartController.getCart)
router.post('/add-to-cart',cartController.postCart)

export default router