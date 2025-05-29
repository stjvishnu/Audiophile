import express from "express"
import * as adminController from "../../controller/adminController.js";
const router = express.Router();

router.get('/',adminController.getAdminDasboard)

export default router