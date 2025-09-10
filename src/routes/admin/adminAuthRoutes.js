import express from 'express';
import * as adminController from '../../controller/adminController.js'
const router=express.Router();

//auth

router.get('/',adminController.getLoadAdmin)
router.get('/login',adminController.getAdminLogin)
router.post('/login',adminController.postAdminLogin)
// adminRouter.get('/dashboard',adminController.getAdminDasboard)
// adminRouter.get('/',adminController.getAdminSplash)

export default router;
