import express from "express";
import * as categoryController from "../../controller/userController.js"

const router = express.Router();

router.get('/iem',categoryController.getIems)
router.get('/iem/subCategory',categoryController.getIemSubcategory)

export default router