import homeController from "../../controller/userModules/home.js"
import express from "express";
import usermiddleware from "../../middlewares/usermiddleware.js";
const router = express.Router();

router.get('/',homeController.getHome)

export default router