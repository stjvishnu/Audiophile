
import userAuthentication from "./userModules/auth.js"
import productController from "./userModules/products.js"

//testing




export const getSignUp = userAuthentication.getSignUp;
export const postSignUp = userAuthentication.postSignUp;


export const postLogin = userAuthentication.postLogin;
export const getLogin = userAuthentication.getLogin;
export const getLogout =userAuthentication.getLogout;

export const getForgotPassword = userAuthentication.getForgotPassword;
export const postForgotPassword = userAuthentication.postForgotPassword;

export const getVerifyOtp = userAuthentication.getVerifyOtp;
export const postVerifyOtp = userAuthentication.postVerifyOtp;

export const  getResetPassword =  userAuthentication.getResetPassword;
export const  postResetPassword = userAuthentication.postResetPassword;

export const getHome=userAuthentication.getHome;

export const getOtp=userAuthentication.getOtp;
export const postOtp=userAuthentication.postOtp;
export const getOtpSuccess=userAuthentication.getOtpSuccess;

export const getGoogleAuth = userAuthentication.getGoogleAuth;
export const getGoogleAuthCallBack = userAuthentication.getGoogleAuthCallBack;



//products controller

export const getProducts = productController.getProducts;