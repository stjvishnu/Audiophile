import jwt from "jsonwebtoken";
import Category from "../models/categoryModel.js";
import dotenv from "dotenv";
dotenv.config();

// ----------------------- isLogin Middleware -----------------------

/**
 * Middleware to protect routes by verifying user authentication
 * checks for a valid access token, It valid proceeds to the next middleware.
 * If the token is missing or invalid, redirects to login page.
 * 
 * @param {Object} req -Express request object, contains cookies with access and refresh token
 * @param {Object} res -Express response object, used to redirect to login page or route.
 * @param {Function} next - Express next function to pass control to next middleware
 * @returns {void} -directs to route if logged in, else redirect to login page
 * @throws {Error} -  If verification fails, redirects to login page
 */


const isLogin =(req,res)=>{
  const token = req.cookies.token;
  if(!token){
    return next()
  }
  try{
    const decoded = jwt.verify(token,process.env.JWT_SECRET_KEY)
  }catch(err){
    
  }
}


const restrcitedLogin = async (req, res, next) => {

  const token = req.cookies.token;
  try {
    if (!token) {
      return res.status(401).redirect("/user/login"); //No tokens -> Redirect to login page
    }

    const verifyToken = jwt.verify(token, process.env.JWT_SECRET_KEY);

    req.user = verifyToken.userId;
    return next(); //Valid token ->Pass control to next middleware
  } catch (err) {
    console.log("Error occured while user authentcating middleware", err);
    return res.status(401).redirect("/user/login"); //invalid token ->Redirect to login page
  }
};

// -------------------------------------------------------------------------



// ----------------------- Authentication Middleware -----------------------

/**
 * Middleware to prevent access to the login route if the user is already authenticated.
 * verifies the access token in the request cookies.If valid, redirectes to homepage.
 * If the access token is invalid or missing, attempts to use the refresh token to generate new access token.
 * If the refresh token is valid or missing, proceeds to the login route.
 * 
 * @param {Object} req - Express request object, contains cookies with access and refresh token
 * @param {Object} res - Express response object, used to set cookies and redirect 
 * @param {Function} next -Express next function to pass control to the next middleware
 * @returns {void} - Redirects to '/' if authenticated , call next() if unauthenticated or sets new token
 * @throws {Error} -If token verification fails,logs the error and clear invalide cookies
 */


const authLogin = (req, res, next) => {
  const token = req.cookies.token;
  const refreshToken = req.cookies.refreshToken;

    //If token doesn't exist
    if(!token){
      return next() //proceed to login
    }

    try{
      //verify access token
      const decoded = jwt.verify(token,process.env.JWT_SECRET_KEY);
      req.user=decoded.userId
      res.status(401).redirect('/') //Token is valid, redirect to home
    }catch(err){

      //Access token invalid,try refresh token
      if(!refreshToken){
        return next() //No refresh token -> Procees to login
      }

      try{
        //Verify refresh token
        const decoded = jwt.verify(refreshToken,process.JWT_REFRESH_KEY);

        //valid and generate new Access Token
        const newAccessToken=jwt.sign(
          { userId: user._id,
            email: user.email,
            name: user.firstName,
          },
          process.env.JWT_SECRET_KEY,
          {expiresIn:'15m'}
        )

        res.cookie('token',newAccessToken,{httpOnly:true}) //set new access token in cookies
        req.user=decoded.userId;
        
      }catch(err){
        //refresh token invalid -> clear cookies and proceed to login
        console.error('Refresh Token error',err.message)
        res.clearCookie('token');
        res.clearCookie('refreshToken')
        return next()
      }
    }

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
 
  try {

    //If token exists
     if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
      let name = decoded.name;//extracts user name
      res.locals.user = {
        name,
      };
    } else {
      res.locals.user = null; // No user
    }
    next(); //after setting res.locals, pass control tpo next middleware
  } catch (err) {
    next(); //if jwt verification went wrong,pass control to next middleware
  }
};

// --------------------------------------------------------------------------

export default {
  isLogin,
  authLogin,
  setCategories,
  setName,
};
