import express from "express";
import * as cartController from "../../controller/userController.js"
import authMiddleware from '../../middlewares/usermiddleware.js'

const router = express.Router();

router.get('/',authMiddleware.isLogin,cartController.getCart)

export default router