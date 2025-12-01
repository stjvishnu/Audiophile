import User from '../../models/userModel.js'
import Address from '../../models/addressModel.js'
import {HTTP_STATUS,RESPONSE_MESSAGES} from '../../utils/constants.js'
import bcrypt from "bcrypt";
import otpHelper from "../../utils/otp-helper.js";
import emailSender from "../../utils/emailSender.js";
import jwt from "jsonwebtoken";


const getProfile = async (req,res)=>{ 
  console.log(req.user)
  

  try{
    if(!req.user){
      res.status(HTTP_STATUS.UNAUTHORIZED).json({message:RESPONSE_MESSAGES.UNAUTHORIZED,customMessage:'Please re-login to continue'})
    }
    const addresses = await Address.find({userId:req.user})
    const user=await User.findById(req.user);
    console.log('user',user);
    let googleAuthUser=null;
    if(user.googleID){
       googleAuthUser=true;
    }
    res.render('user/profile',{user,addresses,googleAuthUser})
  }catch(err){
    console.log('Error in get profile controller',err);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({message:RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR})
  }
}




const postProfile = async (req,res)=>{
console.log('Call inside postProfil controller');
  try{
    const{firstName,lastName,email,mobile}=req.body;
    console.log(req.body);
    console.log(req.file)
    
  const user=await User.findById(req.user);

  if (!user) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({ message:RESPONSE_MESSAGES.BAD_REQUEST});
  }

  let hashedNewPassword;
  const { currentPassword, newPassword, confirmPassword } = req.body;
  if(currentPassword && newPassword && confirmPassword){
    console.log('Curretpass',currentPassword);
      const isPasswordMatch =await bcrypt.compare(currentPassword,user.password)


      if (!isPasswordMatch) {
        return res.status(400).json({ message: RESPONSE_MESSAGES.BAD_REQUEST, customMessage: 'Incorrect current password' });
      }

      if(currentPassword===newPassword){
        return res.status(HTTP_STATUS.BAD_REQUEST).json({ message: RESPONSE_MESSAGES.BAD_REQUEST, customMessage: 'Current password and New password can"t be the same' });

      }

      if (newPassword !== confirmPassword) {
        return res.status(400).json({ message: RESPONSE_MESSAGES.BAD_REQUEST, customMessage: 'New password and confirmation password do not match' });
      }
       hashedNewPassword = await bcrypt.hash(newPassword, 10);
      user.password=hashedNewPassword;
  }


  const imagePath = req.file ? req.file.path : user.profileImg;

 
  
  user.firstName=firstName || user.firstName;
  user.lastName=lastName || user.lastName;
  user.email=email || user.email;
  user.mobile=mobile || user.mobile;
  user.password=hashedNewPassword||user.password;
  user.profileImg=imagePath;


  await user.save();
 
  res.status(HTTP_STATUS.OK).json({message:RESPONSE_MESSAGES.OK,customMessage:'Profile Updated Successfully',user})
  }catch(err){
    console.log('Error in post profile controller',err);
    return res.status(400).json({ message: RESPONSE_MESSAGES.BAD_REQUEST});
  }
  
}
  

const postRequestEmailChange = async (req,res)=>{
  console.log('Call inside postRequestEmailChange controller',req.body);
  try{
    const profileInformation = { ...req.body };
    
  
    if(!profileInformation.userEmail) return res.status(HTTP_STATUS.BAD_REQUEST).json({message:RESPONSE_MESSAGES.BAD_REQUEST})
    const user = await User.findById(req.user)
    if(!user) return res.status(HTTP_STATUS.BAD_REQUEST).json({message:RESPONSE_MESSAGES.BAD_REQUEST})

    console.log('profilejnjn',profileInformation);
    let hashedNewPassword;
    if(profileInformation.currentPassword && profileInformation.newPassword && profileInformation.confirmPassword){
      
        const isPasswordMatch =await bcrypt.compare(profileInformation.currentPassword,user.password)
      console.log(isPasswordMatch);
      console.log(profileInformation.currentPassword);
  
        if (!isPasswordMatch) {
          return res.status(400).json({ message: RESPONSE_MESSAGES.BAD_REQUEST, customMessage: 'Incorrect current password' });
        }

        if (profileInformation.currentPassword === profileInformation.newPassword) {
          return res.status(HTTP_STATUS.BAD_REQUEST).json({ message: RESPONSE_MESSAGES.BAD_REQUEST, customMessage: 'Current password and New password can"t be the same' });
        }
  
        if (profileInformation.newPassword !== profileInformation.confirmPassword) {
          return res.status(400).json({ message: RESPONSE_MESSAGES.BAD_REQUEST, customMessage: 'New password and confirmation password do not match' });
        }
         hashedNewPassword = await bcrypt.hash(profileInformation.newPassword, 10);
        user.password=hashedNewPassword;
    }
  

    const imagePath = req.file ? req.file.path : user.profileImg;
    profileInformation.profileImg=imagePath;

    profileInformation.password=hashedNewPassword || user.password;

    const otp = otpHelper.generateOtp();
    const otpExpiry = otpHelper.otpExpiry();
    
    const profileEmailUpdateToken = jwt.sign(
      {
        profileInformation,
        otp,
        otpExpiry,
      },
      process.env.JWT_SECRET_KEY,
      {
        expiresIn: "10m",
      }
    );

    await emailSender.sendOtpMail(profileInformation.userEmail,otp)

    res.cookie('profileEmailUpdateToken',profileEmailUpdateToken,{httpOnly:true})
    
    res.status(HTTP_STATUS.OK).json({ 
      message: "OTP Sent", 
      redirectUrl: "/user/profile/send-otp" 
  });

  }catch(err){
    console.log('Error in postRequestEmailChange',err);
    return res.status(HTTP_STATUS.BAD_REQUEST).json({message:RESPONSE_MESSAGES.BAD_REQUEST})
  }
}

const profileGetOtp = (req, res) => {
  try {
    console.log('Call inside ProfileGetOtp');
    const token = req.cookies.profileEmailUpdateToken;
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    console.log('decoded',decoded);
  
    const email = decoded.profileInformation.userEmail;
    console.log('Rendering Otp page now.....');
    res.render("user/otp.ejs", {
      email,
      title:'Verify Email Change',
      formAction :'/user/profile/verify-email-change',
      backLinkHref:'/user/profile',
      backLinkText:'Back to Profile',
      resendHref:'/user/profile/re-send-otp'
    });
  } catch (err) {
    console.log("Error in get Otp", err);
    res.redirect('/user/profile')
  }
};

const profileResentOtp = async (req,res)=>{
  try{
    console.log('Call inside profileResentOtp');
    console.log(req.body);
    const email = req.body.email;
    const token = req.cookies.profileEmailUpdateToken;
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    const otp = otpHelper.generateOtp();
    const otpExpiry = otpHelper.otpExpiry();
    const {iat,exp,...payload} = decoded;
    payload.otp=otp;
    payload.otpExpiry=otpExpiry
    await emailSender.sendOtpMail(email, otp);
    let newProfileEmailUpdateToken=jwt.sign(payload,process.env.JWT_SECRET_KEY,{expiresIn:'10m'});
    res.clearCookie(token);
    res.cookie('profileEmailUpdateToken',newProfileEmailUpdateToken,{httpOnly:true})
    res.status(HTTP_STATUS.OK).render('user/otp.ejs',{
      email,
      title:'Verify Email Change',
      formAction :'/user/profile/verify-email-change',
      backLinkHref:'/user/profile',
      backLinkText:'Back to Profile',
      resendHref:'/user/profile/re-send-otp'
    })
  }catch(err){
    console.log('Error in profileResentOtp controller',err);
    return res.status(HTTP_STATUS.OK).json({ message: RESPONSE_MESSAGES.BAD_REQUEST});
  }
}




  
const postRequestPasswordChange = async (req,res)=>{
  console.log('Hi');
}

///Here I want to incorporate profile image change tomorrow,first task 

  
const postVerifyEmailChange = async (req,res)=>{
  console.log('Call recieved inside postVerifyEmailChange controller');
  try{
    const { email, otp } = req.body;
    console.log('At start',req.body);
    const {profileEmailUpdateToken} = req.cookies
    console.log('profileEmailUpdate',profileEmailUpdateToken);
    const decoded = jwt.verify(profileEmailUpdateToken,process.env.JWT_SECRET_KEY)
    console.log('jello');
    console.log('decode',decoded);
    
       // Validate input
       if (!otp) {
        return res.status(HTTP_STATUS.BAD_REQUEST)
          .render("user/otp.ejs", {
          error: "OTP required",
          email:email,
          title:'Verify Email Change',
          formAction :'/user/profile/verify-email-change',
          backLinkHref:'/user/profile',
          backLinkText:'Back to Profile'
        });
      }
  
      // Check OTP status
      if (!decoded.otp) {
        return res.status(HTTP_STATUS.BAD_REQUEST).
        render("user/otp.ejs", {
          error: "OTP not generated for the user",
          email:email,
          title:'Verify Email Change',
          formAction :'/user/profile/verify-email-change',
          backLinkHref:'/user/profile',
          backLinkText:'Back to Profile'
        });
      }
  
      if (decoded.otpExpiry < Date.now()) {
        return res.status(HTTP_STATUS.BAD_REQUEST) .render("user/otp.ejs", {
          error: "OTP expired",
          email:email,
          title:'Verify Email Change',
          formAction :'/user/profile/verify-email-change',
          backLinkHref:'/user/profile',
          backLinkText:'Back to Profile'
        });
      }

        if (decoded.otp!=otp) {
          return res.status(HTTP_STATUS.BAD_REQUEST).
          render("user/otp.ejs", {
               error: "OTP expired",
               email:email,
               title:'Verify Email Change',
               formAction :'/user/profile/verify-email-change',
               backLinkHref:'/user/profile',
               backLinkText:'Back to Profile'
             });
      }

      console.log(decoded.profileInformation.newPassword);
      const user = await User.findById(req.user);
      
      user.email=decoded.profileInformation.newEmail;
      user.firstName=decoded.profileInformation.firstName;
      user.lastName=decoded.profileInformation.lastName;
      user.mobile=decoded.profileInformation.mobile;
      user.password=decoded.profileInformation.password;
      user.profileImg=decoded.profileInformation.profileImg;
      await user.save()
      const params = new URLSearchParams({
        toastType: 'success',
        toastMessage: 'Profile Updated Successfully'
      });
      res.status(HTTP_STATUS.OK).redirect(`/user/profile?${params.toString()}`)
    
      console.log(req.body)

  }catch(err){
    console.log('Error happend in postverifychallenge',err);
    const params = new URLSearchParams({
      toastType: 'error',
      toastMessage: 'An error occured updating your Profile'
    });
    res.status(HTTP_STATUS.BAD_REQUEST).redirect(`/user/profile?${params.toString()}`)
  }
}


  
const postVerifyPasswordChange = async (req,res)=>{
  console.log('call inside ');
}


  


export default{
  getProfile,
  postProfile,
  postRequestEmailChange,
  postRequestPasswordChange,
  postVerifyEmailChange,
  postVerifyPasswordChange,
  profileGetOtp,
  profileResentOtp
}