import express from "express";
import * as profileController from "../../controller/userController.js"
import * as addressController from "../../controller/userController.js"
import * as ordersController from "../../controller/userController.js"
import * as walletController from "../../controller/userController.js"
import userMiddleware from '../../middlewares/usermiddleware.js'
import upload from '../../utils/multer.js';

const router = express.Router();

router.get('/',profileController.getProfile)
router.post('/',upload.single('profileImg'),profileController.postProfile)
router.post('/request-email-change',upload.single('profileImg'),profileController.postRequestEmailChange);
router.post('/request-password-change',upload.single('profileImg'),profileController.postRequestPasswordChange);
router.post('/verify-email-change',upload.single('profileImg'),profileController.postVerifyEmailChange)
router.post('/verify-password-change',upload.single('profileImg'),profileController.postVerifyPasswordChange)
router.get('/send-otp',profileController.profileGetOtp)
router.post('/re-send-otp',profileController.profileResentOtp)

//address routing

router.get('/address/:addressId',addressController.getAddress)
router.put('/address/:addressId',addressController.editAddress)
router.post('/address',addressController.postAddress)
router.delete('/address/:addressId',addressController.deleteAddress)
router.patch('/address/:addressId',addressController.setDefaultAddress)

//orders routing

router.get('/orders',ordersController.getOrders)

//wallet routing
router.get('/wallet',walletController.getWallet)


export default router    