import User from "../../models/userModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import otpGenerator from "otp-generator";
import otpHelper from "../../utils/otp-helper.js";
import emailSender from "../../utils/emailSender.js";
import passport from "../../utils/googleAuth.js";

/*╔══════════════════════╗
  ║    SIGNUP-LOGIC      ║
  ╚══════════════════════╝*/

// ------------------------------------------
// SignUp - Get
// ------------------------------------------

const getSignUp = (req, res) => {
  try {
    res.render("user/signup.ejs", {
      title: "SignUP",
      layout: "layouts/user-layout",
    });
  } catch (err) {
    console.error("Error in getLogin", err);
    res.status(500).json({
      error: "Internal Server error",
    });
  }
};
// ------------------------------------------
// SignUp - Post
// ------------------------------------------

const postSignUp = async (req, res) => {
  console.log(req.body);
  const { firstName, lastName, email, mobile, password, confirmPassword } =
    req.body;
  try {
    //check if password and confirm password matches
    if (password !== confirmPassword) {
      return res.send("Password Miss matches");
    }

    //check if a user already exist using email id

    const userExist = await User.findOne({
      email,
    });
    //  if(userExist){
    //   return res.send("user already exist");
    //  } //this should be uncomment later

    //hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const otp = otpHelper.generateOtp();
    const otpExpiry = otpHelper.otpExpiry();

    console.log(otp);

    //create new user
    const payLoad = {
      //create a instance of user model and save temparory in memory
      firstName,
      lastName,
      email,
      mobile,
      password: hashedPassword,
      otp,
      otpExpiry,
    };

    await emailSender.sendOtpMail(email, otp);

    let tempData;
    try {
      tempData = jwt.sign(payLoad, process.env.JWT_SECRET_KEY, {
        expiresIn: "10m",
      });
    } catch (err) {
      console.log("Error in genrating token", err);
    }

    res
      .cookie("tempData", tempData, {
        httpOnly: true,
      })
      .redirect("/user/send-otp");
    //  res.render('user/login.ejs',{title:'login'})
  } catch (err) {
    console.error("Error in user signup", err);
  }
};

/*╔══════════════════════╗
  ║      OTP-LOGIC       ║
  ╚══════════════════════╝*/

// ------------------------------------------
// OTP - Get
// ------------------------------------------

const getOtp = (req, res) => {
  try {
    const token = req.cookies.tempData;
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    const email = decoded.email;
    console.log("Email debug in get otp: ", email);
    res.render("user/otp.ejs", {
      email,
    });
  } catch (err) {
    console.log("Error in get Otp", err);
  }
};

// ------------------------------------------
// OTP - Post
// ------------------------------------------

const postOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    console.log("OTP Verification Attempt:", {
      email,
      otp,
    });
    const token = req.cookies.tempData;
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

    // Validate input
    if (!otp) {
      return res.status(400).render("user/otp.ejs", {
        error: "OTP required",
        email,
      });
    }

    // Check OTP status
    if (!decoded.otp) {
      return res.status(400).render("user/otp.ejs", {
        error: "OTP not generated for the user",
        email,
      });
    }

    if (decoded.otpExpiry < Date.now()) {
      return res.status(400).render("user/otp.ejs", {
        error: "OTP expired",
        email,
      });
    }

    if (decoded.otp !== otp) {
      return res.status(400).render("user/otp.ejs", {
        error: "Invalid OTP",
        email,
      });
    }

    const newUser = new User({
      firstName: decoded.firstName,
      lastName: decoded.lastName,
      email: decoded.email,
      mobile: decoded.mobile,
      password: decoded.password,
    });

    await newUser.save();
    res.clearCookie("tempData");

    // Successful verification
    return res.redirect("/user/otpSuccess");
  } catch (err) {
    console.error("Error in OTP verification:", err);
    return res.status(500).render("user/otp.ejs", {
      error: "Internal Server Error",
    });
  }
};

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
  res.render("user/forgot-password.ejs");
};

// ------------------------------------------
// Forgot-Password  - Post
// ------------------------------------------

const postForgotPassword = async (req, res) => {
  const email = req.body.email;
  try {
    const user = await User.findOne({
      email,
    });

    if (!user) {
      return res.status(404).render("user/forgot-password.ejs", {
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
    ////////
    console.log(forgotToken);
    ////////

    await emailSender.sendOtpMail(email, otp);
    res
      .cookie("forgotToken", forgotToken, {
        httpOnly: true,
      })
      .redirect(`/user/verify-otp`);
  } catch (err) {
    console.log("Error in post forgot password", err);
    res.status(404).render("user/forgot-password.ejs", {
      error: "An error occured please try again",
    });
  }
};

const getVerifyOtp = (req, res) => {
  const token = req.cookies.forgotToken;
  const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
  const email = decoded.email;
  res.render("user/verify-otp.ejs", {
    email,
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
    console.log("Email from postResetPassword", email);
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
 * @des Authenticate user and returns jwt token\
 * @route POST /user/login
 * @param {object} req - Express request object (xpects emal,password)
 * @param {object} res - Express response object
 * @returns {void} Sets JWT token in HTTP-Only cookie and redirect on success
 * @throws {401} If credentials are invalid
 * @throws {500} If server error ccurso
 */

const postLogin = async (req, res) => {
  try {
    const email = req.body.email;
    const password = req.body.password;
    console.log(email, password);
    const user = await User.findOne({
      email,
    });

    if (!user) {
      return res.json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const isPasswordMatch = await bcrypt.compare(password, user.password);

    if (!isPasswordMatch) {
      return res.status(400).json({
        success: false,
        message: "password is incorrect",
      });
    }

    const accessToken = jwt.sign(
      {
        userId: user._id,
        email: user.email,
        name: user.firstName,
      },
      process.env.JWT_SECRET_KEY,
      {
        expiresIn: "1hr",
      }
    );
    console.log(accessToken);

    res
      .cookie("token", accessToken, {
        httpOnly: true,
        secure: false,
        maxAge: 60 * 60 * 1000,
      })
      .redirect("/");
  } catch (err) {
    console.error("Error in postLogin", err);
    res.status(500).json({
      error: "Internal Server error",
    });
  }
};

const getLogout = (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: false,
  });
  res.redirect("/user/login");
};

const getHome = async (req, res) => {
  try {
    const token = req.cookies.token;
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
      let name = decoded.name;
      res.locals.user = {
        name,
      };
    }
    res.render("user/home.ejs");
  } catch (err) {
    console.log("Error Getting Home", err);
    res.render("user/home.ejs");
  }
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
    
        const token = jwt.sign(
          {
            email: user.email,
            name: user.firstName,
            googleId: user.googleID,
          },
          process.env.JWT_SECRET_KEY,
          { expiresIn: '1hr' }
        );
    
        res.cookie('token', token, {
          httpOnly: true,
        });
    
        res.redirect('/');
      } catch (err) {
        console.error('Google Auth Callback error', err);
        res.redirect('/user/login');
      }
    
    }]


// ------------------------------------------
// Exporting All The Auth Controller Logics
// ------------------------------------------

export default {
  getSignUp,
  postSignUp,
  postLogin,
  getLogout,
  getLogin,
  getHome,
  getOtp,
  postOtp,
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
