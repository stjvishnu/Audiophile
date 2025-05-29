import express from 'express'
import * as adminController from "../../controller/adminController.js"

const router = express.Router();

router.get('/',adminController.getUsers);
router.put('/status/:id',adminController.putUsers)
router.get('/search',adminController.searchUsers)

export default router

 