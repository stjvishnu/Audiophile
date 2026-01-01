import express from 'express'
import * as adminController from "../../controller/adminController.js"

const router = express.Router();

router.get('/',adminController.getUsers);
router.put('/status/:id',adminController.blockUsers)
router.get('/search',adminController.searchUsers)
router.get('/loadUsers',adminController.loadUsers)

export default router

 