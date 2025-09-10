import otpGenerator from "otp-generator";

//Generate a 6-digit otp
const generateOtp = ()=>{
  return otpGenerator.generate(6,{
    digits:true,
    lowerCaseAlphabets:false,
    upperCaseAlphabets:false,
    specialChars:false,
  });
};


/**
 * Returns the expiry timestamp for an OTP.
 * Date.now() ->current time in milli sec
 * Date.now() + 1 min -> Exact 1 min in future.
 * The expiry time is set to 1 minute (60,000 ms) from the current time.
 *
 * @returns {number} A future timestamp in milliseconds when the OTP will expire.
 */

const otpExpiry = ()=>{
  return Date.now()+5*60*1000 //5 minutes in milli seconds
}

export default{
  generateOtp,
  otpExpiry
}