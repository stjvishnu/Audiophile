import jwt from 'jsonwebtoken';
import Category from "../models/categoryModel.js"
import dotenv from 'dotenv';
dotenv.config()

//protector login
const isLogin = async (req,res,next)=>{
  try{
    const token = req.cookies.token;
    
    if(!token){
      return res.redirect('/user/login')
    }

    const verifyToken =  jwt.verify(token,process.env.JWT_SECRET_KEY);
    
    req.user=verifyToken.userId;
    next();
  }
  catch(err){
    console.log('Error occured while user authentcating middleware',err)
    res.redirect('/user/login')
  }
}

//prevent login if authenticated
const authLogin = (req,res,next)=>{
  try{
    const token = req.cookies.token;

    if(token){
   const verifyToken = jwt.verify(token,process.env.JWT_SECRET_KEY);
    req.user=verifyToken.userId
    if(req.user){
      return res.redirect('/')
    }
    
  }
  next(); // no token → allow to see login page
}
  catch(err){
    console.log("Error in auth login",err);
    next(); // if token invalid, allow login page
  }
}


// categories middlewares

const setCategories = async(req,res,next)=>{
  try{
    const categories = await Category.find()
    res.locals.categories = categories;
    next();
  }
  catch(err){
    console.error("Error in fetching Categories",err);
    next();
  }
}

export default{
  isLogin,
  authLogin,
  setCategories

}