import express from 'express';
import * as adminController from '../../controller/adminController.js'
import upload from '../../utils/multer.js';
const router = express.Router();

router.get('/',adminController.getProducts);
router.post('/add',upload.array('images',5),adminController.addProducts);
router.put('/edit/:id',adminController.editProducts)
router.delete('/delete/:id',adminController.deleteProducts)
router.delete('/soft-delete/:id',adminController.softDeleteProducts)

export default router