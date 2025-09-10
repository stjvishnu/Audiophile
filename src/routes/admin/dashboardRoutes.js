import express from "express"
import * as adminController from "../../controller/adminController.js";
import adminMiddleware from '../../middlewares/adminMiddleware.js'

const router = express.Router();

router.get('/' ,adminMiddleware.isLogin,adminController.getAdminDasboard)

export default router