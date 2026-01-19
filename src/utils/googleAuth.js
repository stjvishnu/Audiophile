import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../models/userModel.js'
import dotenv from 'dotenv'

dotenv.config();

passport.use( new GoogleStrategy({
  clientID: process.env.clientID,
  clientSecret: process.env.clientSecret,
  callbackURL: process.env.callbackURL,
  passReqToCallback: true,
  
},async(request,acessToken,refreshToken,profile,done)=>{
  try{
    //extracting email from the profile
    const email = profile.emails[0].value;

    //check if user exist

    let user = await User.findOne({email})
    if(!user){
      user = new User({
        firstName : profile.displayName.split(' ')[0] || 'unknown',
        lastName : profile.displayName.split(' ')[1] || 'unknown',
        email: profile.emails[0].value,
        mobile: null,
        password: null,
        googleID: profile.id,
      })
      await user.save();
      const newReferralCode = user.firstName.slice(0,3).toUpperCase()+user._id.toString().slice(-5).toUpperCase();
      user.referralCode=newReferralCode;
      await newUser.save();
    }

   return done(null,user)
  }
  catch(err){
    console.error('Google strategy error:', err);
    return done(err, null);
  }
}))

export default passport