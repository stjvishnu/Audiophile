import express from "express";
import * as cartController from "../../controller/userController.js"
import userMiddleware from '../../middlewares/usermiddleware.js'

const router = express.Router();

router.get('/',cartController.getCart)
router.delete('/:id',cartController.deleteCart)
router.post('/add-to-cart',cartController.postCart)
router.post('/update-quantity',cartController.updateQuanity)

export default router