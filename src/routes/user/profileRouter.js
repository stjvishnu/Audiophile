import express from "express";
import * as profileController from "../../controller/userController.js"
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


export default router   