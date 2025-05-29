import express from "express";
import subCategoryController from "../../controller/adminModules/subCategory.js";

const router= express.Router();

router.get('/',subCategoryController.getSubCategory);
router.post('/add',subCategoryController.addSubCategory);
router.post('/edit/:id',subCategoryController.editSubCategory);
router.delete('/delete/:id',subCategoryController.deleteSubCategory);

export default router