import express from 'express'
import categoryController from "../../controller/adminModules/category.js";
const router = express.Router();

router.get('/',categoryController.getCategory)
router.post('/add',categoryController.addCategory)
router.put('/edit/:id',categoryController.editCategory)
router.delete('/delete/:id',categoryController.deleteCategory)
router.delete('/restore/:id',categoryController.restoreCategory)
router.patch('/block/:id',categoryController.blockCategory)
router.patch('/unblock/:id',categoryController.unblockCategory)
router.get('/search',categoryController.searchCategory)
router.get('/loadCategories',categoryController.loadCategories )

export default router