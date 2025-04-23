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

const otpExpiry = ()=>{
  return Date.now()+5*60*1000 //5 minutes in milli seconds
}

export default{
  generateOtp,
  otpExpiry
}