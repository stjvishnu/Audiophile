import * as adminController from "../../controller/adminController.js"
import express from "express"
const router = express.Router();

router.get('/',adminController.getLoadAdmin)

export default router;