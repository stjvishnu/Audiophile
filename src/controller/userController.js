
import userAuthentication from "./userModules/auth.js"
import productController from "./userModules/products.js"
import cartController from "./userModules/cart.js"
import checkoutController from "./userModules/checkout.js"
import profileController from "./userModules/profile.js"
import wishlistController from "./userModules/wishlist.js"
import addressController from "./userModules/address.js"
import ordersController from "./userModules/orders.js"
import walletController from './userModules/wallet.js'
import couponsController from './userModules/coupons.js'
import referralController from './userModules/referral.js'
import categoryController from './userModules/category.js'


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
export const productPage = productController.productPage;
export const variantProduct = productController.variantProduct;
export const searchProducts = productController.searchProducts;
export const postFilter = productController.postFilter;

export const searchProductsPage = productController.searchProductsPage;

//cart controller
export const getCart = cartController.getCart;
export const postCart = cartController.postCart;
export const deleteCart = cartController.deleteCart;
export const updateQuanity = cartController.updateQuanity;

//category controller

export const getIems = categoryController.getIems;
export const getIemSubcategory = categoryController.getIemSubcategory;

//wishlist controller
export const getWishlist = wishlistController.getWishlist;
export const postWishlist = wishlistController.postWishlist;
export const removeWishlist = wishlistController.removeWishlist;

//checkout controller

export const getCheckout = checkoutController.getCheckout;
export const postPlaceOrderInCheckout = checkoutController.postPlaceOrderInCheckout;
export const createRazorpayOrder = checkoutController.createRazorpayOrder;
export const getOrderSuccess = checkoutController.getOrderSuccess;
export const  getOrderFailed = checkoutController.getOrderFailed;
export const verifyPayment = checkoutController.verifyPayment;
export const cancelRpzOrder = checkoutController.cancelRpzOrder;
export const retryRpzPayment = checkoutController.retryRpzPayment;
export const applyCoupon = checkoutController.applyCoupon;


//profile controller

export const getProfile = profileController.getProfile;
export const postProfile = profileController.postProfile;
export const postRequestEmailChange = profileController.postRequestEmailChange;
export const postRequestPasswordChange = profileController.postRequestPasswordChange;
export const postVerifyEmailChange = profileController.postVerifyEmailChange;
export const postVerifyPasswordChange = profileController.postVerifyPasswordChange;
export const profileGetOtp = profileController.profileGetOtp;
export const profileResentOtp = profileController.profileResentOtp;

//address controller
 export const getAddress = addressController.getAddress;
 export const postAddress = addressController.postAddress;
 export const editAddress = addressController.editAddress;
 export const deleteAddress = addressController.deleteAddress;
 export const setDefaultAddress = addressController.setDefaultAddress;

 //orders controller

 export const getOrders = ordersController.getOrders;
 export const cancelOrder = ordersController.cancelOrder;
 export const returnOrder = ordersController.returnOrder;
 export const returnSingleItem = ordersController.returnSingleItem;
 export const downloadInvoice = ordersController.downloadInvoice;

 //wallet controller

 export const getWallet = walletController.getWallet;

 //coupons router

 export const getCoupons = couponsController.getCoupons

 //referral controler

 export const getReferral=referralController.getReferral

