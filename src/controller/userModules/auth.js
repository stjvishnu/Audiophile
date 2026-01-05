import User from "../../models/userModel.js";
import Wallet from '../../models/walletModel.js'
import WalletTransaction from '../../models/walletTransaction.js'
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import otpGenerator from "otp-generator";
import otpHelper from "../../utils/otp-helper.js";
import emailSender from "../../utils/emailSender.js";
import passport from "../../utils/googleAuth.js";
import Products from '../../models/productModel.js'
import Orders from '../../models/orderModel.js'
import {HTTP_STATUS,RESPONSE_MESSAGES} from "../../utils/constants.js"



const getUserHome = async (req,res)=>{

  try{ 

   //Newly added products 

  const newProducts = await Products.find({isActive:true,isDeleted:false,'variants.attributes.isActive':true,'variants.attributes.isDeleted':false},{name:1,brand:1,category:1,subCategory:1,description1:1,'variants.$':1}).sort({createdAt:-1}).limit(3)

  //Top selling products

  const topSellingProducts = await Orders.aggregate([
    {$match:{orderStatus:{$in:['delivered','partial-return']}}},
    {$unwind:'$items'},
    {$match:{'items.itemStatus':'delivered'}},
    {$group:{_id:{productId:'$items.productId',variantId:'$items.variantId'},totalSold:{$sum:'$items.quantity'}}},
    {$sort:{totalSold:-1}},
    {$limit:3},
    {$lookup:{from:'products',let:{productId:'$_id.productId',variantId:'$_id.variantId'},
  pipeline:[
    {$match:{$expr:{$eq:['$_id','$$productId']},isActive:true,isDeleted:false}},
    {$addFields:{variants:{$filter:{input:'$variants',as:'variant',cond:
    {$and:[
      {$eq:['$$variant.sku','$$variantId']},
      {$eq:['$$variant.attributes.isActive',true]},
      {$ne:['$$variant.attributes.isDeleted',true]}
    ]
    }}}}}, 
  ],
  as:'product'}},
  {$unwind:'$product'},
  {$project:{_id:0,product:1}}
  ])

  console.log('topSellingProducts',topSellingProducts[0]);

  return res.status(HTTP_STATUS.OK).render("user/home.ejs",{title:'home',newProducts,topSellingProducts,msg:req.query || null});
  }catch(err){
    console.error('Error in Getting Home',err);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).render('404.ejs')
  }
} 


/* ===============================
   SIGNUP LOGIC
   =============================== */



//------------- SignUp_Get ------------//

/**
 * Renders signup page
 * @route GET /user/signup 
 * @access Public
 */

const getSignUp = (req, res) => {
  try {
    res.status(HTTP_STATUS.OK).render("user/signup.ejs", {
      title: "Sign Up",
      layout: "layouts/user-layout",
    });
  } catch (err) {
    console.error("Error in getSignup", err);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).render('404.ejs');
  }
};


//------------- SignUp_Post ------------//

/**
 * Handles user signup and sends OTP for verification
 * @route POST /user/signup
 * @access Public
 */

const postSignUp = async (req, res) => {
  

  try {

    const { firstName, lastName, email, mobile, password, confirmPassword , referralCode } =
    req.body;

    //Basic validation
    if (!firstName || !lastName ||  !email || !mobile || !password || !confirmPassword) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        message: RESPONSE_MESSAGES.BAD_REQUEST,
        customMessage: "All required fields must be provided"
      });
    }

    
    if (password !== confirmPassword) {
      return res.send("Password miss-matches");
    }

    //User existence check

    const userExist = await User.findOne({email});
     if(userExist){
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        message:RESPONSE_MESSAGES.BAD_REQUEST,
        customMessage:'User Already Exists'
      })
     } 

     //Referral validation

     if(referralCode){
      const referredUser = await User.findOne({referralCode:referralCode})
      if(!referredUser){
       return res.status(HTTP_STATUS.BAD_REQUEST).json({
        message:RESPONSE_MESSAGES.BAD_REQUEST,
        customMessage:'Invalid referral code'
      })
      }
     }

     //______ Password & OTP ______

    
    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = otpHelper.generateOtp();
    const otpExpiry = otpHelper.otpExpiry();

    //Temporary Signup payload

    const payLoad = {
      firstName,
      lastName,
      email,
      mobile,
      password: hashedPassword,
      otp,
      otpExpiry,
      referralCode
    };

    const tempData = jwt.sign(payLoad, process.env.JWT_SECRET_KEY, {
      expiresIn: "10m",
    });
  
    //Send otp OTP Email
    await emailSender.sendOtpMail(email, otp);

    res.cookie("tempData", tempData, {
        httpOnly: true,
        sameSite:'strict',
        maxAge: 10 * 60 * 1000
    })

    return res.status(HTTP_STATUS.OK).json({
      message:RESPONSE_MESSAGES.OK,
      customMessage:'Otp sent successfully',
      redirect:'/user/send-otp'
    })

  } catch (err) {
    console.error("Error in user signup", err);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      message:RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR,
      customMessage:'Server Error, please try after sometime'
    })
  }
};


/* ===============================
   OTP LOGIC
   =============================== */



//------------- OTP_Get ------------//

/**
 * Renders OTP verification page
 * @route GET /user/otp 
 * @access Public
 */

const getOtp = (req, res) => {
  try {
    const token = req.cookies?.tempData;

    if (!token) {
      return res.redirect("/user/signup");
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    const email = decoded.email;
    res.render("user/otp.ejs", {
      email:email,
      title:'Verify your Account',
      formAction :'/user/otp',
      backLinkHref:'/user/login',
      backLinkText:'Back to Sign in',
      resendHref:'/user/resend-otp'
    });
  } catch (err) {
    console.log("Error in get Otp", err);
    res.redirect('/user/signup')
  }
};

// ------------------------------------------
// OTP - Post
// ------------------------------------------

const postOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const token = req.cookies.tempData;
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

    // Validate input
    if (!otp) {
      return res.status(HTTP_STATUS.BAD_REQUEST).render("user/otp.ejs", {
        error: "OTP required",
        email,
      });
    }

    // Check OTP status
    if (!decoded.otp) {
      return res.status(HTTP_STATUS.BAD_REQUEST).render("user/otp.ejs", {
        error: "OTP not generated for the user",
        email,
      });
    }

    if (decoded.otpExpiry < Date.now()) {
      return res.status(HTTP_STATUS.BAD_REQUEST).render("user/otp.ejs", {
        error: "OTP expired",
        email,
      });
    }

    if (decoded.otp !== otp) {
      return res.status(HTTP_STATUS.BAD_REQUEST).render("user/otp.ejs", {
        error: "Invalid OTP",
        email,
      });
    }

    let referredUser=null;

    if(decoded.referralCode){
      referredUser = await User.findOne({referralCode:decoded.referralCode})
    }


    const newUser = new User({
      firstName: decoded.firstName,
      lastName: decoded.lastName,
      email: decoded.email,
      mobile: decoded.mobile,
      password: decoded.password,
      referredBy: referredUser ? referredUser._id : null,
    });
  
    await newUser.save();
    const newReferralCode = decoded.firstName.slice(0,3).toUpperCase()+newUser._id.toString().slice(-5).toUpperCase();
    newUser.referralCode=newReferralCode;
    await newUser.save();

    const wallet = await Wallet.findOne({userId:req.user})
    if(!wallet){
      const wallet=await Wallet.create({
        userId:newUser._id,
        balance:0
      })
    }
    

    if (referredUser) {
      creditWallet(referredUser._id,100,'Referral',referredUser._id)
      referredUser.referralCount = (referredUser.referralCount || 0) + 1;
      await referredUser.save();
    }
    res.clearCookie("tempData");

    // Successful verification
    return res.redirect("/user/otpSuccess");
  } catch (err) {
    console.error("Error in OTP verification:", err);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).render("user/otp.ejs", {
      error: "Internal Server Error",
    });
  }
};



const resendOtp = async (req,res)=>{

  try{
    const email = req.body.email;
    const token = req.cookies.tempData;
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    const otp = otpHelper.generateOtp();
    const otpExpiry = otpHelper.otpExpiry();
    const {iat,exp,...payload} = decoded;
    payload.otp=otp;
    payload.otpExpiry=otpExpiry
    await emailSender.sendOtpMail(email, otp);
    let newtempData=jwt.sign(payload,process.env.JWT_SECRET_KEY,{expiresIn:'10m'})
    res.clearCookie(token);
    res.cookie('tempData',newtempData)
    res.status(HTTP_STATUS.OK).render('user/otp.ejs',{
      email:email,
      title:'Verify your Account',
      formAction :'/user/otp',
      backLinkHref:'/user/login',
      backLinkText:'Back to Sign in',
      resendHref:'/user/resend-otp'
    })
  }catch(err){
    console.log('ResentOtp Controller',err);
  }

}


// ------------------------------------------
// Opt-Success - Get
// ------------------------------------------

const getOtpSuccess = (req, res) => {
  res.render("user/otpSuccess.ejs");
};

/*╔══════════════════════╗
  ║ ForgotPassword-LOGIC ║
  ╚══════════════════════╝*/

// ------------------------------------------
// Forgot-Password  - Get
// ------------------------------------------

const getForgotPassword = (req, res) => {
  const email = req.body.email;
  console.log('call inside got forgt  password');
  res.render("user/forgot-password.ejs",{
  email:email})
};

// ------------------------------------------
// Forgot-Password  - Post
// ------------------------------------------

const postForgotPassword = async (req, res) => {
  console.log('call inside post forgot password');
  const email = req.body.email;
  try {
    const user = await User.findOne({
      email,
    });

    if (!user) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).render("user/forgot-password.ejs", {
        error: "This User doesn't exist",
      }); // will add title later
    }

    const otp = otpHelper.generateOtp();
    const otpExpiry = otpHelper.otpExpiry();

    const forgotToken = jwt.sign(
      {
        email,
        otp,
        otpExpiry,
      },
      process.env.JWT_SECRET_KEY,
      {
        expiresIn: "10m",
      }
    );

    await emailSender.sendOtpMail(email, otp);
    res
      .cookie("forgotToken", forgotToken, {
        httpOnly: true,
      })
      .redirect(`/user/verify-otp`);
  } catch (err) {
    console.log("Error in post forgot password", err);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).render("user/forgot-password.ejs", {
      error: "An error occured please try again",
    });
  }
};

const getVerifyOtp = (req, res) => {
  console.log('call inside get  verify otp ');
  const token = req.cookies.forgotToken;
  const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
  const email = decoded.email;
  console.log('email',email);
  res.render("user/otp.ejs", {
    email:email,
    title:'Verify your Account',
    formAction :'/user/verify-otp',
    backLinkHref:'/user/forgot-password',
    backLinkText:'Back to forgt password',
    resendHref:'/user/resend-otp'
  });
};

const postVerifyOtp = async (req, res) => {
  try {
    const { otp, email } = req.body;
    const token = req.cookies.forgotToken;
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    const user = await User.findOne({
      email,
    });
    if (!user) {
      return res.render("user/verify-otp.ejs", {
        error: "User doesn't exist",
        email,
      });
    }

    if (!otp) {
      return res.render("user/verify-otp.ejs", {
        error: "Otp required",
        email,
      });
    }

    if (decoded.otpExpiry < Date.now()) {
      return res.render("user/verify-otp.ejs", {
        error: "Invalid or Otp expired",
        email,
      });
    }

    if (otp != decoded.otp) {
      return res.render("user/verify-otp.ejs", {
        error: "Opt miss Matches",
        email,
      });
    }

    res.redirect(`/user/reset-password`);
  } catch (err) {
    console.log("Error verifying otp");
    res.redirect("/user/forgot-password");
  }
};
//get reset password
const getResetPassword = (req, res) => {
  try {
    const token = req.cookies.forgotToken;
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    const email = decoded.email;
    res.render("user/reset-password.ejs", {
      email,
    });
  } catch (err) {
    console.log("Error getting Reset Password Page");
  }
};

const postResetPassword = async (req, res) => {
  try {
    const { newPassword, confirmPassword, email } = req.body;
    if (newPassword != confirmPassword) {
      return res.render("user/reset-password.ejs", {
        error: "Password Mismatches",
        email,
      });
    }
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const user = await User.findOne({
      email,
    });
    user.password = hashedPassword;
    await user.save();
    res.clearCookie("forgotToken");
    //password changes successfully sweet alert needed here
    res.redirect("/user/login");
  } catch (err) {
    console.log("Error in post reset password");
  }
};
//post reset password, redirect to login
/*╔══════════════════════╗
  ║     LOGIN-LOGIC      ║
  ╚══════════════════════╝*/

// ------------------------------------------
// Login - Get
// ------------------------------------------

const getLogin = async (req, res) => {
  try {
    res.render("user/login.ejs");
  } catch (err) {
    console.log("Error getting Login Page", err);
  }
};
// ------------------------------------------
// Login - Post
// ------------------------------------------
/**
 * @des Authenticate user and returns jwt token
 * @route POST /user/login
 * @param {object} req - Express request object (Expects emal,password)
 * @param {object} res - Express response object
 * @returns {void} Sets JWT token in HTTP-Only cookie and redirect on success
 * @throws {401} If credentials are invalid
 * @throws {500} If server error ccurso
 */

const postLogin = async (req, res) => {
  try {
    
    const email = req.body.email;
    const password = req.body.password;
    
    const user = await User.findOne({email}); 
    console.log('user',user);
    if (!user) {
      
      return res.status(HTTP_STATUS.BAD_REQUEST).json({message:RESPONSE_MESSAGES.BAD_REQUEST,customMessage:'No User Found'});
    }

    console.log('typedpass',password);
    console.log('userDbPAss',user.password);

    if(!user.isActive){
      return res.status(HTTP_STATUS.BAD_REQUEST).json({message:'You are Blocked , Cannot Login'})
    }

    const isPasswordMatch = await bcrypt.compare(password, user.password);
    console.log('passwordmatc',isPasswordMatch);

    if (!isPasswordMatch) {

      return res.status(HTTP_STATUS.BAD_REQUEST).json({message:RESPONSE_MESSAGES.BAD_REQUEST,customMessage:'Password Mismatch'});
    }

    //create Tokens
    const accessToken = jwt.sign(
      {
        userId: user._id,
        email: user.email,
        firstName: user.firstName,
      },
      process.env.JWT_SECRET_KEY,
      {
        expiresIn: "15m",
      }
    );
    
    const refreshToken = jwt.sign(
      {
        userId: user._id,
        email: user.email,
        firstName: user.firstName,
      },
      process.env.JWT_REFRESH_KEY,
      {
        expiresIn:'7d'
      }
    )
     
    return res
      .cookie("token", accessToken, {
        httpOnly: true,
        secure: false,
      })
      .cookie('refreshToken',refreshToken,{
        httpOnly:true,
        secure: false,
      })
      .status(HTTP_STATUS.OK)
      .json({ message:RESPONSE_MESSAGES.OK,customMessage:"Successfully You have Logged In"})
  } catch (err) {
    console.error("Error in postLogin", err);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({message:RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR,customMessage:"Invalid Credentials, Try Again!!"});
  }

};

const getLogout = (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: false,
  })
  .clearCookie('refreshToken',{
    httpOnly:true,
    secure:false
  })
  res.redirect("/user/login");
};

// ------------------------------------------
// Google Authentication
// ------------------------------------------

const getGoogleAuth = passport.authenticate("google", 
    {
       scope: ["profile",'email']
    }
    );


const getGoogleAuthCallBack =[ passport.authenticate('google', {
      failureRedirect: '/user/login',
      session: false,
    }), 
     (req, res) => {
      try {
        const user = req.user;
  
        if (!user) {
          console.error('No user found in callback');
          return res.redirect('/user/login');
        }
        
        const accessToken = jwt.sign(
          {
            userId: user._id,
            email: user.email,
            firstName: user.firstName,
            googleId: user.googleID,
          },
          process.env.JWT_SECRET_KEY,
          { expiresIn: '15m' }
        );

        const refreshToken = jwt.sign(
          {
            userId: user._id,
            email: user.email,
            firstName: user.firstName,
            googleId: user.googleID,
          },
          process.env.JWT_REFRESH_KEY,
          {expiresIn:'7d'}
        )
    
        res
        .cookie('token', accessToken, {
          httpOnly: true,
        })
        .cookie('refreshToken',refreshToken,{httpOnly:true})
    
        res.redirect('/');
      } catch (err) {
        console.error('Google Auth Callback error', err);
        res.redirect('/user/login');
      }
    
    }]


// ------------------------------------------
//  Helper functions
// ------------------------------------------

async function creditWallet(userId,amount,reason,orderId){
  console.log('Call recieved in credit wallet helper function');
  try {
      let userName;
      try {
        const user=await User.findOne({_id:orderId});
        if(user){
          userName=user.firstName;
        }
      } catch (error) {
        console.log('this is not a refereral');
      }
    const wallet = await Wallet.findOne({userId})
    if(!wallet){
      throw new Error('Wallet Not Found, Login Again')
    }
    const newBalance = wallet.balance+amount;
    wallet.balance=newBalance;
    await wallet.save();

    await WalletTransaction.create({
      walletId: wallet._id,
      type: "credit",
      amount,
      reason,
      userName,
      orderId,
      balanceAfter: newBalance
    })
  } catch (error) {
    console.log('Error in creditWallet helper function',error);
  }
}









export default {
  getUserHome,
  getSignUp,
  postSignUp,
  postLogin,
  getLogout,
  getLogin,
  getOtp,
  postOtp,
  resendOtp,
  getOtpSuccess,
  getForgotPassword,
  postForgotPassword,
  getVerifyOtp,
  postVerifyOtp,
  getResetPassword,
  postResetPassword,
  getGoogleAuth,
  getGoogleAuthCallBack,
};
