import express from "express";
import * as wishlistController from "../../controller/userController.js"
import userMiddleware from '../../middlewares/usermiddleware.js'

const router = express.Router()

router.get('/',wishlistController.getWishlist);
router.post('/',wishlistController.postWishlist)
router.delete('/',wishlistController.removeWishlist)

export default router   