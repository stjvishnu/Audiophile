import jwt from "jsonwebtoken";
import Category from "../models/categoryModel.js";
import Products from '../models/productModel.js'
import Cart from "../models/cartModal.js"
import Users from "../models/userModel.js"
import Wishlist from '../models/wishlistModel.js'
import {HTTP_STATUS,RESPONSE_MESSAGES} from '../utils/constants.js'
import dotenv from "dotenv";
dotenv.config();


// ----------------------- main Auth Middleware -----------------------
/**
 * This middleware runs on every request
 * Identify the user from the access token 
 * checks for a access token, If invalid proceeds checks for valid refresh token.
 * If refresh token is valid,guse the refresh token to get a new one.
 * @param {Object} req -Express request object, contains cookies with access and refresh token
 * @param {Object} res -Express response object, used to redirect to login page or route.
 * @param {Function} next - Express next function to pass control to next middleware
 * @returns {void} -generate new access token else redirects ti next middleware
 */

const loadUserAuth = async (req, res, next) => {
  const token = req.cookies.token;
  const refreshToken = req.cookies.refreshToken;

  req.user = null;
  res.locals.userName = null;

  if (!token && !refreshToken) return next();

  try {
    // 1. Try verifying Access Token
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    const user = await Users.findById(decoded.userId);

    if (user && user.isActive) {
      req.user = user._id;
      res.locals.userName = { firstName: user.firstName };
      return next();
    }
    
    // If user exists but is blocked
    if (user && !user.isActive) {
      res.clearCookie('token');
      res.clearCookie('refreshToken');
      return res.redirect('/user/login?msg=blocked');
    }

    throw new Error('Invalid User'); // Fallback to refresh logic if user not found

  } catch (error) {
    // 2. Access Token expired/invalid, try Refresh Token
    if (!refreshToken) return next();

    try {
      const decodedRef = jwt.verify(refreshToken, process.env.JWT_REFRESH_KEY);
      const user = await Users.findById(decodedRef.userId);

      if (!user || !user.isActive) {
        res.clearCookie('token');
        res.clearCookie('refreshToken');
        return user && !user.isActive 
          ? res.redirect('/user/login?msg=blocked') 
          : next();
      }

      // 3. Issue NEW Access Token
      const newAccessToken = jwt.sign(
        { userId: user._id, email: user.email, firstName: user.firstName },
        process.env.JWT_SECRET_KEY,
        { expiresIn: '15m' }
      );

      res.cookie('token', newAccessToken, { 
        httpOnly: true, 
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'Lax'
      });

      req.user = user._id;
      res.locals.userName = { firstName: user.firstName };
      return next();

    } catch (refreshError) {
      res.clearCookie('token');
      res.clearCookie('refreshToken');
      return next();
    }
  }
};


// ----------------------- isLogin Middleware -----------------------

/**
 * Middleware to generate new Access token by verifying refresh token
 * checks for a access token, If invalid proceeds checks for valid refresh token.
 * If refresh token is valid,generate new access token and user remains logged in else proceeds to next middleware.
 * 
 * @param {Object} req -Express request object, contains cookies with access and refresh token
 * @param {Object} res -Express response object, used to redirect to login page or route.
 * @param {Function} next - Express next function to pass control to next middleware
 * @returns {void} -generate new access token else redirects ti next middleware
 */


// const isLogin =(req,res,next)=>{

//   const token = req.cookies.token;
//   const refreshToken= req.cookies.refreshToken;
//   if(!token){
//     return next();
//   }
//   try{
//     const decoded = jwt.verify(token,process.env.JWT_SECRET_KEY);
//     req.user = decoded.userId;
//     return next();    
//   }catch(err){
//     if(!refreshToken){
//       return next();
//     }

//     try{
//       const decoded = jwt.verify(refreshToken,process.env.JWT_REFRESH_KEY);
//       const newAccessToken = jwt.sign(
//         { userId: decoded.userId,
//           email: decoded.email,
//           firstName: decoded.firstName,
//         },process.env.JWT_SECRET_KEY,{expiresIn:'15m'})
//       res.cookie('token',newAccessToken,{httpOnly:true})
//       req.user=decoded.userId;
//       return next()
//     }catch(err){
//       console.error('Refresh Token error',err.message)
//       res.clearCookie('token');
//       res.clearCookie('refreshToken')
//       return next()
//     }
//   }
// }

// -------------------------------------------------------------------------




// ----------------------- restrictedLogin Middleware -----------------------

/**
*Protects a route
*Only allows logged-in users to proceed
*/

const restrcitedLogin = async (req, res, next) => {
console.log('call inside restricted login');
  if(req.user){
    return next()

    
  }
    // Detect AJAX / Axios request
    const isAjax =
    req.xhr ||
    req.headers.accept?.includes('application/json') ||
    req.headers['x-requested-with'] === 'XMLHttpRequest';

  if (isAjax) {
    return res.status(HTTP_STATUS.UNAUTHORIZED).json({
      success: false,
      redirectTo: '/user/login'
    });
  }
  
  return res.status(HTTP_STATUS.UNAUTHORIZED).redirect('/user/login')
};

// -------------------------------------------------------------------------




// ----------------------- Authentication Middleware -----------------------

/**
 *Protects login/register route
 *Only allows logout user to procees
 */


const authLogin = (req, res, next) => {
      if(req.user){
        return res.redirect('/')
      }

      return next();
};

// -----------------------------------------------------------------------------

// categories middlewares

const setCategories = async (req, res, next) => {
  try {
    const categories = await Category.find();
    res.locals.categories = categories;
    next();
  } catch (err) {
    console.error("Error in fetching Categories", err);
    next();
  }
};

// ----------------------- User Name Middleware -----------------------

/**
 * Middleware to set user name in res.locals based on JWT authentication
 * Verifies the access token in cookies and extract the user's name and sets in res.locals
 * res.locals.user is for use in templates
 * res.locals- A special object in express that is available to all ejs templates
 * If no token is found, sets the null in res.locals
 * 
 * @param {Object} req - Express Object that contains cookies with token
 * @param {Function} next -Express next function 
 * @returns {void} - Global middleware that sets user's name if logged in
 * @throws 
 */


const setName = (req, res, next) => {
  const token = req.cookies.token;
  const refreshToken=req.cookies.refreshToken;

  if(token){
    try{
      const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
      req.user=decoded.userId;
    let firstName = decoded.firstName;//extracts user name
    res.locals.user = {
      firstName,
    };
    return next();
    }catch(err){
      // console.log('Access Token Invalid',err.message)
      //there is a correction here
    }
  }
  if(refreshToken){
    try{
      const decoded = jwt.verify(refreshToken,process.env.JWT_REFRESH_KEY);
        let firstName =  decoded.firstName;
        res.locals.user = {
          firstName,
        };
        return next();
    }catch(err){
      console.log('Refresh token invalid')
    }
  }
 
    res.locals.user=null;
    return next(); //if jwt verification went wrong,pass control to next middleware
  
};

// --------------------------------------------------------------------------


// const blockedUser = async (req,res,next)=>{
//   const { token, refreshToken } = req.cookies;
//   let user;
//   //If no access token move to next middleware
//   if(!token){
//     return next();
//   }
//   try{
//     //verify access token
//     const decoded=jwt.verify(token,process.env.JWT_SECRET_KEY);
//     const userId=decoded.userId || decoded.email;
//     if(typeof userId==='object'){
//        user= await Users.findById(userId)
//     }else if (typeof userId==='string'){
//        user= await Users.findOne({email:userId})
//     }
   
//     if(user){
//       if(user.isActive==false){
//         res.clearCookie('token'); //clearCookie expect the cookie name in string not the token value
//         res.clearCookie('refreshToken');
//         return res.redirect('/user?msg=blocked');
//       }
//     }
//     req.user = user;
//     return next();
    
//   }catch(err){
//     //if no access noken
//     //if no refresh token
//     if(!refreshToken){
//       return next()
//     }
//     try{
//       //verify refresh token
//       const decoded = jwt.verify(refreshToken,process.env.JWT_REFRESH_KEY);
//       const userId=decoded.userId || decoded.email;
//     if(typeof userId==='object'){
//        user= await Users.findById(userId)
//     }else if (typeof userId==='string'){
//        user= await Users.findOne({email:userId})
//     }
  
   
//     if(user){
//       if(user.isActive==false){
//         res.clearCookie('token'); //clearCookie expect the cookie name in string not the token value
//         res.clearCookie('refreshToken');
//         return res.redirect('/user?msg=blocked');
//       }
//     }
//       const newAccessToken = jwt.sign(
//          { userId: decoded.userId,
//           email: decoded.email,
//           firstName: decoded.firstName,
//          },
//         process.env.JWT_SECRET_KEY, 
//         {expiresIn:'15m'}
//       )
//       res.cookie('token',newAccessToken,{httpOnly:true})
//       req.user=user;
//       return next()
//     }catch(err){
//       console.error('Refresh Token error',err.message)
//       res.clearCookie('token');
//       res.clearCookie('refreshToken')
//       console.log('Blcoked User',err);
//       return next()
//     }
    
//   }
// }

const wishListCount = async (req,res,next)=>{
  try {
    let count=0;
    if(req.user){
      
      const wishlist = await Wishlist.findOne({user:req.user},'items')
      if(wishlist && wishlist.items){
        count=wishlist.items.length;
      }
    }
    res.locals.wishlistCount=count
    return next()
  } catch (error) {
    return next()
  }
}

const cartCount = async (req,res,next)=>{
  try {
    let count=0;
    if(req.user){
      
     const cart = await Cart.findOne({userId:req.user},'items');
     if(cart && cart.items.length){
      count=cart.items.length
     }
    }
    res.locals.cartCount=count;
    return next()
  } catch (error) {
    return next()
  }
}


//will do aon 10th week one main middleware
// const loadUserAuth =  async (req,res,next)=>{
//   try{
//     const token = req.cookies.token;
//     const refreshToken = req.cookies.refreshToken;

//   } catch(error){

//   }
// }


// const validateCAart = async (req,res,next)=>{
//   try {
//     const cart = await Cart.findOne({userId:req.user}).populate('productId')
//     cart.items.forEach((item)=>{
//       if(!item.productId.isActive || item.productId.isDeleted){
//         return res.status(HTTP_STATUS.BAD_REQUEST).json({message:RESPONSE_MESSAGES.BAD_REQUEST,customMessage:"Product is not available"})
//       }
//     })
//   } catch (error) {
//     console.log('error in validatecart middleware',error);
//   }
// }

const validateCheckoutItems = async (req,res,next)=>{
  try {
    const cart = await Cart.findOne({userId:req.user}).lean()
    
    if (!cart || !cart.items.length) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({message:RESPONSE_MESSAGES.NOT_FOUND,customMessage:'Cart is empty'})
    }

    for(let item of cart.items){
      const product = await Products.findById(item.productId)
        .populate('category')
        .lean();

        if(!product) return res.status(HTTP_STATUS.NOT_FOUND).json({message:RESPONSE_MESSAGES.NOT_FOUND,customMessage:'Product not found '})

        if(!product.isActive || product.isDeleted){
          return res.status(HTTP_STATUS.BAD_REQUEST).json({message:RESPONSE_MESSAGES.BAD_REQUEST,customMessage:'Product is Unavailable'})

        }

        if ( !product.category || !product.category.isActive || product.category.isDeleted){
          return res.status(HTTP_STATUS.BAD_REQUEST).json({message:RESPONSE_MESSAGES.BAD_REQUEST,customMessage:'Category is Unavailable'})
        }

        const variant = product.variants.find((v)=>{
          return v.sku===item.variantId && v.attributes.isActive && !v.attributes.isDeleted
        })

        // }=>v.sku==item.variantId && v.isActive)

        if(!variant){
          return res.status(HTTP_STATUS.BAD_REQUEST).json({message:RESPONSE_MESSAGES.BAD_REQUEST,customMessage:'Product variant is Unavailable'})
        }

        if(variant.attributes.stock<item.quantity){
          return res.status(HTTP_STATUS.BAD_REQUEST).json({message:RESPONSE_MESSAGES.BAD_REQUEST,customMessage:`Not enough stock avilable,only ${variant.attributes.stock} left for ${product.name} ${variant.attributes.color}`})

        }

       
    }
    next()

  } catch (error) {
    console.log('Checkout validation error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({message:RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR,customMessage:'Checkout validation failed'})
  }
}

export default {
  loadUserAuth,
  authLogin,
  restrcitedLogin,
  setCategories,
  setName,
  wishListCount,
  cartCount,
  validateCheckoutItems
};
