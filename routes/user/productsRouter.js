import express from "express";
import * as userController from '../../controller/userController.js'
const router = express.Router();

router.get('/',userController.allProducts)
router.get('/searchProducts',userController.searchProducts)
router.post('/',userController.postFilter)

export default router