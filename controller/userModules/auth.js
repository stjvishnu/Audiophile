import User from "../../models/userModel.js";
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"


/*╔══════════════════════╗
  ║    SIGNUP-LOGIC      ║
  ╚══════════════════════╝*/

// ------------------------------------------
// SignUp - Get
// ------------------------------------------

const getSignUp =(req,res)=>{
  try{
    res.render('user/signup.ejs',{title:"SignUP",layout:'layouts/user-layout'})
    
  }
  catch(err){
    console.error("Error in getLogin",err);
    res.status(500).json({error:"Internal Server error"})
  }
}
// ------------------------------------------
// SignUp - Post
// ------------------------------------------

const postSignUp=async (req,res)=>{
  console.log(req.body)
  const {firstName,lastName,email,mobile,password,confirmPassword}=req.body;
try{

  //check if password and confirm password matches 
  if(!password == confirmPassword){
    res.send("Password Miss matches")
  }

  //check if a user already exist using email id

   const userExist= await User.findOne({email});
   if(userExist){
    return res.send("user already exist");
   } 

   //hash password
   const hashedPassword = await bcrypt.hash(password,10);

   //create new user
    const newUser=new User({  //create a instance of user model and save temparory in memory
      firstName,
      lastName,
      email,
      mobile,
      password : hashedPassword,
    })

    await newUser.save(); //newUser document is saved to database

    //
   res.render('user/login.ejs',{title:'login'})
}catch(err){
  console.error("Error in user signup",err)
}
}

/*╔══════════════════════╗
  ║     LOGIN-LOGIC      ║
  ╚══════════════════════╝*/


// ------------------------------------------
// Login - Get
// ------------------------------------------

const getLogin= async (req,res)=>{
  res.render('user/login.ejs')
}
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

const postLogin = async (req,res)=>{
  try{
    const email = req.body.email;
    const password = req.body.password;
    const user = await User.findOne({email})

    if(!user){
      return res.json({
        success:false,
        message:'Invalid credentials'});
    }

    const isPasswordMatch = await bcrypt.compare(password,user.password);

    if(!isPasswordMatch){
      return res.status(400).json({
        success:false,
        message:"password is incorrect"
      })
    }

    const accessToken = jwt.sign({
      userId: user._id,
      email: user.email,
    },process.env.JWT_SECRET_KEY,{expiresIn:'1hr'})
    
   res.cookie("Token",accessToken,{httpOnly: true,secure: true})
   .redirect('/')
  }
  catch(err){
    console.error("Error in postLogin",err);
    res.status(500).json({error:"Internal Server error"})
  }
};




const getHome = async(req,res)=>{
  res.render('user/home.ejs');
}



// ------------------------------------------
// Exporting All The Auth Controller Logics
// ------------------------------------------

export default {
  getSignUp,
  postSignUp,
  postLogin,
  getLogin,
  getHome,
}

