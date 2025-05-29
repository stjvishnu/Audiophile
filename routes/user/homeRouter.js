import homeController from "../../controller/userModules/home.js"
import express from "express";
const router = express.Router();

router.get('/',homeController.getHome)

export default router