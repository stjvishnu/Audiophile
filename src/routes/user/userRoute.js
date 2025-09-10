import express from "express";
import * as userController from "../../controller/userController.js"
import usermiddleware from "../../middlewares/usermiddleware.js";
const router = express.Router();
import upload from '../../utils/multer.js';

//router is an mini instance of express which can handle routes and also it can have its own logic.But for app.js router act like middleware
//also in router object all the routes are internally stored in array form like:
// router.stack = [
//   { method: 'GET', path: '/register', handler: [Function] },
//   { method: 'POST', path: '/login', handler: [Function] }
// ];
//whenever a request comes to router object , express check router.stack to find a matching route

//auth routes

router.get('/',usermiddleware.isLogin,userController.getUserHome)

router.get('/SignUp',userController.getSignUp)
router.post('/SignUp',userController.postSignUp);

router.get('/login',usermiddleware.authLogin,userController.getLogin);
router.post('/login',userController.postLogin);

router.get('/logout',userController.getLogout);
router.get('/send-otp',userController.getOtp)
router.post('/send-otp',userController.postOtp)
router.get('/otpSuccess',userController.getOtpSuccess)
router.get('/forgot-password',userController.getForgotPassword)
router.post('/forgot-password',userController.postForgotPassword)
router.get('/verify-otp',userController.getVerifyOtp);
router.post('/verify-otp',userController.postVerifyOtp);
router.get('/reset-password',userController.getResetPassword)
router.post('/reset-password',userController.postResetPassword)


//otp route
router.get('/otp',userController.getOtp)
router.post('/otp',userController.postOtp)
router.post('/resend-otp',userController.resendOtp)

router.get('/auth/google',userController.getGoogleAuth);
router.get('/auth/google/callback',userController.getGoogleAuthCallBack);


router.get('/test',userController.test)
router.post('/test',upload.any(),userController.postTest);

export default router;