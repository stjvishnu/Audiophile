import jwt from "jsonwebtoken";
import Category from "../models/categoryModel.js";
import Users from "../models/userModel.js";
import dotenv from "dotenv";
dotenv.config();

// -------------------------------------------------------------------------
// ### 1. The ONE Middleware to Rule Them All ###
//
// This middleware runs on *every* request.
// Its job is to:
// 1. Identify the user from the access token.
// 2. If the access token is expired, use the refresh token to get a new one.
// 3. Fetch the user from the DB to check their 'isActive' status.
// 4. Set `req.user` (for other middleware) and `res.locals.user` (for EJS).
// -------------------------------------------------------------------------

const loadUserAuth = async (req, res, next) => {
  const token = req.cookies.token;
  const refreshToken = req.cookies.refreshToken;

  // Set defaults for this request
  req.user = null;
  res.locals.user = null;

  try {
    // --- Path 1: User has a valid Access Token ---
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    const user = await Users.findById(decoded.userId);

    // Check if user exists or is blocked
    if (!user || !user.isActive) {
      res.clearCookie('token');
      res.clearCookie('refreshToken');
      // If blocked, send them to login with a message
      if (user && !user.isActive) {
        return res.redirect('/user/login?msg=blocked'); // Use /user/login
      }
      return next(); // User not found, just proceed as logged-out
    }

    // SUCCESS: User is valid and active
    req.user = user; // Attach full user object for other routes
    res.locals.user = { firstName: user.firstName }; // Set for EJS
    return next();

  } catch (err) {
    // --- Path 2: Access Token failed (expired/invalid) ---
    // Now we check the refresh token.
    if (!refreshToken) {
      // No access token, no refresh token. Definitely logged out.
      return next();
    }

    try {
      // --- Path 2a: User has a valid Refresh Token ---
      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_KEY);
      const user = await Users.findById(decoded.userId);

      // Check if user exists or is blocked
      if (!user || !user.isActive) {
        res.clearCookie('token');
        res.clearCookie('refreshToken');
        if (user && !user.isActive) {
          return res.redirect('/user/login?msg=blocked'); // Use /user/login
        }
        return next(); // User not found, proceed as logged-out
      }

      // SUCCESS: Refresh token is valid, user is active. Issue a new access token.
      const newAccessToken = jwt.sign(
        { 
          userId: user._id,
          email: user.email,
          firstName: user.firstName,
        },
        process.env.JWT_SECRET_KEY,
        { expiresIn: '15m' }
      );

      res.cookie('token', newAccessToken, { httpOnly: true });
      req.user = user; // Attach full user object
      res.locals.user = { firstName: user.firstName }; // Set for EJS
      return next();

    } catch (err) {
      // --- Path 2b: Refresh Token is also invalid ---
      console.error('Refresh Token invalid:', err.message);
      res.clearCookie('token');
      res.clearCookie('refreshToken');
      return next(); // Both tokens are bad. Proceed as logged-out.
    }
  }
};


// -------------------------------------------------------------------------
// ### 2. Your Other Middleware Become SIMPLE ###
//
// Now that `loadUserAuth` runs first, your other middleware
// just need to check if `req.user` exists.
// -------------------------------------------------------------------------

/**
 * Protects a route.
 * Only allows logged-in users to proceed.
 * Assumes `loadUserAuth` has already run.
 */
const restrcitedLogin = (req, res, next) => {
  if (req.user) {
    return next(); // User is logged in, proceed
  }
  // No user, redirect to login
  return res.status(401).redirect("/user/login");
};

/**
 * Protects the login/register pages.
 * Only allows logged-OUT users to proceed.
 * Assumes `loadUserAuth` has already run.
 */
const authLogin = (req, res, next) => {
  if (req.user) {
    // User is already logged in, send them to the home page
    return res.redirect('/');
  }
  // No user, they are allowed to see the login page
  return next(); 
};

// -------------------------------------------------------------------------
// ### 3. Your Unrelated Middleware (No Change) ###
// -------------------------------------------------------------------------

const setCategories = async (req, res, next) => {
  try {
    const categories = await Category.find();
    res.locals.categories = categories;
    next();
  } catch (err) {
    console.error("Error in fetching Categories", err);
    next(); // Always call next, even on error
  }
};


// -------------------------------------------------------------------------
// ### 4. Your New Export Block ###
// -------------------------------------------------------------------------

// Notice `isLogin`, `setName`, and `blockedUser` are GONE.
// Their logic is now all inside `loadUserAuth`.

export default {
  loadUserAuth,     // The new primary auth middleware
  authLogin,        // The new, simple "guest-only" middleware
  restrcitedLogin,  // The new, simple "user-only" middleware
  setCategories,
};