import express from "express";
import * as userController from '../../controller/userController.js'
const router = express.Router();

router.get('/',userController.getReferral)

export default router