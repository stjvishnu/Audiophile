
import userAuthentication from "./userModules/auth.js"
import productController from "./userModules/products.js"
import cartController from "./userModules/cart.js"
import checkoutController from "./userModules/checkout.js"
import profileController from "./userModules/profile.js"

//testing


export const getUserHome = userAuthentication.getUserHome;

export const getSignUp = userAuthentication.getSignUp;
export const postSignUp = userAuthentication.postSignUp;


export const postLogin = userAuthentication.postLogin;
export const getLogin = userAuthentication.getLogin;
export const getLogout =userAuthentication.getLogout;

export const getForgotPassword = userAuthentication.getForgotPassword;
export const postForgotPassword = userAuthentication.postForgotPassword;

export const getVerifyOtp = userAuthentication.getVerifyOtp;
export const postVerifyOtp = userAuthentication.postVerifyOtp;
export const resendOtp = userAuthentication.resendOtp;


export const  getResetPassword =  userAuthentication.getResetPassword;
export const  postResetPassword = userAuthentication.postResetPassword;

export const getHome=userAuthentication.getHome;

export const getOtp=userAuthentication.getOtp;
export const postOtp=userAuthentication.postOtp;
export const getOtpSuccess=userAuthentication.getOtpSuccess;

export const getGoogleAuth = userAuthentication.getGoogleAuth;
export const getGoogleAuthCallBack = userAuthentication.getGoogleAuthCallBack;



//products controller

export const allProducts = productController.allProducts;
export const singleProduct = productController.singleProduct;
export const variantProduct = productController.variantProduct;
export const searchProducts = productController.searchProducts;
export const postFilter = productController.postFilter;

export const searchProductsPage = productController.searchProductsPage;

//cart controller
export const getCart = cartController.getCart;
export const postCart = cartController.postCart;
export const deleteCart = cartController.deleteCart;
export const updateQuanity = cartController.updateQuanity;

//checkout controller

export const getCheckout = checkoutController.getCheckout;

//profile controller

export const getProfile = profileController.getProfile;
export const postProfile = profileController.postProfile;
export const postRequestEmailChange = profileController.postRequestEmailChange;
export const postRequestPasswordChange = profileController.postRequestPasswordChange;
export const postVerifyEmailChange = profileController.postVerifyEmailChange;
export const postVerifyPasswordChange = profileController.postVerifyPasswordChange;
export const profileGetOtp = profileController.profileGetOtp;
export const profileResentOtp = profileController.profileResentOtp;
