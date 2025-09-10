import express from "express";
import * as userController from '../../controller/userController.js'
const router = express.Router();

router.get('/',userController.allProducts)
router.get('/singleProduct/:id',userController.singleProduct)
router.get('/searchProductsPage',userController.searchProductsPage)
// router.post('/',userController.postFilter)

export default router