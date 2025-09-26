import express from 'express';
import * as adminController from '../../controller/adminController.js'
import upload from '../../utils/multer.js';
const router = express.Router();

router.get('/',adminController.getProducts);
router.get('/getSingleProduct/:id',adminController.getSingleProduct)
router.put('/add',upload.any(),adminController.addProducts);
router.put('/edit/:id',upload.any(),adminController.editProducts)
router.delete('/delete/:id',adminController.deleteProducts)
router.delete('/soft-delete/:id',adminController.softDeleteProducts)
router.patch('/restore-deleted-product/:id',adminController.restoreSoftDeleteProducts)
router.patch('/block-product/:id',adminController.blockProducts);
router.patch('/unblock-product/:id',adminController.unblockProducts);


export default router