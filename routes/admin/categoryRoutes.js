import express from 'express'
import categoryController from "../../controller/adminModules/category.js";
const router = express.Router();

router.get('/',categoryController.getCategory)
router.post('/add',categoryController.addCategory)
router.put('/edit/:id',categoryController.editCategory)
router.delete('/delete/:id',categoryController.deleteCategory)

export default router