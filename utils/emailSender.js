
import dotenv from "dotenv";
dotenv.config();
import nodeMailer from "nodemailer"

const transporter = nodeMailer.createTransport({
  //credentials
  service: "gmail",
  auth:{
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  }
})

//transporter- a configuration object with credentials that has a method like sendMail to send mail


//Function to send otp mail
const sendOtpMail = async(email,otp)=>{

  //mailOptions - object describing the mail content
   try{
    const mailOptions={
      from: 'applicationtestinglab@gmail.com',
      to: `${email}`,
      subject: 'Verification',
      html:  `<h1>OTP: ${otp}</h1>`
    }
    await transporter.sendMail(mailOptions);
    console.log("otp send successfully")
   }
   
   catch(err){
    console.log('Error sending otp', err)
   }
}

 export default {sendOtpMail};