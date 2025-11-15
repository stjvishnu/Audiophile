import express from "express";
import * as userController from '../../controller/userController.js'
const router = express.Router();

router.get('/',userController.allProducts)
router.get('/singleProduct',userController.singleProduct) 
router.get('/productPage/:id',userController.productPage) 
router.get('/variantProduct',userController.variantProduct)  
router.get('/searchProducts',userController.searchProducts)
router.get('/searchProductsPage',userController.searchProductsPage)
// router.post('/',userController.postFilter)

export default router