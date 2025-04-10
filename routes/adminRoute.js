import express from 'express';
import adminController from '../controller/adminController.js'
const adminRouter=express.Router();

//auth

adminRouter.get('/',adminController.getLoadAdmin)
adminRouter.get('/login',adminController.getAdminLogin)
adminRouter.post('/login',adminController.postAdminLogin)
adminRouter.get('/dashboard',adminController.getAdminDasboard)
// adminRouter.get('/',adminController.getAdminSplash)

export default adminRouter;
